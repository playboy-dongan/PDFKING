import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const runId = `${Date.now()}-${process.pid}`;
const e2eRoot = path.join(tmpdir(), 'pdfking-e2e');
const tmpDir = path.join(e2eRoot, runId);
const downloadDir = path.join(tmpDir, 'downloads');
const chromeProfileDir = path.join(tmpDir, 'chrome-profile');
const devPort = Number(process.env.PDFKING_E2E_DEV_PORT ?? String(4400 + Math.floor(Math.random() * 400)));
const baseUrl = process.env.PDFKING_E2E_BASE_URL ?? `http://127.0.0.1:${devPort}`;
const chromeDebugPort = Number(
	process.env.PDFKING_CHROME_DEBUG_PORT ?? String(9300 + Math.floor(Math.random() * 400)),
);
const chromePath =
	process.env.CHROME_PATH ??
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testResults = [];
const logPath = path.join(e2eRoot, 'e2e-last.log');

mkdirSync(path.dirname(logPath), { recursive: true });
writeFileSync(logPath, '');

function log(message) {
	const line = `[e2e] ${message}`;
	console.log(line);
	appendFileSync(logPath, `${line}\n`);
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUrl(url, timeoutMs = 30000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok) return true;
		} catch {}
		await delay(500);
	}
	return false;
}

async function fetchJson(url, options = {}, timeoutMs = 30000) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, { ...options, signal: controller.signal });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} for ${url}`);
		}
		return await response.json();
	} finally {
		clearTimeout(timeout);
	}
}

function spawnProcess(command, args, options = {}) {
	const child = spawn(command, args, {
		cwd: root,
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true,
		...options,
	});
	child.stdout?.on('data', (data) => {
		if (process.env.PDFKING_E2E_VERBOSE) process.stdout.write(data);
	});
	child.stderr?.on('data', (data) => {
		if (process.env.PDFKING_E2E_VERBOSE) process.stderr.write(data);
	});
	return child;
}

function killProcessTree(child) {
	if (!child?.pid) return;
	if (process.platform === 'win32') {
		spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
		return;
	}
	child.kill('SIGTERM');
}

async function ensureServer() {
	if (await waitForUrl(baseUrl, 3000)) {
		return null;
	}

	const port = new URL(baseUrl).port || String(devPort);
	const serverCommand = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
	const serverArgs =
		process.platform === 'win32'
			? ['/d', '/s', '/c', 'npm.cmd', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', port]
			: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', port];
	const server = spawnProcess(serverCommand, serverArgs);
	const ready = await waitForUrl(baseUrl, 45000);
	if (!ready) {
		server.kill();
		throw new Error(`Dev server did not start at ${baseUrl}`);
	}
	return server;
}

async function generatePdf(filePath, label, pageCount = 4) {
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.HelveticaBold);
	const regular = await pdf.embedFont(StandardFonts.Helvetica);

	for (let index = 0; index < pageCount; index += 1) {
		const page = pdf.addPage([595, 842]);
		page.drawText(`${label} page ${index + 1}`, {
			x: 72,
			y: 720,
			size: 28,
			font,
			color: rgb(0.08, 0.16, 0.32),
		});
		page.drawText('PDFKING end-to-end test document with selectable text.', {
			x: 72,
			y: 675,
			size: 15,
			font: regular,
			color: rgb(0.22, 0.28, 0.38),
		});
	}

	await writeFile(filePath, await pdf.save());
}

async function generateDocx(filePath) {
	const document = new Document({
		sections: [
			{
				children: [
					new Paragraph({
						children: [new TextRun({ text: 'PDFKING DOCX conversion test', bold: true })],
					}),
					new Paragraph('This document is generated for the Word to PDF tool.'),
				],
			},
		],
	});
	await writeFile(filePath, await Packer.toBuffer(document));
}

async function generateFixtures() {
	await rm(tmpDir, { recursive: true, force: true });
	await mkdir(downloadDir, { recursive: true });
	await mkdir(chromeProfileDir, { recursive: true });

	const fixtures = {
		pdfA: path.join(tmpDir, 'sample-a.pdf'),
		pdfB: path.join(tmpDir, 'sample-b.pdf'),
		docx: path.join(tmpDir, 'sample.docx'),
		protectedPdf: path.join(tmpDir, 'protected.pdf'),
	};
	await generatePdf(fixtures.pdfA, 'Sample A', 4);
	await generatePdf(fixtures.pdfB, 'Sample B', 2);
	await generateDocx(fixtures.docx);
	return fixtures;
}

class CdpClient {
	constructor(wsUrl) {
		this.ws = new WebSocket(wsUrl);
		this.nextId = 1;
		this.pending = new Map();
		this.events = [];
		this.ws.addEventListener('message', (event) => {
			const message = JSON.parse(event.data);
			if (message.id && this.pending.has(message.id)) {
				const { resolve, reject } = this.pending.get(message.id);
				this.pending.delete(message.id);
				if (message.error) reject(new Error(message.error.message));
				else resolve(message.result);
				return;
			}
			this.events.push(message);
		});
	}

	static async connect(wsUrl) {
		const client = new CdpClient(wsUrl);
		await new Promise((resolve, reject) => {
			client.ws.addEventListener('open', resolve, { once: true });
			client.ws.addEventListener('error', reject, { once: true });
		});
		return client;
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		const promise = new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP command timed out: ${method}`));
			}, 30000);
			this.pending.set(id, {
				resolve: (value) => {
					clearTimeout(timeout);
					resolve(value);
				},
				reject: (error) => {
					clearTimeout(timeout);
					reject(error);
				},
			});
		});
		this.ws.send(JSON.stringify({ id, method, params }));
		return promise;
	}

	close() {
		this.ws.close();
	}
}

async function launchChrome() {
	if (!existsSync(chromePath)) {
		throw new Error(`Chrome not found: ${chromePath}`);
	}

	const chrome = spawnProcess(chromePath, [
		'--headless=new',
		'--disable-gpu',
		'--no-first-run',
		'--no-default-browser-check',
		`--remote-debugging-port=${chromeDebugPort}`,
		`--user-data-dir=${chromeProfileDir}`,
		'about:blank',
	]);

	const versionUrl = `http://127.0.0.1:${chromeDebugPort}/json/version`;
	const ready = await waitForUrl(versionUrl, 20000);
	if (!ready) {
		chrome.kill();
		throw new Error('Chrome remote debugging endpoint did not start.');
	}
	const version = await fetchJson(versionUrl);
	const browser = await CdpClient.connect(version.webSocketDebuggerUrl);
	await browser.send('Browser.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath: downloadDir,
	});
	return { chrome, browser };
}

async function openPage(url) {
	log(`Opening ${url}.`);
	const target = await fetchJson(`http://127.0.0.1:${chromeDebugPort}/json/new?${encodeURIComponent(url)}`, {
		method: 'PUT',
	});
	const page = await CdpClient.connect(target.webSocketDebuggerUrl);
	await page.send('Page.enable');
	await page.send('Runtime.enable');
	await page.send('DOM.enable');
	await page.send('Log.enable');
	await page.send('Page.navigate', { url });
	await waitForRuntime(page, 'document.readyState === "complete"', 30000);
	log(`Loaded ${url}.`);
	return page;
}

async function evaluate(page, expression, awaitPromise = false) {
	const result = await page.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true,
	});
	if (result.exceptionDetails) {
		throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed.');
	}
	return result.result.value;
}

async function waitForRuntime(page, expression, timeoutMs = 30000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		const value = await evaluate(page, `Boolean(${expression})`);
		if (value) return true;
		await delay(300);
	}
	throw new Error(`Timed out waiting for: ${expression}`);
}

async function setFiles(page, files) {
	const { root: rootNode } = await page.send('DOM.getDocument');
	const { nodeId } = await page.send('DOM.querySelector', {
		nodeId: rootNode.nodeId,
		selector: '[data-role="file-input"]',
	});
	if (!nodeId) {
		throw new Error('File input not found.');
	}
	await page.send('DOM.setFileInputFiles', { nodeId, files });
	await evaluate(page, `
		(() => {
			const input = document.querySelector('[data-role="file-input"]');
			input.dispatchEvent(new Event('change', { bubbles: true }));
			return input.files.length;
		})()
	`);
}

async function setupFields(page, setup) {
	if (!setup) return;
	for (const [role, value] of Object.entries(setup)) {
		await evaluate(page, `
			(() => {
				const element = document.querySelector('[data-role="${role}"]');
				if (!element) throw new Error('Missing field: ${role}');
				element.value = ${JSON.stringify(value)};
				element.dispatchEvent(new Event('input', { bubbles: true }));
				element.dispatchEvent(new Event('change', { bubbles: true }));
				return true;
			})()
		`);
	}
}

async function waitForDownload(page, timeoutMs = 120000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		const state = await evaluate(page, `
			(() => {
				const link = document.querySelector('[data-role="results"] a[download]');
				const error = document.querySelector('[data-role="results"] .text-rose-700')?.textContent?.trim();
				const status = document.querySelector('[data-role="status"]')?.textContent?.trim();
				return { hasDownload: Boolean(link), download: link?.getAttribute('download'), href: link?.href, error, status };
			})()
		`);
		if (state.error) {
			throw new Error(state.error);
		}
		if (state.hasDownload) {
			const blob = await evaluate(page, `
				(async () => {
					const link = document.querySelector('[data-role="results"] a[download]');
					const blob = await fetch(link.href).then((response) => response.blob());
					const buffer = await blob.arrayBuffer();
					let binary = '';
					const bytes = new Uint8Array(buffer);
					for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
					return { name: link.getAttribute('download'), type: blob.type, size: blob.size, base64: btoa(binary) };
				})()
			`, true);
			if (!blob.size || blob.size < 32) {
				throw new Error(`Generated file is too small: ${blob.size}`);
			}
			return blob;
		}
		await delay(500);
	}
	throw new Error('Timed out waiting for download link.');
}

async function runTool(test) {
	log(`Running ${test.slug}.`);
	const page = await openPage(`${baseUrl}/${test.slug}/`);
	try {
		log(`Uploading files for ${test.slug}.`);
		await setFiles(page, test.files);
		await setupFields(page, test.setup);
		log(`Starting processor for ${test.slug}.`);
		await evaluate(page, `document.querySelector('[data-role="run-button"]').click()`);
		log(`Waiting for output from ${test.slug}.`);
		const result = await waitForDownload(page, test.timeoutMs ?? 45000);
		if (!result.name.endsWith(test.expectedExt)) {
			throw new Error(`Expected ${test.expectedExt}, got ${result.name}`);
		}
		if (test.writeResultTo) {
			await writeFile(test.writeResultTo, Buffer.from(result.base64, 'base64'));
		}
		testResults.push({ slug: test.slug, ok: true, name: result.name, size: result.size });
		log(`PASS ${test.slug}: ${result.name} (${result.size} bytes)`);
	} catch (error) {
		try {
			const state = await evaluate(page, `
				(() => ({
					initialized: document.querySelector('[data-tool-workbench]')?.dataset.initialized,
					fileCount: document.querySelector('[data-role="file-input"]')?.files?.length ?? 0,
					buttonDisabled: Boolean(document.querySelector('[data-role="run-button"]')?.disabled),
					status: document.querySelector('[data-role="status"]')?.textContent?.trim(),
					previewLabel: document.querySelector('[data-role="preview-label"]')?.textContent?.trim(),
					resultsText: document.querySelector('[data-role="results"]')?.textContent?.replace(/\\s+/g, ' ').trim(),
					downloadCount: document.querySelectorAll('[data-role="results"] a[download]').length,
				}))()
			`);
			log(`${test.slug} state: ${JSON.stringify(state)}`);
		} catch (diagnosticError) {
			log(`${test.slug} diagnostics failed: ${diagnosticError.message}`);
		}
		const runtimeEvents = page.events
			.filter((event) => event.method === 'Runtime.exceptionThrown' || event.method === 'Runtime.consoleAPICalled' || event.method === 'Log.entryAdded')
			.slice(-8)
			.map((event) => JSON.stringify(event.params));
		if (runtimeEvents.length) {
			log(`${test.slug} browser events: ${runtimeEvents.join(' | ')}`);
		}
		testResults.push({ slug: test.slug, ok: false, error: error.message });
		log(`FAIL ${test.slug}: ${error.message}`);
	} finally {
		page.close();
	}
}

async function main() {
	log('Generating local test fixtures.');
	const fixtures = await generateFixtures();
	log('Checking Astro dev server.');
	const server = await ensureServer();
	log('Launching headless Chrome.');
	const { chrome, browser } = await launchChrome();
	log('Browser is ready.');

	try {
		await runTool({ slug: 'merge-pdf', files: [fixtures.pdfA, fixtures.pdfB], expectedExt: '.pdf' });
		await runTool({ slug: 'split-pdf', files: [fixtures.pdfA], setup: { ranges: '1-2,3-4' }, expectedExt: '.zip' });
		await runTool({ slug: 'compress-pdf', files: [fixtures.pdfA], expectedExt: '.pdf' });
		await runTool({ slug: 'pdf-to-word', files: [fixtures.pdfA], expectedExt: '.docx' });
		await runTool({ slug: 'word-to-pdf', files: [fixtures.docx], expectedExt: '.pdf' });
		await runTool({ slug: 'ocr-pdf', files: [fixtures.pdfA], setup: { 'ocr-format': 'txt' }, expectedExt: '.txt', timeoutMs: 180000 });
		await runTool({ slug: 'pdf-watermark', files: [fixtures.pdfA], setup: { 'watermark-text': 'PDFKING TEST' }, expectedExt: '.pdf' });
		await runTool({
			slug: 'protect-pdf',
			files: [fixtures.pdfA],
			setup: { 'user-password': 'testpass', 'owner-password': 'ownerpass' },
			expectedExt: '.pdf',
			writeResultTo: fixtures.protectedPdf,
		});
		await runTool({
			slug: 'unlock-pdf',
			files: [fixtures.protectedPdf],
			setup: { 'unlock-password': 'testpass' },
			expectedExt: '.pdf',
		});
		await runTool({ slug: 'rotate-pdf', files: [fixtures.pdfA], setup: { rotation: '90' }, expectedExt: '.pdf' });

		const failed = testResults.filter((result) => !result.ok);
		if (failed.length) {
			log('Failed tools:');
			for (const failure of failed) {
				log(`- ${failure.slug}: ${failure.error}`);
			}
			process.exitCode = 1;
		} else {
			log('All PDFKING tools generated downloadable output.');
		}
	} finally {
		browser.close();
		killProcessTree(chrome);
		if (server) killProcessTree(server);
	}
}

main().catch((error) => {
	log(error.stack ?? error.message);
	process.exit(1);
});

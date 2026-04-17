import { spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const devPort = Number(process.env.PDFKING_E2E_DEV_PORT ?? String(4400 + Math.floor(Math.random() * 400)));
const baseUrl = process.env.PDFKING_E2E_BASE_URL ?? `http://127.0.0.1:${devPort}`;
const chromeDebugPort = Number(process.env.PDFKING_CHROME_DEBUG_PORT ?? String(9300 + Math.floor(Math.random() * 400)));
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const runRoot = await mkdtemp(path.join(tmpdir(), 'pdfking-e2e-'));
const downloadDir = path.join(runRoot, 'downloads');
const sourceSiteNeedle = 'browser' + 'bound';

function log(message) {
	console.log(`[e2e] ${message}`);
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
		await delay(300);
	}
	return false;
}

function spawnProcess(command, args, options = {}) {
	return spawn(command, args, {
		cwd: root,
		stdio: ['ignore', process.env.PDFKING_E2E_VERBOSE ? 'inherit' : 'pipe', process.env.PDFKING_E2E_VERBOSE ? 'inherit' : 'pipe'],
		windowsHide: true,
		...options,
	});
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
	if (await waitForUrl(baseUrl, 3000)) return null;
	const port = new URL(baseUrl).port || String(devPort);
	const serverCommand = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
	const serverArgs =
		process.platform === 'win32'
			? ['/d', '/s', '/c', 'npm.cmd', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', port]
			: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', port];
	const server = spawnProcess(serverCommand, serverArgs);
	if (!(await waitForUrl(baseUrl, 45000))) {
		killProcessTree(server);
		throw new Error(`Dev server did not start at ${baseUrl}`);
	}
	return server;
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
			}, 60000);
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

async function evaluate(page, expression, awaitPromise = false) {
	const result = await page.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true,
	});
	if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed.');
	return result.result.value;
}

async function makePdf(filePath, label) {
	const pdf = await PDFDocument.create();
	const font = await pdf.embedFont(StandardFonts.Helvetica);
	for (let index = 0; index < 2; index += 1) {
		const page = pdf.addPage([595, 842]);
		page.drawText(`${label} page ${index + 1}`, { x: 72, y: 720, size: 24, font });
	}
	await writeFile(filePath, await pdf.save());
}

async function auditDashboardRoutes() {
	log('Auditing all local PDFKING clone links.');
	const dashboardHtml = await fetch(`${baseUrl}/dashboard`).then((response) => response.text());
	const hrefs = [
		...new Set(
			[...dashboardHtml.matchAll(/href="(\/(?:dashboard|help|settings|pdf-tools|image-tools|text-tools|misc-tools)[^"]*)"/g)].map(
				(match) => match[1].replace(/\/$/, ''),
			),
		),
	];
	let index = 0;
	const failures = [];

	async function worker() {
		while (index < hrefs.length) {
			const href = hrefs[index];
			index += 1;
			try {
				const response = await fetch(`${baseUrl}${href}`, { headers: { 'user-agent': 'PDFKING route audit' } });
				if (!response.ok) failures.push({ href, status: response.status });
				if (response.headers.has(`x-${sourceSiteNeedle}-upstream`)) failures.push({ href, error: 'runtime proxy header still present' });
			} catch (error) {
				failures.push({ href, error: error.message });
			}
		}
	}

	await Promise.all(Array.from({ length: 12 }, worker));
	if (failures.length) {
		throw new Error(`Route audit failed: failures=${JSON.stringify(failures.slice(0, 5))}`);
	}
	log(`PASS route audit: ${hrefs.length} local PDFKING clone routes returned 200.`);
}

async function launchChrome() {
	if (!existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
	const chrome = spawnProcess(chromePath, [
		'--headless=new',
		'--disable-gpu',
		'--no-first-run',
		'--no-default-browser-check',
		`--remote-debugging-port=${chromeDebugPort}`,
		`--user-data-dir=${path.join(runRoot, 'chrome-profile')}`,
		'about:blank',
	]);
	if (!(await waitForUrl(`http://127.0.0.1:${chromeDebugPort}/json/version`, 20000))) {
		killProcessTree(chrome);
		throw new Error('Chrome remote debugging endpoint did not start.');
	}
	const version = await fetch(`http://127.0.0.1:${chromeDebugPort}/json/version`).then((response) => response.json());
	const browser = await CdpClient.connect(version.webSocketDebuggerUrl);
	await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir });
	return { chrome, browser };
}

async function openPage(url) {
	const target = await fetch(`http://127.0.0.1:${chromeDebugPort}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then((response) =>
		response.json(),
	);
	const page = await CdpClient.connect(target.webSocketDebuggerUrl);
	for (const method of ['Page.enable', 'Runtime.enable', 'DOM.enable', 'Log.enable', 'Network.enable']) await page.send(method);
	await page.send('Page.navigate', { url });
	const started = Date.now();
	while (Date.now() - started < 30000) {
		if (await evaluate(page, 'document.readyState === "complete"')) return page;
		await delay(300);
	}
	throw new Error(`Page did not finish loading: ${url}`);
}

async function smokeMergePdf() {
	log('Running PDFKING Merge PDF upload/process/download smoke test.');
	await mkdir(downloadDir, { recursive: true });
	const pdfA = path.join(runRoot, 'a.pdf');
	const pdfB = path.join(runRoot, 'b.pdf');
	await makePdf(pdfA, 'A');
	await makePdf(pdfB, 'B');

	const { chrome, browser } = await launchChrome();
	try {
		const page = await openPage(`${baseUrl}/pdf-tools/merge`);
		await delay(3000);
		const pageState = JSON.parse(
			await evaluate(
				page,
				`JSON.stringify({ title: document.title, error: document.body.innerText.includes('Something Went Wrong'), inputs: document.querySelectorAll('input[type=file]').length })`,
			),
		);
		if (pageState.error || pageState.inputs !== 1) throw new Error(`Merge page did not hydrate correctly: ${JSON.stringify(pageState)}`);

		const { root } = await page.send('DOM.getDocument');
		const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type=file]' });
		if (!nodeId) throw new Error('PDFKING merge file input not found.');
		await page.send('DOM.setFileInputFiles', { nodeId, files: [pdfA, pdfB] });
		await evaluate(page, `{ const input = document.querySelector('input[type=file]'); input.dispatchEvent(new Event('change', { bubbles: true })); input.files.length; }`);

		const readyStarted = Date.now();
		while (Date.now() - readyStarted < 60000) {
			const state = JSON.parse(
				await evaluate(
					page,
					`JSON.stringify({ text: document.body.innerText, canMerge: [...document.querySelectorAll('button')].some((button) => /Merge PDF/i.test(button.textContent) && !button.disabled) })`,
				),
			);
			if (!state.text.includes('Processing files') && state.canMerge) break;
			await delay(1000);
		}

		const clickState = await evaluate(
			page,
			`(() => { const button = [...document.querySelectorAll('button')].find((item) => /Merge PDF/i.test(item.textContent) && !item.disabled); if (!button) return false; button.click(); return true; })()`,
		);
		if (!clickState) throw new Error('Merge PDF button was not clickable.');

		const downloadStarted = Date.now();
		let downloaded = [];
		while (Date.now() - downloadStarted < 90000) {
			downloaded = (await readdir(downloadDir)).filter((file) => file.toLowerCase().endsWith('.pdf'));
			if (downloaded.length) break;
			await delay(1000);
		}
		if (!downloaded.length) throw new Error('Merge PDF did not create a downloaded PDF.');
		const outputPath = path.join(downloadDir, downloaded[0]);
		const outputSize = statSync(outputPath).size;
		if (outputSize < 1000) throw new Error(`Downloaded PDF is too small: ${outputSize} bytes.`);
		const remoteRequests = page.events
			.filter((event) => event.method === 'Network.requestWillBeSent')
			.map((event) => event.params?.request?.url)
			.filter((url) => url?.toLowerCase().includes(sourceSiteNeedle));
		if (remoteRequests.length) throw new Error(`Browser made remote source-site requests: ${remoteRequests.slice(0, 5).join(', ')}`);
		log(`PASS merge workflow: ${downloaded[0]} (${outputSize} bytes).`);
		page.close();
	} finally {
		browser.close();
		killProcessTree(chrome);
	}
}

const server = await ensureServer();
try {
	await auditDashboardRoutes();
	await smokeMergePdf();
	log('All static PDFKING clone checks passed.');
} finally {
	if (server) killProcessTree(server);
}

import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'research', 'browserbound-layout');
const chromeProfileDir = path.join(tmpdir(), `pdfking-layout-capture-${Date.now()}-${process.pid}`);
const chromeDebugPort = Number(process.env.PDFKING_CHROME_DEBUG_PORT ?? String(9600 + Math.floor(Math.random() * 300)));
const chromePath =
	process.env.CHROME_PATH ??
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const defaultUrls = [
	'https://www.browserbound.com/dashboard',
	'https://www.browserbound.com/pdf-tools',
	'https://www.browserbound.com/pdf-tools/merge',
	'https://www.browserbound.com/text-tools',
	'https://www.browserbound.com/text-tools/split-text',
];

const urls = process.argv.slice(2).length ? process.argv.slice(2) : defaultUrls;
const viewports = [
	{ name: 'desktop', width: 1440, height: 1100 },
	{ name: 'tablet', width: 768, height: 1000 },
	{ name: 'mobile', width: 390, height: 844 },
];

function log(message) {
	console.log(`[layout] ${message}`);
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function killProcessTree(child) {
	if (!child?.pid) return;
	if (process.platform === 'win32') {
		spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
		return;
	}
	child.kill('SIGTERM');
}

async function fetchJson(url, options = {}, timeoutMs = 30000) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, { ...options, signal: controller.signal });
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		return await response.json();
	} finally {
		clearTimeout(timeout);
	}
}

async function waitForUrl(url, timeoutMs = 30000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		try {
			const response = await fetch(url);
			if (response.ok) return true;
		} catch {}
		await delay(250);
	}
	return false;
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
				const { resolve, reject, timeout } = this.pending.get(message.id);
				clearTimeout(timeout);
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

	send(method, params = {}, timeoutMs = 30000) {
		const id = this.nextId++;
		const promise = new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP command timed out: ${method}`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timeout });
		});
		this.ws.send(JSON.stringify({ id, method, params }));
		return promise;
	}

	close() {
		this.ws.close();
	}
}

async function launchChrome() {
	if (!existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
	const chrome = spawn(chromePath, [
		'--headless=new',
		'--disable-gpu',
		'--no-first-run',
		'--no-default-browser-check',
		`--remote-debugging-port=${chromeDebugPort}`,
		`--user-data-dir=${chromeProfileDir}`,
		'about:blank',
	], {
		cwd: root,
		stdio: ['ignore', 'ignore', 'ignore'],
		windowsHide: true,
	});

	const versionUrl = `http://127.0.0.1:${chromeDebugPort}/json/version`;
	if (!(await waitForUrl(versionUrl, 20000))) {
		killProcessTree(chrome);
		throw new Error('Chrome remote debugging endpoint did not start.');
	}
	const version = await fetchJson(versionUrl);
	return { chrome, browser: await CdpClient.connect(version.webSocketDebuggerUrl) };
}

async function openPage(url, viewport) {
	const target = await fetchJson(`http://127.0.0.1:${chromeDebugPort}/json/new?${encodeURIComponent(url)}`, {
		method: 'PUT',
	});
	const page = await CdpClient.connect(target.webSocketDebuggerUrl);
	await page.send('Page.enable');
	await page.send('Runtime.enable');
	await page.send('DOM.enable');
	await page.send('Emulation.setDeviceMetricsOverride', {
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: 1,
		mobile: viewport.width < 700,
	});
	await page.send('Page.navigate', { url });
	await waitForRuntime(page, 'document.readyState === "complete"', 45000);
	await delay(1500);
	return page;
}

async function evaluate(page, expression, awaitPromise = false) {
	const result = await page.send('Runtime.evaluate', {
		expression,
		awaitPromise,
		returnByValue: true,
	}, 60000);
	if (result.exceptionDetails) {
		throw new Error(result.exceptionDetails.text ?? 'Runtime evaluation failed.');
	}
	return result.result.value;
}

async function waitForRuntime(page, expression, timeoutMs = 30000) {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		if (await evaluate(page, `Boolean(${expression})`)) return true;
		await delay(250);
	}
	throw new Error(`Timed out waiting for ${expression}`);
}

function layoutProbeSource() {
	return String.raw`
(() => {
	const round = (value) => Math.round(Number(value || 0) * 100) / 100;
	const px = (value) => Number.parseFloat(String(value || '0')) || 0;
	const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
	const textLength = (element) => clean(element.textContent).length;
	const radius = (value) => {
		const parsed = px(value);
		return parsed > 999 ? 'pill' : round(parsed);
	};
	const rect = (element) => {
		const box = element.getBoundingClientRect();
		return {
			x: round(box.x),
			y: round(box.y + window.scrollY),
			width: round(box.width),
			height: round(box.height),
		};
	};
	const spacing = (style) => ({
		margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(px),
		padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px),
		gap: px(style.gap),
		rowGap: px(style.rowGap),
		columnGap: px(style.columnGap),
	});
	const elementMetrics = (element) => {
		const style = getComputedStyle(element);
		return {
			tag: element.tagName.toLowerCase(),
			role: element.getAttribute('role') || '',
			textLength: textLength(element),
			box: rect(element),
			display: style.display,
			position: style.position,
			gridTemplateColumns: style.display === 'grid' ? style.gridTemplateColumns : '',
			flexDirection: style.display.includes('flex') ? style.flexDirection : '',
			alignItems: style.alignItems,
			justifyContent: style.justifyContent,
			borderWidth: px(style.borderTopWidth),
			borderRadius: radius(style.borderTopLeftRadius),
			shadow: style.boxShadow === 'none' ? 'none' : 'present',
			fontSize: px(style.fontSize),
			lineHeight: px(style.lineHeight),
			fontWeight: style.fontWeight,
			letterSpacing: px(style.letterSpacing),
			...spacing(style),
			children: element.children.length,
		};
	};
	const isVisible = (element) => {
		const box = element.getBoundingClientRect();
		const style = getComputedStyle(element);
		return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
	};
	const directChildGaps = (element) => {
		const children = Array.from(element.children).filter(isVisible).map((child) => rect(child));
		if (children.length < 2) return [];
		const sameRow = children.every((child) => Math.abs(child.y - children[0].y) < 8);
		const sorted = children.slice().sort((a, b) => sameRow ? a.x - b.x : a.y - b.y);
		return sorted.slice(1).map((child, index) => {
			const previous = sorted[index];
			return round(sameRow ? child.x - (previous.x + previous.width) : child.y - (previous.y + previous.height));
		}).filter((gap) => gap >= 0);
	};
	const main = document.querySelector('main') || document.body;
	const all = Array.from(document.querySelectorAll('body *')).filter(isVisible);
	const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(isVisible).slice(0, 60).map(elementMetrics);
	const typography = headings.concat(
		Array.from(document.querySelectorAll('p,button,a,label,input,textarea,select')).filter(isVisible).slice(0, 40).map(elementMetrics)
	);
	const sections = Array.from(document.querySelectorAll('header, main > *, section, footer')).filter(isVisible).slice(0, 30).map(elementMetrics);
	const layouts = all
		.filter((element) => {
			const style = getComputedStyle(element);
			return (style.display === 'grid' || style.display.includes('flex')) && element.children.length >= 2;
		})
		.slice(0, 40)
		.map((element) => ({ ...elementMetrics(element), childGaps: directChildGaps(element).slice(0, 12) }));
	const cardCandidates = all
		.filter((element) => main.contains(element))
		.filter((element) => {
			const style = getComputedStyle(element);
			const box = element.getBoundingClientRect();
			const isCardSize = box.width >= 150 && box.width <= Math.min(window.innerWidth, 760) && box.height >= 45 && box.height <= 520;
			const hasCardShape = px(style.borderTopLeftRadius) >= 8 || px(style.borderTopWidth) > 0 || style.boxShadow !== 'none';
			const hasStructure = element.children.length >= 1 || ['a', 'button', 'article', 'li'].includes(element.tagName.toLowerCase());
			return isCardSize && hasCardShape && hasStructure;
		})
		.slice(0, 60)
		.map((element) => ({ ...elementMetrics(element), childGaps: directChildGaps(element).slice(0, 8) }));
	const controls = Array.from(document.querySelectorAll('button,a,input,textarea,select,[role="button"]'))
		.filter(isVisible)
		.slice(0, 40)
		.map(elementMetrics);
	const containers = all
		.filter((element) => {
			const box = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return box.width >= Math.min(window.innerWidth - 40, 900) && px(style.paddingLeft) >= 12 && element.children.length >= 1;
		})
		.slice(0, 25)
		.map(elementMetrics);
	return {
		url: location.href,
		titleLength: document.title.length,
		viewport: { width: window.innerWidth, height: window.innerHeight },
		documentHeight: round(document.documentElement.scrollHeight),
		h1Count: Array.from(document.querySelectorAll('h1')).filter(isVisible).length,
		h1TextLengths: Array.from(document.querySelectorAll('h1')).filter(isVisible).map(textLength),
		metaDescriptionLength: (document.querySelector('meta[name="description"]')?.getAttribute('content') || '').length,
		landmarks: {
			header: document.querySelector('header') ? elementMetrics(document.querySelector('header')) : null,
			main: document.querySelector('main') ? elementMetrics(document.querySelector('main')) : null,
			footer: document.querySelector('footer') ? elementMetrics(document.querySelector('footer')) : null,
		},
		headings,
		typography,
		sections,
		layouts,
		cards: cardCandidates,
		controls,
		containers,
	};
})()
`;
}

function makeTable(rows, columns) {
	if (!rows.length) return '_No data captured._\n';
	const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
	const divider = `| ${columns.map(() => '---').join(' | ')} |`;
	const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replaceAll('|', '\\|')).join(' | ')} |`);
	return [header, divider, ...body].join('\n') + '\n';
}

function boxText(box) {
	return box ? `${box.width}x${box.height} @ ${box.x},${box.y}` : '';
}

function spacingText(item) {
	return `p:${item.padding?.join('/')} m:${item.margin?.join('/')} gap:${item.gap}/${item.rowGap}/${item.columnGap}`;
}

function summarizeTokens(captures) {
	const flatten = (key) => captures.flatMap((capture) => capture[key] ?? []);
	const frequency = (values) => {
		const map = new Map();
		for (const value of values.filter((item) => item !== undefined && item !== null && item !== '' && !Number.isNaN(item))) {
			map.set(value, (map.get(value) ?? 0) + 1);
		}
		return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
	};
	return {
		fontSizes: frequency(flatten('typography').map((item) => item.fontSize)),
		lineHeights: frequency(flatten('typography').map((item) => item.lineHeight)),
		cardRadii: frequency(flatten('cards').map((item) => item.borderRadius)),
		gridGaps: frequency(flatten('layouts').map((item) => item.gap || item.columnGap || item.rowGap)),
		containerWidths: frequency(flatten('containers').map((item) => Math.round(item.box.width))),
	};
}

function renderMarkdown(results) {
	const captures = results.flatMap((page) => page.captures);
	const tokens = summarizeTokens(captures);
	const lines = [
		'# BrowserBound Layout Capture',
		'',
		'Scope: layout structure only. The script intentionally excludes colors, images, logos, and brand assets. Use this as spacing/type/layout reference, not as a copy source.',
		'',
		`Captured at: ${new Date().toISOString()}`,
		`Pages: ${results.map((page) => page.url).join(', ')}`,
		'',
		'## Reusable Layout Tokens',
		'',
		'### Frequent Font Sizes',
		makeTable(tokens.fontSizes.map(([value, count]) => ({ value, count })), [
			{ label: 'px', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Frequent Card Radii',
		makeTable(tokens.cardRadii.map(([value, count]) => ({ value, count })), [
			{ label: 'px', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Frequent Layout Gaps',
		makeTable(tokens.gridGaps.map(([value, count]) => ({ value, count })), [
			{ label: 'px', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Frequent Container Widths',
		makeTable(tokens.containerWidths.map(([value, count]) => ({ value, count })), [
			{ label: 'px', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
	];

	for (const page of results) {
		lines.push(`## ${page.url}`, '');
		for (const capture of page.captures) {
			lines.push(`### ${capture.viewportName} ${capture.viewport.width}x${capture.viewport.height}`, '');
			lines.push(`- Title length: ${capture.titleLength}`);
			lines.push(`- H1 count: ${capture.h1Count}; text lengths: ${capture.h1TextLengths.join(', ') || 'none'}`);
			lines.push(`- Document height: ${capture.documentHeight}px`);
			lines.push(`- Header: ${boxText(capture.landmarks.header?.box)}`);
			lines.push(`- Main: ${boxText(capture.landmarks.main?.box)}`);
			lines.push('');
			lines.push('#### Headings');
			lines.push(makeTable(capture.headings.slice(0, 18), [
				{ label: 'tag', value: (row) => row.tag },
				{ label: 'text length', value: (row) => row.textLength },
				{ label: 'box', value: (row) => boxText(row.box) },
				{ label: 'font', value: (row) => `${row.fontSize}/${row.lineHeight}/${row.fontWeight}` },
				{ label: 'spacing', value: spacingText },
			]));
			lines.push('#### Major Sections');
			lines.push(makeTable(capture.sections.slice(0, 18), [
				{ label: 'tag', value: (row) => row.tag },
				{ label: 'box', value: (row) => boxText(row.box) },
				{ label: 'display', value: (row) => row.display },
				{ label: 'spacing', value: spacingText },
				{ label: 'children', value: (row) => row.children },
			]));
			lines.push('#### Grid / Flex Patterns');
			lines.push(makeTable(capture.layouts.slice(0, 18), [
				{ label: 'tag', value: (row) => row.tag },
				{ label: 'box', value: (row) => boxText(row.box) },
				{ label: 'display', value: (row) => row.display },
				{ label: 'columns/flex', value: (row) => row.gridTemplateColumns || row.flexDirection },
				{ label: 'spacing', value: spacingText },
				{ label: 'child gaps', value: (row) => row.childGaps?.join(', ') },
			]));
			lines.push('#### Card Candidates');
			lines.push(makeTable(capture.cards.slice(0, 24), [
				{ label: 'tag', value: (row) => row.tag },
				{ label: 'text length', value: (row) => row.textLength },
				{ label: 'box', value: (row) => boxText(row.box) },
				{ label: 'radius', value: (row) => row.borderRadius },
				{ label: 'spacing', value: spacingText },
				{ label: 'shadow', value: (row) => row.shadow },
			]));
			lines.push('#### Controls / Upload Flow Elements');
			lines.push(makeTable(capture.controls.slice(0, 24), [
				{ label: 'tag', value: (row) => row.tag },
				{ label: 'text length', value: (row) => row.textLength },
				{ label: 'box', value: (row) => boxText(row.box) },
				{ label: 'font', value: (row) => `${row.fontSize}/${row.lineHeight}/${row.fontWeight}` },
				{ label: 'radius', value: (row) => row.borderRadius },
			]));
		}
	}

	return lines.join('\n');
}

async function main() {
	await mkdir(outDir, { recursive: true });
	const { chrome, browser } = await launchChrome();
	const results = [];

	try {
		for (const url of urls) {
			const pageResult = { url, captures: [] };
			for (const viewport of viewports) {
				log(`Capturing ${url} at ${viewport.name}.`);
				const page = await openPage(url, viewport);
				try {
					const capture = await evaluate(page, layoutProbeSource(), true);
					pageResult.captures.push({ viewportName: viewport.name, ...capture });
				} finally {
					page.close();
				}
			}
			results.push(pageResult);
		}
		await writeFile(path.join(outDir, 'browserbound-layout.json'), JSON.stringify({ urls, viewports, results }, null, 2));
		await writeFile(path.join(outDir, 'browserbound-layout.md'), renderMarkdown(results));
		log(`Wrote ${path.join(outDir, 'browserbound-layout.json')}`);
		log(`Wrote ${path.join(outDir, 'browserbound-layout.md')}`);
	} finally {
		browser.close();
		killProcessTree(chrome);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

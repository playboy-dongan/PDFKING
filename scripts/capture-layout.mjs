import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
const siteOrigin = 'https://www.browserbound.com';

const defaultUrls = [
	'https://www.browserbound.com',
	'https://www.browserbound.com/dashboard',
	'https://www.browserbound.com/pdf-tools',
	'https://www.browserbound.com/image-tools',
	'https://www.browserbound.com/text-tools',
	'https://www.browserbound.com/misc-tools',
	'https://www.browserbound.com/help',
	'https://www.browserbound.com/settings',
];

const args = process.argv.slice(2);
const explicitUrls = args.filter((arg) => !arg.startsWith('--'));
const discoverOnly = args.includes('--discover-only');
const sampleMode = args.includes('--sample');
const renderedMode = args.includes('--rendered');
const captureUrlsFromArgs = explicitUrls.length > 0 ? explicitUrls : null;
const viewportFilter = new Set((process.env.PDFKING_CAPTURE_VIEWPORTS ?? 'desktop,tablet,mobile').split(',').map((item) => item.trim()).filter(Boolean));
const detailLevel = process.env.PDFKING_CAPTURE_DETAIL ?? 'compact';
const staticConcurrency = Math.max(1, Number(process.env.PDFKING_STATIC_CAPTURE_CONCURRENCY ?? '4'));
const captureLimits =
	detailLevel === 'full'
		? { headings: 60, typography: 40, sections: 30, layouts: 40, cards: 60, controls: 40, containers: 25 }
		: { headings: 10, typography: 18, sections: 10, layouts: 14, cards: 12, controls: 16, containers: 10 };

const viewports = [
	{ name: 'desktop', width: 1440, height: 1100 },
	{ name: 'tablet', width: 768, height: 1000 },
	{ name: 'mobile', width: 390, height: 844 },
].filter((viewport) => viewportFilter.has(viewport.name));

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

async function fetchText(url, timeoutMs = 30000) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			headers: {
				'user-agent': 'PDFKING layout capture; layout metrics only',
			},
			signal: controller.signal,
		});
		if (!response.ok) {
			return { ok: false, status: response.status, text: '' };
		}
		const contentType = response.headers.get('content-type') ?? '';
		if (!contentType.includes('text/html') && !contentType.includes('xml') && !contentType.includes('text/plain')) {
			return { ok: false, status: response.status, text: '' };
		}
		return { ok: true, status: response.status, text: await response.text() };
	} catch (error) {
		return { ok: false, status: 0, text: '', error: error.message };
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
	await page.send('Page.navigate', { url }, 90000);
	await waitForRuntime(page, 'document.readyState === "complete"', 90000);
	await delay(Number(process.env.PDFKING_CAPTURE_PAGE_SETTLE_MS ?? '350'));
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

function normalizeCaptureUrl(value, base = siteOrigin) {
	try {
		const url = new URL(value, base);
		if (url.origin !== siteOrigin) return null;
		url.hash = '';
		url.search = '';
		if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
		return url.href;
	} catch {
		return null;
	}
}

function shouldCaptureUrl(urlValue) {
	const normalized = normalizeCaptureUrl(urlValue);
	if (!normalized) return false;
	const { pathname } = new URL(normalized);
	if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/admin')) return false;
	if (/\.(png|jpe?g|gif|webp|svg|ico|css|js|mjs|map|json|xml|txt|webmanifest|pdf|zip|woff2?|ttf)$/i.test(pathname)) return false;
	return true;
}

function extractLinks(html, baseUrl) {
	const links = new Set();
	for (const match of html.matchAll(/\bhref=(["'])(.*?)\1/gi)) {
		const href = match[2];
		if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
		const normalized = normalizeCaptureUrl(href, baseUrl);
		if (normalized && shouldCaptureUrl(normalized)) links.add(normalized);
	}
	return links;
}

function extractSitemapUrls(xml) {
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)]
		.map((match) => normalizeCaptureUrl(match[1].trim()))
		.filter((url) => url && shouldCaptureUrl(url));
}

function pageType(urlValue) {
	const { pathname } = new URL(urlValue);
	if (pathname === '/') return 'home';
	if (pathname === '/dashboard') return 'dashboard';
	if (pathname === '/help') return 'help';
	if (pathname === '/settings') return 'settings';
	if (/^\/(pdf-tools|image-tools|text-tools|misc-tools)$/.test(pathname)) return 'category';
	if (pathname.startsWith('/pdf-tools/')) return 'pdf-tool';
	if (pathname.startsWith('/image-tools/')) return 'image-tool';
	if (pathname.startsWith('/text-tools/')) return 'text-tool';
	if (pathname.startsWith('/misc-tools/')) return 'misc-tool';
	return 'other';
}

function urlSortKey(urlValue) {
	const ranks = {
		home: 0,
		dashboard: 1,
		category: 2,
		'pdf-tool': 3,
		'image-tool': 4,
		'text-tool': 5,
		'misc-tool': 6,
		help: 7,
		settings: 8,
		other: 9,
	};
	const type = pageType(urlValue);
	const { pathname } = new URL(urlValue);
	return `${String(ranks[type]).padStart(2, '0')}:${pathname}`;
}

async function discoverSiteUrls() {
	const discovered = new Set(defaultUrls.map((url) => normalizeCaptureUrl(url)).filter(Boolean));
	const visited = new Set();
	const errors = [];

	const sitemap = await fetchText(`${siteOrigin}/sitemap.xml`);
	if (sitemap.ok) {
		for (const url of extractSitemapUrls(sitemap.text)) discovered.add(url);
	}

	const queue = [...discovered].sort((a, b) => urlSortKey(a).localeCompare(urlSortKey(b)));
	while (queue.length) {
		const url = queue.shift();
		if (!url || visited.has(url)) continue;
		visited.add(url);
		const response = await fetchText(url);
		if (!response.ok) {
			errors.push({ url, status: response.status, error: response.error ?? '' });
			continue;
		}
		for (const link of extractLinks(response.text, url)) {
			if (!discovered.has(link)) {
				discovered.add(link);
				queue.push(link);
			}
		}
	}

	const urls = [...discovered].filter(shouldCaptureUrl).sort((a, b) => urlSortKey(a).localeCompare(urlSortKey(b)));
	return { urls, errors };
}

function layoutProbeSource() {
	const limits = JSON.stringify(captureLimits);
	return String.raw`
(() => {
	const limits = ${limits};
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
	const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(isVisible).slice(0, limits.headings).map(elementMetrics);
	const typography = headings.concat(
		Array.from(document.querySelectorAll('p,button,a,label,input,textarea,select')).filter(isVisible).slice(0, limits.typography).map(elementMetrics)
	);
	const sections = Array.from(document.querySelectorAll('header, main > *, section, footer')).filter(isVisible).slice(0, limits.sections).map(elementMetrics);
	const layouts = all
		.filter((element) => {
			const style = getComputedStyle(element);
			return (style.display === 'grid' || style.display.includes('flex')) && element.children.length >= 2;
		})
		.slice(0, limits.layouts)
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
		.slice(0, limits.cards)
		.map((element) => ({ ...elementMetrics(element), childGaps: directChildGaps(element).slice(0, 8) }));
	const controls = Array.from(document.querySelectorAll('button,a,input,textarea,select,[role="button"]'))
		.filter(isVisible)
		.slice(0, limits.controls)
		.map(elementMetrics);
	const containers = all
		.filter((element) => {
			const box = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return box.width >= Math.min(window.innerWidth - 40, 900) && px(style.paddingLeft) >= 12 && element.children.length >= 1;
		})
		.slice(0, limits.containers)
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

function groupUrls(urls) {
	const groups = new Map();
	for (const url of urls) {
		const type = pageType(url);
		if (!groups.has(type)) groups.set(type, []);
		groups.get(type).push(url);
	}
	return [...groups.entries()].sort((a, b) => urlSortKey(a[1][0]).localeCompare(urlSortKey(b[1][0])));
}

function renderCoverageMarkdown(urls, errors = []) {
	const lines = [
		'# BrowserBound Full-Site Capture Coverage',
		'',
		'This file records full-site URL coverage for layout capture. It is a URL inventory only; copied page text, colors, images, logos, and brand assets are intentionally excluded.',
		'',
		`Captured URL count: ${urls.length}`,
		`Generated at: ${new Date().toISOString()}`,
		'',
		'## Counts By Type',
		makeTable(groupUrls(urls).map(([type, items]) => ({ type, count: items.length })), [
			{ label: 'type', value: (row) => row.type },
			{ label: 'count', value: (row) => row.count },
		]),
		'## URLs',
		'',
	];

	for (const [type, items] of groupUrls(urls)) {
		lines.push(`### ${type} (${items.length})`, '');
		for (const url of items) lines.push(`- ${url}`);
		lines.push('');
	}

	if (errors.length) {
		lines.push('## Discovery Fetch Errors', '');
		for (const error of errors) lines.push(`- ${error.status || 'ERR'} ${error.url}`);
	}

	return lines.join('\n');
}

function decodeBasicEntities(value) {
	return String(value || '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function stripTags(value) {
	return String(value || '').replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
}

function cleanText(value) {
	return decodeBasicEntities(stripTags(value)).replace(/\s+/g, ' ').trim();
}

function getAttr(tagSource, name) {
	const unquoted = "[^\\s\"'=<>`]+";
	const regex = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|(${unquoted}))`, 'i');
	const match = String(tagSource || '').match(regex);
	return decodeBasicEntities(match?.[2] ?? match?.[3] ?? match?.[4] ?? '');
}

function extractTitleLength(html) {
	const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
	return cleanText(match?.[1] ?? '').length;
}

function extractMetaDescriptionLength(html) {
	for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
		const tag = match[0];
		const name = getAttr(tag, 'name').toLowerCase();
		const property = getAttr(tag, 'property').toLowerCase();
		if (name === 'description' || property === 'og:description') {
			return getAttr(tag, 'content').replace(/\s+/g, ' ').trim().length;
		}
	}
	return 0;
}

function tagTextLengths(html, tagName, limit = 40) {
	const regex = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
	const lengths = [];
	for (const match of html.matchAll(regex)) {
		lengths.push(cleanText(match[1]).length);
		if (lengths.length >= limit) break;
	}
	return lengths;
}

function countTag(html, tagName) {
	const regex = new RegExp(`<${tagName}\\b`, 'gi');
	return [...html.matchAll(regex)].length;
}

function stripVariants(token) {
	const segments = String(token || '').split(':');
	return segments[segments.length - 1] || '';
}

function tokenVariants(token) {
	const segments = String(token || '').split(':');
	return segments.length > 1 ? segments.slice(0, -1) : [];
}

function isColorToken(token) {
	const core = stripVariants(token);
	const colorNames = '(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current|inherit)';
	if (/^(bg|from|via|to|fill|stroke|accent|caret|decoration|placeholder)-/.test(core)) return true;
	if (new RegExp(`^(border|ring|outline|divide)-${colorNames}(?:-|$)`).test(core)) return true;
	if (new RegExp(`^text-${colorNames}(?:-|$)`).test(core)) return true;
	if (/^(bg|text|border|ring|outline|fill|stroke|from|via|to)-\[(#|rgb|hsl|color:)/i.test(core)) return true;
	return false;
}

function sanitizeToken(token) {
	const value = String(token || '').trim();
	if (!value || value.length > 90) return null;
	if (value.includes('{') || value.includes('}') || value.includes(';')) return null;
	if (isColorToken(value)) return null;
	return value;
}

function splitClassTokens(classValue) {
	return String(classValue || '')
		.split(/\s+/)
		.map(sanitizeToken)
		.filter(Boolean);
}

function categorizeToken(token) {
	const core = stripVariants(token);
	if (/^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(core) || /^(font|leading|tracking)-/.test(core) || core === 'text-balance' || core === 'text-pretty') return 'typography';
	if (/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-/.test(core)) return 'spacing';
	if (/^(w|h|min-w|max-w|min-h|max-h|size)-/.test(core)) return 'sizing';
	if (/^(grid|flex|inline-flex|block|inline-block|hidden|contents|flow-root)$/.test(core)) return 'layout';
	if (/^(grid-cols|grid-rows|col|row|items|justify|content|self|place|order|basis|grow|shrink|overflow|object|aspect|columns)-/.test(core)) return 'layout';
	if (/^(rounded|border|shadow|ring|outline|divide)-/.test(core) || ['rounded', 'border', 'shadow', 'ring', 'outline'].includes(core)) return 'surface';
	if (/^(transition|duration|ease|animate|motion|transform|scale|translate|rotate|opacity)-/.test(core) || ['transition', 'transform'].includes(core)) return 'motion';
	if (tokenVariants(token).some((variant) => /^(sm|md|lg|xl|2xl)$/.test(variant))) return 'responsive';
	return 'other';
}

function topCounts(values, limit = 20) {
	const counts = new Map();
	for (const value of values.filter(Boolean)) {
		counts.set(value, (counts.get(value) ?? 0) + 1);
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, limit)
		.map(([value, count]) => ({ value, count }));
}

function extractOpeningElements(html) {
	const elements = [];
	for (const match of html.matchAll(/<([a-z][a-z0-9:-]*)(\s[^<>]*?)?>/gi)) {
		const tag = match[1].toLowerCase();
		if (tag.startsWith('!') || ['script', 'style', 'meta', 'link'].includes(tag)) continue;
		const source = match[0];
		const classTokens = splitClassTokens(getAttr(source, 'class'));
		elements.push({
			tag,
			source,
			classTokens,
			href: tag === 'a' ? getAttr(source, 'href') : '',
			type: getAttr(source, 'type').toLowerCase(),
			role: getAttr(source, 'role').toLowerCase(),
		});
	}
	return elements;
}

function extractAnchorStats(html, baseUrl) {
	let total = 0;
	let internal = 0;
	let tool = 0;
	let category = 0;
	const internalPaths = [];
	for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
		total += 1;
		const normalized = normalizeCaptureUrl(getAttr(match[0], 'href'), baseUrl);
		if (!normalized) continue;
		internal += 1;
		const { pathname } = new URL(normalized);
		internalPaths.push(pathname || '/');
		if (/^\/(pdf-tools|image-tools|text-tools|misc-tools)\//.test(pathname)) tool += 1;
		if (/^\/(pdf-tools|image-tools|text-tools|misc-tools)$/.test(pathname)) category += 1;
	}
	return {
		total,
		internal,
		tool,
		category,
		topInternalPaths: topCounts(internalPaths, 12),
	};
}

function analyzeElementPatterns(elements) {
	const tagCounts = Object.fromEntries(
		['header', 'main', 'footer', 'nav', 'section', 'article', 'form', 'input', 'button', 'select', 'textarea', 'label', 'details', 'summary'].map((tag) => [
			tag,
			elements.filter((element) => element.tag === tag).length,
		]),
	);
	const classBearing = elements.filter((element) => element.classTokens.length);
	const tokenCategories = {
		typography: [],
		spacing: [],
		layout: [],
		sizing: [],
		surface: [],
		motion: [],
		responsive: [],
	};
	for (const element of classBearing) {
		for (const token of element.classTokens) {
			const category = categorizeToken(token);
			if (tokenCategories[category]) tokenCategories[category].push(token);
			for (const variant of tokenVariants(token)) {
				if (/^(sm|md|lg|xl|2xl)$/.test(variant)) tokenCategories.responsive.push(variant);
			}
		}
	}

	const cardElements = classBearing.filter((element) => {
		const cores = element.classTokens.map(stripVariants);
		const hasShape = cores.some((token) => /^(rounded|border|shadow|ring)/.test(token) || token === 'border');
		const hasSpacing = cores.some((token) => /^(p|px|py|pt|pb|pl|pr)-/.test(token));
		const hasEligibleTag = ['a', 'article', 'li', 'button', 'div'].includes(element.tag);
		return hasShape && hasSpacing && hasEligibleTag;
	});
	const uploadElements = classBearing.filter((element) => {
		if (element.tag === 'input' && element.type === 'file') return true;
		return element.classTokens.some((token) => /upload|drop|file/i.test(token));
	});
	const buttonLikeElements = elements.filter((element) => element.tag === 'button' || element.role === 'button' || (element.tag === 'a' && element.classTokens.some((token) => /^(rounded|px|py|inline-flex|flex)/.test(stripVariants(token)))));

	return {
		tagCounts,
		classStats: {
			classBearingElements: classBearing.length,
			totalClassTokens: classBearing.reduce((sum, element) => sum + element.classTokens.length, 0),
			uniqueClassTokens: new Set(classBearing.flatMap((element) => element.classTokens)).size,
			topTypography: topCounts(tokenCategories.typography, 18),
			topSpacing: topCounts(tokenCategories.spacing, 18),
			topLayout: topCounts(tokenCategories.layout, 18),
			topSizing: topCounts(tokenCategories.sizing, 18),
			topSurface: topCounts(tokenCategories.surface, 18),
			topMotion: topCounts(tokenCategories.motion, 12),
			topResponsive: topCounts(tokenCategories.responsive, 8),
		},
		cardCandidates: {
			count: cardElements.length,
			topTokens: topCounts(cardElements.flatMap((element) => element.classTokens), 20),
		},
		uploadCandidates: {
			count: uploadElements.length,
			topTokens: topCounts(uploadElements.flatMap((element) => element.classTokens), 14),
		},
		buttonLike: {
			count: buttonLikeElements.length,
			topTokens: topCounts(buttonLikeElements.flatMap((element) => element.classTokens), 18),
		},
	};
}

function analyzeStaticHtml(url, status, html) {
	const elements = extractOpeningElements(html);
	const patterns = analyzeElementPatterns(elements);
	const headingLengths = {
		h1: tagTextLengths(html, 'h1'),
		h2: tagTextLengths(html, 'h2'),
		h3: tagTextLengths(html, 'h3'),
	};
	return {
		url,
		type: pageType(url),
		status,
		htmlBytes: Buffer.byteLength(html, 'utf8'),
		titleLength: extractTitleLength(html),
		metaDescriptionLength: extractMetaDescriptionLength(html),
		headings: {
			h1: { count: countTag(html, 'h1'), textLengths: headingLengths.h1 },
			h2: { count: countTag(html, 'h2'), textLengths: headingLengths.h2 },
			h3: { count: countTag(html, 'h3'), textLengths: headingLengths.h3 },
		},
		anchors: extractAnchorStats(html, url),
		landmarkPresence: {
			header: countTag(html, 'header') > 0,
			main: countTag(html, 'main') > 0,
			footer: countTag(html, 'footer') > 0,
			nav: countTag(html, 'nav') > 0,
		},
		...patterns,
	};
}

async function mapLimit(items, limit, mapper) {
	const results = new Array(items.length);
	let nextIndex = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex += 1;
			results[index] = await mapper(items[index], index);
		}
	});
	await Promise.all(workers);
	return results;
}

async function captureStaticLayouts(urls) {
	let completed = 0;
	return await mapLimit(urls, staticConcurrency, async (url, index) => {
		const response = await fetchText(url, 30000);
		completed += 1;
		if (completed === 1 || completed % 25 === 0 || completed === urls.length) {
			log(`HTTP static capture ${completed}/${urls.length}.`);
		}
		if (!response.ok) {
			return {
				url,
				type: pageType(url),
				status: response.status,
				error: response.error || `HTTP ${response.status}`,
			};
		}
		try {
			return analyzeStaticHtml(url, response.status, response.text);
		} catch (error) {
			return {
				url,
				type: pageType(url),
				status: response.status,
				error: error.message,
			};
		}
	});
}

function average(values) {
	const valid = values.filter((value) => Number.isFinite(value));
	if (!valid.length) return 0;
	return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10;
}

function pathLabel(urlValue) {
	try {
		return new URL(urlValue).pathname || '/';
	} catch {
		return urlValue;
	}
}

function summarizeStaticByType(results) {
	const groups = new Map();
	for (const result of results) {
		if (!groups.has(result.type)) groups.set(result.type, []);
		groups.get(result.type).push(result);
	}
	return [...groups.entries()].sort((a, b) => urlSortKey(a[1][0].url).localeCompare(urlSortKey(b[1][0].url))).map(([type, items]) => ({
		type,
		count: items.length,
		ok: items.filter((item) => !item.error).length,
		avgHtmlKb: average(items.filter((item) => !item.error).map((item) => item.htmlBytes / 1024)),
		avgTitleLength: average(items.filter((item) => !item.error).map((item) => item.titleLength)),
		avgDescriptionLength: average(items.filter((item) => !item.error).map((item) => item.metaDescriptionLength)),
		avgH1Count: average(items.filter((item) => !item.error).map((item) => item.headings.h1.count)),
		avgH2Count: average(items.filter((item) => !item.error).map((item) => item.headings.h2.count)),
		avgCards: average(items.filter((item) => !item.error).map((item) => item.cardCandidates.count)),
		avgButtonLike: average(items.filter((item) => !item.error).map((item) => item.buttonLike.count)),
		avgInternalLinks: average(items.filter((item) => !item.error).map((item) => item.anchors.internal)),
	}));
}

function staticGlobalTokens(results, key) {
	return topCounts(results.filter((item) => !item.error).flatMap((item) => item.classStats?.[key] ?? []).flatMap((entry) => Array(entry.count).fill(entry.value)), 24);
}

function tokenList(entries) {
	return entries.map((entry) => `${entry.value} (${entry.count})`).join(', ');
}

function renderStaticMarkdown(payload) {
	const results = payload.results;
	const okResults = results.filter((item) => !item.error);
	const failed = results.filter((item) => item.error);
	const lines = [
		'# BrowserBound Static Layout Capture',
		'',
		'Capture mode: HTTP-only. No Chrome, Playwright, screenshots, colors, images, logos, or copied page text are included.',
		'Text is represented as character counts only. Layout learning is based on HTML landmarks and non-color class tokens such as spacing, typography, grid, width, radius, border, shadow, and responsive breakpoints.',
		'',
		`Captured at: ${payload.capturedAt}`,
		`Captured pages: ${results.length}`,
		`Successful pages: ${okResults.length}`,
		`Failed pages: ${failed.length}`,
		`Concurrency: ${payload.staticConcurrency}`,
		'',
		'## Counts By Type',
		makeTable(summarizeStaticByType(results), [
			{ label: 'type', value: (row) => row.type },
			{ label: 'pages', value: (row) => row.count },
			{ label: 'ok', value: (row) => row.ok },
			{ label: 'avg html KB', value: (row) => row.avgHtmlKb },
			{ label: 'avg title', value: (row) => row.avgTitleLength },
			{ label: 'avg desc', value: (row) => row.avgDescriptionLength },
			{ label: 'avg h1', value: (row) => row.avgH1Count },
			{ label: 'avg h2', value: (row) => row.avgH2Count },
			{ label: 'avg cards', value: (row) => row.avgCards },
			{ label: 'avg buttons', value: (row) => row.avgButtonLike },
			{ label: 'avg internal links', value: (row) => row.avgInternalLinks },
		]),
		'## Global Non-Color Class Tokens',
		'',
		'### Typography',
		makeTable(staticGlobalTokens(results, 'topTypography'), [
			{ label: 'token', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Spacing',
		makeTable(staticGlobalTokens(results, 'topSpacing'), [
			{ label: 'token', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Layout',
		makeTable(staticGlobalTokens(results, 'topLayout'), [
			{ label: 'token', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Sizing',
		makeTable(staticGlobalTokens(results, 'topSizing'), [
			{ label: 'token', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'### Surface',
		makeTable(staticGlobalTokens(results, 'topSurface'), [
			{ label: 'token', value: (row) => row.value },
			{ label: 'count', value: (row) => row.count },
		]),
		'## Full Page Metrics',
		makeTable(results, [
			{ label: 'type', value: (row) => row.type },
			{ label: 'path', value: (row) => pathLabel(row.url) },
			{ label: 'status', value: (row) => row.error ? row.error : row.status },
			{ label: 'title', value: (row) => row.titleLength ?? '' },
			{ label: 'desc', value: (row) => row.metaDescriptionLength ?? '' },
			{ label: 'h1', value: (row) => row.headings?.h1?.count ?? '' },
			{ label: 'h2', value: (row) => row.headings?.h2?.count ?? '' },
			{ label: 'cards', value: (row) => row.cardCandidates?.count ?? '' },
			{ label: 'buttons', value: (row) => row.buttonLike?.count ?? '' },
			{ label: 'forms', value: (row) => row.tagCounts?.form ?? '' },
			{ label: 'inputs', value: (row) => row.tagCounts?.input ?? '' },
			{ label: 'internal links', value: (row) => row.anchors?.internal ?? '' },
		]),
	];

	if (failed.length) {
		lines.push('## Failed Pages', makeTable(failed, [
			{ label: 'path', value: (row) => pathLabel(row.url) },
			{ label: 'status', value: (row) => row.status },
			{ label: 'error', value: (row) => row.error },
		]));
	}

	return lines.join('\n');
}

function renderStaticBriefMarkdown(payload) {
	const byType = summarizeStaticByType(payload.results);
	const help = payload.results.find((item) => pathLabel(item.url) === '/help');
	const settings = payload.results.find((item) => pathLabel(item.url) === '/settings');
	return [
		'# BrowserBound Layout Capture Brief',
		'',
		'Capture mode switched to HTTP static capture: no Chrome, no screenshots, no colors, no images, no logos, no brand assets, and no copied page body text.',
		'',
		`- Covered pages: ${payload.results.length}`,
		`- Successful pages: ${payload.results.filter((item) => !item.error).length}`,
		`- Failed pages: ${payload.results.filter((item) => item.error).length}`,
		`- Help page: ${help && !help.error ? 'covered' : 'not captured successfully'}`,
		`- Settings page: ${settings && !settings.error ? 'covered' : 'not captured successfully'}`,
		'',
		'## Coverage By Page Type',
		makeTable(byType, [
			{ label: 'type', value: (row) => row.type },
			{ label: 'count', value: (row) => row.count },
			{ label: 'ok', value: (row) => row.ok },
			{ label: 'avg card candidates', value: (row) => row.avgCards },
			{ label: 'avg button candidates', value: (row) => row.avgButtonLike },
			{ label: 'avg internal links', value: (row) => row.avgInternalLinks },
		]),
		'## Reusable Layout Signals',
		'',
		'- Page structure: counts for header, main, footer, nav, section, form, input, and button elements.',
		'- SEO structure: title, description, H1, H2, and H3 counts and character lengths only.',
		'- Tool-site structure: coverage for category pages, tool pages, help, and settings.',
		'- Visual format tokens: non-color class tokens for type scale, spacing, grid, width, height, radius, border, shadow, and responsive breakpoints.',
		'',
		'## Output Files',
		'',
		'- `browserbound-layout-coverage.md`: full URL coverage inventory.',
		'- `browserbound-layout-static.md`: full static layout structure report.',
		'- `browserbound-layout-static.json`: machine-readable full-site capture data.',
	].join('\n');
}

function renderMarkdown(results, metadata = {}) {
	const captures = results.flatMap((page) => page.captures);
	const tokens = summarizeTokens(captures);
	const lines = [
		'# BrowserBound Layout Capture',
		'',
		'Scope: layout structure only. The script intentionally excludes colors, images, logos, and brand assets. Use this as spacing/type/layout reference, not as a copy source.',
		'',
		`Captured at: ${new Date().toISOString()}`,
		`Captured pages: ${results.length}`,
		`Viewports: ${viewports.map((viewport) => viewport.name).join(', ')}`,
		`Detail level: ${detailLevel}`,
		metadata.discoveredUrlCount ? `Discovered URLs: ${metadata.discoveredUrlCount}` : '',
		'',
		'See `browserbound-layout-coverage.md` for the full URL inventory.',
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
			if (capture.error) {
				lines.push(`- Capture error: ${capture.error}`, '');
				continue;
			}
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
	const coveragePath = path.join(outDir, 'browserbound-layout-coverage.json');
	const discovery = captureUrlsFromArgs
		? { urls: captureUrlsFromArgs.map((url) => normalizeCaptureUrl(url)).filter(Boolean), errors: [] }
		: sampleMode
			? { urls: defaultUrls.map((url) => normalizeCaptureUrl(url)).filter(Boolean), errors: [] }
			: !discoverOnly && existsSync(coveragePath)
				? JSON.parse(await readFile(coveragePath, 'utf8'))
				: await discoverSiteUrls();
	const urls = discovery.urls.filter(shouldCaptureUrl).sort((a, b) => urlSortKey(a).localeCompare(urlSortKey(b)));
	discovery.urls = urls;

	await writeFile(coveragePath, JSON.stringify(discovery, null, 2));
	await writeFile(path.join(outDir, 'browserbound-layout-coverage.md'), renderCoverageMarkdown(urls, discovery.errors));
	log(`Discovered ${urls.length} capture URLs.`);

	if (discoverOnly) {
		log(`Wrote ${path.join(outDir, 'browserbound-layout-coverage.json')}`);
		log(`Wrote ${path.join(outDir, 'browserbound-layout-coverage.md')}`);
		return;
	}

	if (!renderedMode) {
		log(`Using HTTP static capture mode with concurrency ${staticConcurrency}.`);
		const results = await captureStaticLayouts(urls);
		const payload = {
			capturedAt: new Date().toISOString(),
			mode: 'http-static',
			staticConcurrency,
			urls,
			discoveryErrors: discovery.errors,
			results,
		};
		await writeFile(path.join(outDir, 'browserbound-layout-static.json'), JSON.stringify(payload, null, 2));
		await writeFile(path.join(outDir, 'browserbound-layout-static.md'), renderStaticMarkdown(payload));
		await writeFile(path.join(outDir, 'browserbound-layout-brief.md'), renderStaticBriefMarkdown(payload));
		log(`Wrote ${path.join(outDir, 'browserbound-layout-static.json')}`);
		log(`Wrote ${path.join(outDir, 'browserbound-layout-static.md')}`);
		log(`Wrote ${path.join(outDir, 'browserbound-layout-brief.md')}`);
		return;
	}

	if (urls.length > 20 && !args.includes('--allow-large-rendered')) {
		throw new Error('Rendered capture is limited to 20 URLs by default. Use --sample --rendered for safe samples, or add --allow-large-rendered explicitly.');
	}

	const { chrome, browser } = await launchChrome();
	const results = [];

	try {
		for (const [urlIndex, url] of urls.entries()) {
			const pageResult = { url, captures: [] };
			for (const viewport of viewports) {
				log(`Capturing ${urlIndex + 1}/${urls.length} ${url} at ${viewport.name}.`);
				let page;
				try {
					page = await openPage(url, viewport);
					const capture = await evaluate(page, layoutProbeSource(), true);
					pageResult.captures.push({ viewportName: viewport.name, ...capture });
				} catch (error) {
					pageResult.captures.push({
						viewportName: viewport.name,
						url,
						viewport: { width: viewport.width, height: viewport.height },
						error: error.message,
					});
					log(`Failed ${url} at ${viewport.name}: ${error.message}`);
				} finally {
					try {
						page?.close();
					} catch {}
				}
			}
			results.push(pageResult);
		}
		const payload = {
			capturedAt: new Date().toISOString(),
			detailLevel,
			captureLimits,
			urls,
			viewports,
			discoveryErrors: discovery.errors,
			results,
		};
		await writeFile(path.join(outDir, 'browserbound-layout.json'), JSON.stringify(payload, null, 2));
		await writeFile(path.join(outDir, 'browserbound-layout.md'), renderMarkdown(results, { discoveredUrlCount: urls.length }));
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

const BROWSERBOUND_ORIGIN = 'https://www.browserbound.com';

const legacyPdfToolMap: Record<string, string> = {
	'merge-pdf': '/pdf-tools/merge',
	'split-pdf': '/pdf-tools/split',
	'compress-pdf': '/pdf-tools/compress',
	'pdf-to-word': '/pdf-tools/pdf-word',
	'word-to-pdf': '/pdf-tools/word-pdf',
	'ocr-pdf': '/pdf-tools/ocr-pdf',
	'pdf-watermark': '/pdf-tools/watermark',
	'unlock-pdf': '/pdf-tools/unlock',
	'protect-pdf': '/pdf-tools/protect',
	'rotate-pdf': '/pdf-tools/rotate',
};

function upstreamPath(pathname: string) {
	const cleanPath = pathname.replace(/\/+$/, '') || '/';
	const firstSegment = cleanPath.split('/').filter(Boolean)[0];

	if (cleanPath === '/') return '/dashboard';
	if (cleanPath === '/en' || cleanPath === '/zh-cn') return '/dashboard';
	if (firstSegment && legacyPdfToolMap[firstSegment]) return legacyPdfToolMap[firstSegment];
	if (cleanPath.startsWith('/en/') || cleanPath.startsWith('/zh-cn/')) {
		const withoutLocale = cleanPath.replace(/^\/(?:en|zh-cn)/, '') || '/dashboard';
		const slug = withoutLocale.split('/').filter(Boolean)[0];
		return slug && legacyPdfToolMap[slug] ? legacyPdfToolMap[slug] : withoutLocale;
	}

	return cleanPath;
}

function normalizeDocument(html: string) {
	return html;
}

export async function renderBrowserboundPage(request: Request) {
	const requestUrl = new URL(request.url);
	const target = new URL(upstreamPath(requestUrl.pathname), BROWSERBOUND_ORIGIN);
	target.search = requestUrl.search;

	const response = await fetch(target, {
		headers: {
			accept: 'text/html,application/xhtml+xml',
			'user-agent': 'PDFKING authorized BrowserBound mirror',
		},
	});

	if (!response.ok) {
		const fallback = await fetch(new URL('/dashboard', BROWSERBOUND_ORIGIN), {
			headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'PDFKING authorized BrowserBound mirror' },
		});
		const html = normalizeDocument(await fallback.text());
		return new Response(html, {
			status: fallback.status,
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'public, max-age=120',
				'x-browserbound-upstream': '/dashboard',
			},
		});
	}

	const html = normalizeDocument(await response.text());
	return new Response(html, {
		status: response.status,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'public, max-age=120',
			'x-browserbound-upstream': target.pathname,
		},
	});
}

export async function proxyBrowserboundAsset(request: Request) {
	const requestUrl = new URL(request.url);
	const target = new URL(`${requestUrl.pathname}${requestUrl.search}`, BROWSERBOUND_ORIGIN);
	const response = await fetch(target, {
		headers: {
			accept: request.headers.get('accept') ?? '*/*',
			'user-agent': 'PDFKING authorized BrowserBound asset proxy',
		},
	});

	const headers = new Headers();
	const contentType = response.headers.get('content-type');
	if (contentType) headers.set('content-type', contentType);
	headers.set('cache-control', response.headers.get('cache-control') ?? 'public, max-age=31536000, immutable');

	return new Response(response.body, {
		status: response.status,
		headers,
	});
}

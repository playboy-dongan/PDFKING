(() => {
	const isPlainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
	const originalFetch = window.fetch.bind(window);

	window.fetch = (input, init) => {
		const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
		if (rawUrl) {
			const url = new URL(rawUrl, location.href);
			if (url.origin === location.origin && url.searchParams.has('_rsc')) {
				return Promise.resolve(new Response('', { status: 204, headers: { 'content-type': 'text/x-component' } }));
			}
		}
		return originalFetch(input, init);
	};

	document.addEventListener(
		'click',
		(event) => {
			if (!isPlainClick(event)) return;
			const anchor = event.target?.closest?.('a[href]');
			if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
			const url = new URL(anchor.href, location.href);
			if (url.origin !== location.origin) return;
			if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/__pdfking/')) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			location.assign(url.pathname + url.search + url.hash);
		},
		true,
	);

	const sourceBrand = 'PDFKINGTools';
	const targetBrand = 'PDFKING';
	const brandPattern = new RegExp(sourceBrand, 'g');
	let rebrandQueued = false;
	const faviconLinks = [
		{ rel: 'shortcut icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		{ rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
	];

	function replaceBrand(value) {
		return typeof value === 'string' && value.includes(sourceBrand) ? value.replace(brandPattern, targetBrand) : value;
	}

	function setAttributes(element, attrs) {
		for (const [name, value] of Object.entries(attrs)) {
			if (value) element.setAttribute(name, value);
			else element.removeAttribute(name);
		}
	}

	function enforceFavicons() {
		const wanted = new Set(faviconLinks.map((item) => `${item.rel}|${item.href}`));
		document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((link) => {
			const key = `${link.getAttribute('rel')}|${link.getAttribute('href')}`;
			if (link.getAttribute('data-pdfking-favicon') !== 'true' || !wanted.has(key)) link.remove();
		});
		for (const attrs of faviconLinks) {
			if (document.querySelector(`link[data-pdfking-favicon="true"][rel="${attrs.rel}"][href="${attrs.href}"]`)) continue;
			const link = document.createElement('link');
			setAttributes(link, { ...attrs, 'data-pdfking-favicon': 'true' });
			document.head.appendChild(link);
		}
	}

	function enforceLogo(root = document) {
		for (const image of root.querySelectorAll?.('img') ?? []) {
			const src = image.getAttribute('src') ?? '';
			const alt = image.getAttribute('alt') ?? '';
			if (src.includes('/icons/icon-512x512.png') || src.includes('/icons/favicon') || alt.includes(sourceBrand)) {
				image.setAttribute('src', '/icons/pdfking.svg');
				image.setAttribute('width', '36');
				image.setAttribute('height', '36');
				image.setAttribute('alt', targetBrand);
			}
		}

		const sidebarHeader = document.querySelector('[data-slot="sidebar-header"]');
		const logoBox = sidebarHeader?.querySelector('div[class*="aspect-square"]');
		if (logoBox && !logoBox.querySelector('img[src="/icons/pdfking.svg"]')) {
			logoBox.replaceChildren(Object.assign(document.createElement('img'), { src: '/icons/pdfking.svg', width: 36, height: 36, alt: targetBrand }));
		}
	}

	function rebrandNode(root = document.body) {
		if (!root) return;
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const nextValue = replaceBrand(node.nodeValue);
			if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
		}
		for (const element of root.querySelectorAll?.('[alt], [title], [aria-label]') ?? []) {
			for (const attr of ['alt', 'title', 'aria-label']) {
				const nextValue = replaceBrand(element.getAttribute(attr));
				if (nextValue !== element.getAttribute(attr)) element.setAttribute(attr, nextValue);
			}
		}
		enforceLogo(root);
		if (document.title.includes(sourceBrand)) document.title = replaceBrand(document.title);
		enforceFavicons();
	}

	function queueRebrand() {
		if (rebrandQueued) return;
		rebrandQueued = true;
		requestAnimationFrame(() => {
			rebrandQueued = false;
			rebrandNode();
		});
	}

	function startBrandGuard() {
		rebrandNode();
		new MutationObserver(queueRebrand).observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['href', 'src', 'alt', 'title', 'aria-label'],
			childList: true,
			subtree: true,
			characterData: true,
		});
		for (const delay of [0, 100, 500, 1500, 3000]) setTimeout(rebrandNode, delay);
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startBrandGuard, { once: true });
	else startBrandGuard();
	window.addEventListener('load', rebrandNode);
})();

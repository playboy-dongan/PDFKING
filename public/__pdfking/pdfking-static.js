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

	function replaceBrand(value) {
		return typeof value === 'string' && value.includes(sourceBrand) ? value.replace(brandPattern, targetBrand) : value;
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
		for (const image of root.querySelectorAll?.('img[src="/icons/icon-512x512.png"]') ?? []) {
			image.setAttribute('src', '/icons/pdfking.svg');
			image.setAttribute('alt', targetBrand);
		}
		if (document.title.includes(sourceBrand)) document.title = replaceBrand(document.title);
	}

	function queueRebrand() {
		if (rebrandQueued) return;
		rebrandQueued = true;
		requestAnimationFrame(() => {
			rebrandQueued = false;
			rebrandNode();
		});
	}

	window.addEventListener('load', () => {
		setTimeout(() => {
			rebrandNode();
			new MutationObserver(queueRebrand).observe(document.body, { childList: true, subtree: true, characterData: true });
		}, 1500);
	});
})();

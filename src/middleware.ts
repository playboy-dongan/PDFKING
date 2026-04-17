import { defineMiddleware } from 'astro:middleware';
import { proxyBrowserboundAsset } from './lib/browserboundProxy';

export const onRequest = defineMiddleware(async ({ request }, next) => {
	const pathname = new URL(request.url).pathname;
	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/_vercel/') ||
		pathname.startsWith('/icons/') ||
		pathname.startsWith('/images/') ||
		pathname.startsWith('/fonts/') ||
		pathname === '/favicon.ico' ||
		pathname === '/favicon.svg' ||
		pathname === '/apple-touch-icon.png' ||
		pathname === '/site.webmanifest' ||
		pathname === '/manifest.webmanifest' ||
		pathname.endsWith('.wasm')
	) {
		return proxyBrowserboundAsset(request);
	}

	return next();
});

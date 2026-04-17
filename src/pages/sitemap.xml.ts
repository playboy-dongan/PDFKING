const BROWSERBOUND_ORIGIN = 'https://www.browserbound.com';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
	const response = await fetch(`${BROWSERBOUND_ORIGIN}/sitemap.xml`, {
		headers: { accept: 'application/xml', 'user-agent': 'PDFKING authorized BrowserBound sitemap mirror' },
	});
	const origin = new URL(request.url).origin;
	const sitemap = (await response.text()).replaceAll(BROWSERBOUND_ORIGIN, origin);

	return new Response(sitemap, {
		status: response.status,
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600',
		},
	});
}

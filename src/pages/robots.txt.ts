const BROWSERBOUND_ORIGIN = 'https://www.browserbound.com';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
	const response = await fetch(`${BROWSERBOUND_ORIGIN}/robots.txt`, {
		headers: { accept: 'text/plain', 'user-agent': 'PDFKING authorized BrowserBound robots mirror' },
	});
	const origin = new URL(request.url).origin;
	const robots = (await response.text()).replaceAll(BROWSERBOUND_ORIGIN, origin);

	return new Response(robots, {
		status: response.status,
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600',
		},
	});
}

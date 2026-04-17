import { renderBrowserboundPage } from '../lib/browserboundProxy';

export const prerender = false;

export function GET({ request }: { request: Request }) {
	return renderBrowserboundPage(request);
}

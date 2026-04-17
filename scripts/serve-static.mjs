import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

function arg(name, fallback) {
	const index = args.indexOf(name);
	return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const host = arg('--host', '127.0.0.1');
const port = Number(arg('--port', '4321'));
const dir = path.resolve(root, arg('--dir', 'public'));
const mimeTypes = new Map([
	['.html', 'text/html; charset=utf-8'],
	['.css', 'text/css; charset=utf-8'],
	['.js', 'application/javascript; charset=utf-8'],
	['.json', 'application/json; charset=utf-8'],
	['.webmanifest', 'application/manifest+json; charset=utf-8'],
	['.wasm', 'application/wasm'],
	['.svg', 'image/svg+xml'],
	['.png', 'image/png'],
	['.jpg', 'image/jpeg'],
	['.jpeg', 'image/jpeg'],
	['.webp', 'image/webp'],
	['.ico', 'image/x-icon'],
	['.woff2', 'font/woff2'],
	['.txt', 'text/plain; charset=utf-8'],
	['.xml', 'application/xml; charset=utf-8'],
]);

async function resolveFile(url) {
	const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
	const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
	const base = path.join(dir, safePath);
	const candidates = [base, path.join(base, 'index.html')];
	for (const candidate of candidates) {
		if (!candidate.startsWith(dir)) continue;
		try {
			const info = await stat(candidate);
			if (info.isFile()) return candidate;
		} catch {}
	}
	return null;
}

const server = createServer(async (request, response) => {
	const file = await resolveFile(request.url ?? '/');
	if (!file) {
		response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		response.end('Not found');
		return;
	}
	const ext = path.extname(file);
	response.writeHead(200, {
		'content-type': mimeTypes.get(ext) ?? 'application/octet-stream',
		'cache-control': file.includes(`${path.sep}_next${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
	});
	createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
	console.log(`[serve] ${dir} -> http://${host}:${port}/`);
});

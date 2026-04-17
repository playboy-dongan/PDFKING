// @ts-check
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://pdfking.example';

export default defineConfig({
	site,
	output: 'server',
	adapter: cloudflare(),
	integrations: [sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});

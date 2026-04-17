import type { ToolSlug } from './tools';

export const browserboundPdfAliases: Record<string, ToolSlug> = {
	merge: 'merge-pdf',
	'merge-pdf': 'merge-pdf',
	split: 'split-pdf',
	'split-pdf': 'split-pdf',
	compress: 'compress-pdf',
	'compress-pdf': 'compress-pdf',
	'pdf-to-word': 'pdf-to-word',
	'pdf-word': 'pdf-to-word',
	'word-to-pdf': 'word-to-pdf',
	'word-pdf': 'word-to-pdf',
	ocr: 'ocr-pdf',
	'ocr-pdf': 'ocr-pdf',
	watermark: 'pdf-watermark',
	'pdf-watermark': 'pdf-watermark',
	unlock: 'unlock-pdf',
	'unlock-pdf': 'unlock-pdf',
	'decrypt-pdf': 'unlock-pdf',
	protect: 'protect-pdf',
	'protect-pdf': 'protect-pdf',
	'encrypt-pdf': 'protect-pdf',
	rotate: 'rotate-pdf',
	'rotate-pdf': 'rotate-pdf',
};

export const browserboundSectionLabels: Record<string, string> = {
	'image-tools': 'Image Tools',
	'pdf-tools': 'PDF Tools',
	'text-tools': 'Text Tools',
	'misc-tools': 'Misc Tools',
};

export function formatBrowserboundSlug(slug: string) {
	return slug
		.split('-')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

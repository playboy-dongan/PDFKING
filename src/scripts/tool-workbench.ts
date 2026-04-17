import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as mammoth from 'mammoth/mammoth.browser';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { degrees, PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import qpdfFactory from '@neslinesli93/qpdf-wasm';
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';

type ToolDefinition = {
	locale: string;
	slug: string;
	name: string;
	actionLabel: string;
};

type ResultFile = {
	name: string;
	blob: Blob;
	description?: string;
};

type WorkbenchElements = {
	container: HTMLElement;
	tool: ToolDefinition;
	fileInput: HTMLInputElement;
	runButton: HTMLButtonElement;
	status: HTMLElement;
	preview: HTMLElement;
	previewLabel: HTMLElement;
	results: HTMLElement;
};

type WorkbenchCopy = {
	download: string;
	renderingPreview: string;
	fileSelected: (count: number) => string;
	runLabel: (name: string) => string;
	runCompleted: (label: string) => string;
	previewError: string;
	processError: string;
	needFile: string;
	waitingForFile: string;
	fileLoaded: string;
	docxPreview: string;
	imagePreview: string;
	pages: (count: number) => string;
	rangeZip: string;
	mergedDone: (count: number) => string;
	compressedDone: (before: string, after: string) => string;
	rotatedDone: (angle: number) => string;
	docxExport: string;
	pdfExport: string;
	ocrText: string;
	ocrDocx: string;
	watermarkDone: string;
	unlockDone: string;
	protectDone: string;
	previewFallback: string;
};

function i18n(locale: string): WorkbenchCopy {
	if (locale === 'zh-cn') {
		return {
			download: '下载',
			renderingPreview: '正在生成预览...',
			fileSelected: (count) => `已选择 ${count} 个文件。`,
			runLabel: (name) => `正在执行 ${name}...`,
			runCompleted: (label) => `${label} 已完成。`,
			previewError: '无法生成预览。',
			processError: '处理失败。',
			needFile: '请先选择至少一个文件。',
			waitingForFile: '等待文件',
			fileLoaded: '文件已加载',
			docxPreview: 'DOCX 预览',
			imagePreview: '图片预览',
			pages: (count) => `${count} 页`,
			rangeZip: 'ZIP 压缩包，内含每个范围的 PDF 文件',
			mergedDone: (count) => `已合并 ${count} 个 PDF 文件`,
			compressedDone: (before, after) => `文件大小从 ${before} 压缩到 ${after}`,
			rotatedDone: (angle) => `所有页面已旋转 ${angle} 度`,
			docxExport: '可编辑 DOCX 输出',
			pdfExport: '已生成 PDF 文件',
			ocrText: '已识别的纯文本输出',
			ocrDocx: '已识别的 DOCX 输出',
			watermarkDone: '已为每一页添加水印',
			unlockDone: '已移除 PDF 密码保护',
			protectDone: '已生成加密 PDF',
			previewFallback: '上传文件后会在这里显示预览。',
		};
	}

	return {
		download: 'Download',
		renderingPreview: 'Rendering preview...',
		fileSelected: (count) => `${count} file${count > 1 ? 's' : ''} selected.`,
		runLabel: (name) => `Running ${name.toLowerCase()}...`,
		runCompleted: (label) => `${label} completed.`,
		previewError: 'Unable to render preview.',
		processError: 'Processing failed.',
		needFile: 'Please choose at least one file.',
		waitingForFile: 'Waiting for file',
		fileLoaded: 'File loaded',
		docxPreview: 'DOCX preview',
		imagePreview: 'Image preview',
		pages: (count) => `${count} page${count > 1 ? 's' : ''}`,
		rangeZip: 'ZIP archive with one PDF per range',
		mergedDone: (count) => `Combined ${count} PDF files`,
		compressedDone: (before, after) => `Compressed from ${before} to ${after}`,
		rotatedDone: (angle) => `All pages rotated by ${angle} degrees`,
		docxExport: 'Editable DOCX export',
		pdfExport: 'Generated PDF file',
		ocrText: 'Recognized plain text output',
		ocrDocx: 'Recognized editable DOCX output',
		watermarkDone: 'Watermark added to every page',
		unlockDone: 'Password protection removed',
		protectDone: 'Encrypted PDF generated',
		previewFallback: 'Upload a file to render a preview or document summary.',
	};
}

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

let qpdfModulePromise: Promise<any> | null = null;

async function getQpdfModule() {
	if (!qpdfModulePromise) {
		qpdfModulePromise = qpdfFactory({
			locateFile: () => qpdfWasmUrl,
			noInitialRun: true,
		});
	}

	return qpdfModulePromise;
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

function setStatus(elements: WorkbenchElements, message: string) {
	elements.status.textContent = message;
}

function renderError(elements: WorkbenchElements, message: string) {
	setStatus(elements, message);
	elements.results.innerHTML = `
		<div class="rounded-[1.4rem] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
			${escapeHtml(message)}
		</div>
	`;
}

function bytesToSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function normalizeName(name: string, extension: string) {
	const base = name.replace(/\.[^.]+$/, '');
	return `${base}${extension}`;
}

async function readFileBytes(file: File) {
	return new Uint8Array(await file.arrayBuffer());
}

function downloadUrl(blob: Blob) {
	return URL.createObjectURL(blob);
}

function renderResults(elements: WorkbenchElements, files: ResultFile[]) {
	const t = i18n(elements.tool.locale);
	elements.results.innerHTML = '';

	for (const file of files) {
		const href = downloadUrl(file.blob);
		const wrapper = document.createElement('div');
		wrapper.className = 'rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4';
		wrapper.innerHTML = `
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="font-semibold text-white">${escapeHtml(file.name)}</p>
					<p class="mt-1 text-xs text-slate-400">${escapeHtml(file.description ?? bytesToSize(file.blob.size))}</p>
				</div>
				<a
					class="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
					href="${href}"
					download="${escapeHtml(file.name)}"
				>
					${escapeHtml(t.download)}
				</a>
			</div>
		`;
		elements.results.appendChild(wrapper);
	}
}

async function renderPdfPreview(elements: WorkbenchElements, file: File) {
	const t = i18n(elements.tool.locale);
	const bytes = await file.arrayBuffer();
	const pdf = await getDocument({ data: bytes }).promise;
	const page = await pdf.getPage(1);
	const viewport = page.getViewport({ scale: 1.2 });
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Unable to create preview canvas.');
	}

	canvas.width = viewport.width;
	canvas.height = viewport.height;
	await page.render({ canvasContext: context, viewport }).promise;

	elements.preview.innerHTML = '';
	canvas.className = 'mx-auto max-h-[30rem] max-w-full rounded-[1.3rem] shadow-2xl shadow-slate-950/50';
	elements.preview.appendChild(canvas);
	elements.previewLabel.textContent = t.pages(pdf.numPages);
}

async function renderDocxPreview(elements: WorkbenchElements, file: File) {
	const t = i18n(elements.tool.locale);
	const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
	elements.preview.innerHTML = `
		<div class="w-full rounded-[1.3rem] bg-white p-6 text-left text-sm leading-7 text-slate-800">
			${value || '<p>No preview available.</p>'}
		</div>
	`;
	elements.previewLabel.textContent = t.docxPreview;
}

async function renderImagePreview(elements: WorkbenchElements, file: File) {
	const t = i18n(elements.tool.locale);
	const imageUrl = URL.createObjectURL(file);
	elements.preview.innerHTML = `<img src="${imageUrl}" alt="Uploaded preview" class="mx-auto max-h-[30rem] rounded-[1.3rem] object-contain shadow-2xl shadow-slate-950/50" />`;
	elements.previewLabel.textContent = t.imagePreview;
}

async function renderPreview(elements: WorkbenchElements) {
	const t = i18n(elements.tool.locale);
	const [file] = Array.from(elements.fileInput.files ?? []);
	if (!file) {
		elements.preview.innerHTML = t.previewFallback;
		elements.previewLabel.textContent = t.waitingForFile;
		return;
	}

	if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
		await renderPdfPreview(elements, file);
		return;
	}

	if (file.name.toLowerCase().endsWith('.docx')) {
		await renderDocxPreview(elements, file);
		return;
	}

	if (file.type.startsWith('image/')) {
		await renderImagePreview(elements, file);
		return;
	}

	elements.preview.textContent = `${file.name} selected.`;
	elements.previewLabel.textContent = t.fileLoaded;
}

function getInputValue<T extends HTMLElement>(container: HTMLElement, role: string) {
	return container.querySelector<T>(`[data-role="${role}"]`);
}

async function mergePdf(files: File[]) {
	const output = await PDFDocument.create();
	for (const file of files) {
		const source = await PDFDocument.load(await file.arrayBuffer());
		const copiedPages = await output.copyPages(source, source.getPageIndices());
		for (const page of copiedPages) {
			output.addPage(page);
		}
	}
	return new Blob([await output.save()], { type: 'application/pdf' });
}

function parseRanges(input: string, totalPages: number) {
	return input
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			const [startRaw, endRaw] = part.split('-');
			const start = Number(startRaw);
			const end = Number(endRaw ?? startRaw);
			if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > totalPages || start > end) {
				throw new Error(`Invalid range: ${part}`);
			}
			return { label: part, start, end };
		});
}

async function splitPdf(file: File, rangesInput: string) {
	const source = await PDFDocument.load(await file.arrayBuffer());
	const ranges = parseRanges(rangesInput, source.getPageCount());
	const zip = new JSZip();

	for (const range of ranges) {
		const output = await PDFDocument.create();
		const indexes = Array.from({ length: range.end - range.start + 1 }, (_, index) => range.start - 1 + index);
		const pages = await output.copyPages(source, indexes);
		pages.forEach((page) => output.addPage(page));
		zip.file(`${file.name.replace(/\.pdf$/i, '')}-${range.label}.pdf`, await output.save());
	}

	const blob = await zip.generateAsync({ type: 'blob' });
	return new Blob([blob], { type: 'application/zip' });
}

async function rotatePdf(file: File, angle: number) {
	const pdf = await PDFDocument.load(await file.arrayBuffer());
	for (const page of pdf.getPages()) {
		page.setRotation(degrees(angle));
	}
	return new Blob([await pdf.save()], { type: 'application/pdf' });
}

async function watermarkPdf(file: File, text: string, opacity: number) {
	const pdf = await PDFDocument.load(await file.arrayBuffer());
	const font = await pdf.embedFont(StandardFonts.HelveticaBold);

	for (const page of pdf.getPages()) {
		const { width, height } = page.getSize();
		page.drawText(text, {
			x: width * 0.14,
			y: height * 0.5,
			size: Math.max(32, Math.min(width, height) * 0.08),
			font,
			color: rgb(0.36, 0.51, 0.64),
			opacity,
			rotate: degrees(-28),
		});
	}

	return new Blob([await pdf.save()], { type: 'application/pdf' });
}

async function renderPdfPages(file: File, scale = 1.5) {
	const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
	const canvases: HTMLCanvasElement[] = [];

	for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
		const page = await pdf.getPage(pageIndex);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Unable to create render canvas.');
		}
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		await page.render({ canvasContext: context, viewport }).promise;
		canvases.push(canvas);
	}

	return canvases;
}

async function compressPdf(file: File, quality: number) {
	const canvases = await renderPdfPages(file, 1.35);
	const pdf = new jsPDF({ unit: 'pt', compress: true });

	canvases.forEach((canvas, index) => {
		const dataUrl = canvas.toDataURL('image/jpeg', quality);
		const width = canvas.width;
		const height = canvas.height;
		if (index > 0) {
			pdf.addPage([width, height], width > height ? 'landscape' : 'portrait');
		} else {
			pdf.setPage(1);
			pdf.internal.pageSize.setWidth(width);
			pdf.internal.pageSize.setHeight(height);
		}
		pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');
	});

	return pdf.output('blob');
}

async function extractPdfText(file: File) {
	const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
	const pages: { pageNumber: number; text: string }[] = [];

	for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
		const page = await pdf.getPage(pageNumber);
		const content = await page.getTextContent();
		const text = content.items
			.map((item: any) => ('str' in item ? item.str : ''))
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
		pages.push({ pageNumber, text });
	}

	return pages;
}

async function pdfToWord(file: File) {
	const pages = await extractPdfText(file);
	const document = new Document({
		sections: [
			{
				children: pages.flatMap((page) => [
					new Paragraph({ text: `Page ${page.pageNumber}`, heading: HeadingLevel.HEADING_2 }),
					new Paragraph({ children: [new TextRun(page.text || ' ')] }),
				]),
			},
		],
	});

	return new Blob([await Packer.toBlob(document)], {
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	});
}

async function wordToPdf(file: File) {
	const previewWrapper = document.createElement('div');
	previewWrapper.style.position = 'fixed';
	previewWrapper.style.left = '-9999px';
	previewWrapper.style.top = '0';
	previewWrapper.style.width = '900px';
	previewWrapper.style.padding = '40px';
	previewWrapper.style.background = '#ffffff';
	previewWrapper.style.color = '#0f172a';
	previewWrapper.style.fontFamily = 'Georgia, serif';
	previewWrapper.style.lineHeight = '1.7';

	const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
	previewWrapper.innerHTML = value || '<p>No content found in this DOCX file.</p>';
	document.body.appendChild(previewWrapper);

	try {
		const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
		await pdf.html(previewWrapper, {
			x: 24,
			y: 24,
			width: 545,
			windowWidth: 900,
			autoPaging: 'text',
			margin: [24, 24, 24, 24],
		});
		return pdf.output('blob');
	} finally {
		document.body.removeChild(previewWrapper);
	}
}

async function ocrImageBlob(blob: Blob) {
	const Tesseract = await import('tesseract.js');
	const result = await Tesseract.recognize(blob, 'eng');
	return result.data.text.trim();
}

async function ocrPdf(file: File) {
	const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
	if (!isPdf) {
		return [{ pageNumber: 1, text: await ocrImageBlob(file) }];
	}

	const canvases = await renderPdfPages(file, 1.7);
	const pages: { pageNumber: number; text: string }[] = [];
	for (const [index, canvas] of canvases.entries()) {
		const blob = await new Promise<Blob>((resolve) => canvas.toBlob((result) => resolve(result ?? new Blob()), 'image/png', 1));
		pages.push({
			pageNumber: index + 1,
			text: await ocrImageBlob(blob),
		});
	}
	return pages;
}

async function ocrToDocx(file: File) {
	const pages = await ocrPdf(file);
	const document = new Document({
		sections: [
			{
				children: pages.flatMap((page) => [
					new Paragraph({ text: `OCR Page ${page.pageNumber}`, heading: HeadingLevel.HEADING_2 }),
					new Paragraph({ children: [new TextRun(page.text || ' ')] }),
				]),
			},
		],
	});
	return new Blob([await Packer.toBlob(document)], {
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	});
}

async function ocrToText(file: File) {
	const pages = await ocrPdf(file);
	return new Blob([pages.map((page) => `OCR Page ${page.pageNumber}\n\n${page.text}`).join('\n\n')], {
		type: 'text/plain;charset=utf-8',
	});
}

async function runQpdf(args: string[], inputFile: File) {
	const qpdf = await getQpdfModule();
	const inputName = `/input-${crypto.randomUUID()}.pdf`;
	const outputName = `/output-${crypto.randomUUID()}.pdf`;

	try {
		qpdf.FS.writeFile(inputName, await readFileBytes(inputFile));
		qpdf.callMain(args.map((value) => (value === '__INPUT__' ? inputName : value === '__OUTPUT__' ? outputName : value)));
		const output = qpdf.FS.readFile(outputName);
		return new Blob([output], { type: 'application/pdf' });
	} finally {
		try {
			qpdf.FS.unlink(inputName);
		} catch {}
		try {
			qpdf.FS.unlink(outputName);
		} catch {}
	}
}

async function protectPdf(file: File, openPassword: string, ownerPassword: string) {
	if (!openPassword) {
		throw new Error('Open password is required to protect the PDF.');
	}

	return runQpdf(['--encrypt', openPassword, ownerPassword || openPassword, '256', '--', '__INPUT__', '__OUTPUT__'], file);
}

async function unlockPdf(file: File, password: string) {
	if (!password) {
		throw new Error('Current password is required to unlock the PDF.');
	}

	return runQpdf([`--password=${password}`, '--decrypt', '__INPUT__', '__OUTPUT__'], file);
}

async function handleRun(elements: WorkbenchElements) {
	const files = Array.from(elements.fileInput.files ?? []);
	const t = i18n(elements.tool.locale);
	if (!files.length) {
		throw new Error(t.needFile);
	}

	switch (elements.tool.slug) {
		case 'merge-pdf':
			return [{ name: 'merged.pdf', blob: await mergePdf(files), description: t.mergedDone(files.length) }];
		case 'split-pdf': {
			const rangesInput = getInputValue<HTMLInputElement>(elements.container, 'ranges')?.value ?? '';
			return [{ name: normalizeName(files[0].name, '-split.zip'), blob: await splitPdf(files[0], rangesInput), description: t.rangeZip }];
		}
		case 'compress-pdf': {
			const quality = Number(getInputValue<HTMLInputElement>(elements.container, 'quality')?.value ?? '0.7');
			const blob = await compressPdf(files[0], quality);
			return [{ name: normalizeName(files[0].name, '-compressed.pdf'), blob, description: t.compressedDone(bytesToSize(files[0].size), bytesToSize(blob.size)) }];
		}
		case 'pdf-to-word':
			return [{ name: normalizeName(files[0].name, '.docx'), blob: await pdfToWord(files[0]), description: t.docxExport }];
		case 'word-to-pdf':
			return [{ name: normalizeName(files[0].name, '.pdf'), blob: await wordToPdf(files[0]), description: t.pdfExport }];
		case 'ocr-pdf': {
			const format = getInputValue<HTMLSelectElement>(elements.container, 'ocr-format')?.value ?? 'docx';
			if (format === 'txt') {
				return [{ name: normalizeName(files[0].name, '-ocr.txt'), blob: await ocrToText(files[0]), description: t.ocrText }];
			}
			return [{ name: normalizeName(files[0].name, '-ocr.docx'), blob: await ocrToDocx(files[0]), description: t.ocrDocx }];
		}
		case 'pdf-watermark': {
			const text = getInputValue<HTMLInputElement>(elements.container, 'watermark-text')?.value ?? 'PDFKing';
			const opacity = Number(getInputValue<HTMLInputElement>(elements.container, 'watermark-opacity')?.value ?? '0.18');
			return [{ name: normalizeName(files[0].name, '-watermarked.pdf'), blob: await watermarkPdf(files[0], text, opacity), description: t.watermarkDone }];
		}
		case 'unlock-pdf': {
			const password = getInputValue<HTMLInputElement>(elements.container, 'unlock-password')?.value ?? '';
			return [{ name: normalizeName(files[0].name, '-unlocked.pdf'), blob: await unlockPdf(files[0], password), description: t.unlockDone }];
		}
		case 'protect-pdf': {
			const openPassword = getInputValue<HTMLInputElement>(elements.container, 'user-password')?.value ?? '';
			const ownerPassword = getInputValue<HTMLInputElement>(elements.container, 'owner-password')?.value ?? '';
			return [{ name: normalizeName(files[0].name, '-protected.pdf'), blob: await protectPdf(files[0], openPassword, ownerPassword), description: t.protectDone }];
		}
		case 'rotate-pdf': {
			const angle = Number(getInputValue<HTMLSelectElement>(elements.container, 'rotation')?.value ?? '90');
			return [{ name: normalizeName(files[0].name, '-rotated.pdf'), blob: await rotatePdf(files[0], angle), description: t.rotatedDone(angle) }];
		}
		default:
			throw new Error('Unsupported tool configuration.');
	}
}

function collectElements(container: HTMLElement): WorkbenchElements {
	const toolJson = container.dataset.tool;
	const fileInput = getInputValue<HTMLInputElement>(container, 'file-input');
	const runButton = getInputValue<HTMLButtonElement>(container, 'run-button');
	const status = getInputValue<HTMLElement>(container, 'status');
	const preview = getInputValue<HTMLElement>(container, 'preview');
	const previewLabel = getInputValue<HTMLElement>(container, 'preview-label');
	const results = getInputValue<HTMLElement>(container, 'results');

	if (!toolJson || !fileInput || !runButton || !status || !preview || !previewLabel || !results) {
		throw new Error('Workbench elements are missing.');
	}

	return { container, tool: JSON.parse(toolJson), fileInput, runButton, status, preview, previewLabel, results };
}

function setupWorkbench(container: HTMLElement) {
	const elements = collectElements(container);

	elements.fileInput.addEventListener('change', async () => {
		const t = i18n(elements.tool.locale);
		try {
			setStatus(elements, t.renderingPreview);
			await renderPreview(elements);
			setStatus(elements, t.fileSelected(elements.fileInput.files?.length ?? 0));
		} catch (error) {
			renderError(elements, error instanceof Error ? error.message : t.previewError);
		}
	});

	elements.runButton.addEventListener('click', async () => {
		const t = i18n(elements.tool.locale);
		try {
			elements.runButton.disabled = true;
			elements.runButton.classList.add('opacity-60', 'cursor-not-allowed');
			setStatus(elements, t.runLabel(elements.tool.name));
			const resultFiles = await handleRun(elements);
			renderResults(elements, resultFiles);
			setStatus(elements, t.runCompleted(elements.tool.actionLabel));
		} catch (error) {
			renderError(elements, error instanceof Error ? error.message : t.processError);
		} finally {
			elements.runButton.disabled = false;
			elements.runButton.classList.remove('opacity-60', 'cursor-not-allowed');
		}
	});
}

export function initToolWorkbench() {
	if (typeof window === 'undefined') {
		return;
	}

	document.querySelectorAll<HTMLElement>('[data-tool-workbench]').forEach((container) => {
		if (container.dataset.initialized === 'true') {
			return;
		}
		container.dataset.initialized = 'true';
		setupWorkbench(container);
	});
}

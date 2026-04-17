export type Locale = 'zh-cn' | 'en';
export type ToolSlug =
	| 'merge-pdf'
	| 'split-pdf'
	| 'compress-pdf'
	| 'pdf-to-word'
	| 'word-to-pdf'
	| 'ocr-pdf'
	| 'pdf-watermark'
	| 'unlock-pdf'
	| 'protect-pdf'
	| 'rotate-pdf';

type Category = 'edit' | 'convert' | 'security' | 'ocr';
type FaqItem = { question: string; answer: string };
type ToolStatic = {
	slug: ToolSlug;
	category: Category;
	accept: string;
	acceptHint: Record<Locale, string>;
	allowMultiple: boolean;
	related: ToolSlug[];
};
type ToolCopy = {
	name: string;
	title: string;
	metaDescription: string;
	h1: string;
	intro: string;
	pageCopy: string;
	actionLabel: string;
	highlights: string[];
	cardDescription: string;
	engineSummary: string;
	faqs: FaqItem[];
};

export type ToolDefinition = ToolStatic &
	ToolCopy & {
		locale: Locale;
		categoryLabel: string;
		path: string;
	};

type LocaleMeta = {
	code: Locale;
	label: string;
	htmlLang: string;
};

type CategoryCard = {
	name: string;
	description: string;
	slugs: ToolSlug[];
};

type HomeCopy = {
	nav: { allTools: string; categories: string; faq: string; start: string };
	hero: { badge: string; title: string; description: string; primary: string; secondary: string; pills: string[] };
	stack: { eyebrow: string; title: string; adSlot: string; items: { title: string; description: string }[] };
	tools: { eyebrow: string; title: string; description: string };
	categories: { eyebrow: string; title: string };
	seo: { eyebrow: string; title: string; paragraphs: string[] };
	ads: { eyebrow: string; title: string; items: string[] };
	faq: { eyebrow: string; title: string; items: FaqItem[] };
	footer: { description: string; popularRoutes: string; securityRoutes: string };
};

type ToolPageCopy = {
	home: string;
	tool: string;
	faq: string;
	moreTools: string;
	howItWorksEyebrow: string;
	howItWorksTitle: (toolName: string) => string;
	steps: { title: string; description: string }[];
	faqEyebrow: string;
	faqTitle: (toolName: string) => string;
	adEyebrow: string;
	adBody: string;
	relatedEyebrow: string;
};

export const defaultLocale: Locale = 'zh-cn';
export const locales: LocaleMeta[] = [
	{ code: 'zh-cn', label: '简体中文', htmlLang: 'zh-CN' },
	{ code: 'en', label: 'English', htmlLang: 'en' },
];

export const siteMeta = {
	siteName: 'PDFKing',
};

const categoryLabels: Record<Locale, Record<Category, string>> = {
	'zh-cn': { edit: '编辑 PDF', convert: 'PDF 转换', security: '安全工具', ocr: 'OCR 识别' },
	en: { edit: 'Edit PDF', convert: 'Convert PDF', security: 'Secure PDF', ocr: 'OCR PDF' },
};

const categoryCardsByLocale: Record<Locale, CategoryCard[]> = {
	'zh-cn': [
		{ name: '编辑', description: '覆盖高频 PDF 编辑需求，适合做工具聚合与内链扩展。', slugs: ['merge-pdf', 'split-pdf', 'rotate-pdf'] },
		{ name: '优化', description: '用于压缩、减小体积和输出更轻量的 PDF 文件。', slugs: ['compress-pdf'] },
		{ name: '转换', description: '围绕 PDF 和 DOCX 的双向转换，承接常见办公流量。', slugs: ['pdf-to-word', 'word-to-pdf'] },
		{ name: '安全与识别', description: '覆盖水印、解锁、加密和 OCR 等高意图工具页。', slugs: ['pdf-watermark', 'unlock-pdf', 'protect-pdf', 'ocr-pdf'] },
	],
	en: [
		{ name: 'Edit', description: 'Core PDF editing routes for utility searches and internal linking.', slugs: ['merge-pdf', 'split-pdf', 'rotate-pdf'] },
		{ name: 'Optimize', description: 'Compression routes for upload limits, email, and storage control.', slugs: ['compress-pdf'] },
		{ name: 'Convert', description: 'DOCX and PDF conversion routes built around browser-first workflows.', slugs: ['pdf-to-word', 'word-to-pdf'] },
		{ name: 'Secure & OCR', description: 'Watermarking, unlocking, protection, and OCR extraction routes.', slugs: ['pdf-watermark', 'unlock-pdf', 'protect-pdf', 'ocr-pdf'] },
	],
};

const homeCopyByLocale: Record<Locale, HomeCopy> = {
	'zh-cn': {
		nav: { allTools: '全部工具', categories: '工具分类', faq: '常见问题', start: '先用 PDF 合并' },
		hero: {
			badge: '基于开源库的免费在线 PDF 工具站',
			title: '免费 PDF 工具站，支持多语言页面、浏览器处理和清晰上传下载流程。',
			description: '一个轻量、可扩展、利于 SEO 的 PDF 工具站，覆盖合并、拆分、压缩、转换、OCR、水印、解锁、加密和旋转。',
			primary: '打开 PDF 合并',
			secondary: '打开 PDF 转 Word',
			pills: ['无需注册', '核心依赖均为可商用开源库', 'Cloudflare 友好部署'],
		},
		stack: {
			eyebrow: '推荐栈',
			title: '面向 Cloudflare 的独立 PDF 工具站',
			adSlot: '广告位预留',
			items: [
				{ title: '前端', description: 'Astro、Tailwind CSS、Flowbite 风格组件和浏览器上传交互。' },
				{ title: 'PDF 引擎', description: 'PDF.js、pdf-lib、qpdf-wasm、tesseract.js、mammoth、docx、jsPDF。' },
				{ title: 'SEO', description: '静态友好路由、每页独立 metadata、FAQ schema、内链和 sitemap。' },
				{ title: '变现', description: '极简工具站布局，预留稳定广告位，方便后续接入 AdSense。' },
			],
		},
		tools: { eyebrow: '工具目录', title: '一个站点覆盖所有 PDF 工具', description: '每个工具页都具备独立 title、description、H1、FAQ 和相关工具内链。' },
		categories: { eyebrow: '工具分类', title: '按 SEO 工具站结构扩展更多语言和更多路由' },
		seo: {
			eyebrow: 'SEO 文案',
			title: '为什么这个多语言 PDF 工具站结构更适合长期扩展',
			paragraphs: [
				'首页覆盖“免费 PDF 工具”这类宽词，每个工具页覆盖 merge pdf、split pdf、unlock pdf、protect pdf、ocr pdf、rotate pdf 等明确意图词。',
				'页面结构保持“静态文案优先，交互工作台其次”，既利于搜索引擎抓取，也利于后续增加广告位和更多工具页。',
			],
		},
		ads: { eyebrow: '广告友好布局', title: '预留稳定广告位，方便后续变现', items: ['首屏上方横幅位', '工具正文与 FAQ 之间的原生广告位', '页脚栅格广告位'] },
		faq: {
			eyebrow: '首页 FAQ',
			title: '用户上传 PDF 前最常问的问题',
			items: [
				{ question: '这些 PDF 工具免费吗？', answer: '是。站点定位就是免费在线 PDF 工具，优先采用浏览器侧处理来降低成本。' },
				{ question: '是否依赖商用受限的 PDF SDK？', answer: '没有。当前核心能力基于 PDF.js、pdf-lib、qpdf-wasm、tesseract.js、mammoth、docx、jsPDF 等可商用开源库。' },
				{ question: '为什么每个工具都要独立 URL？', answer: '独立工具页更适合 SEO，每个页面可以围绕单一搜索意图输出专属 title、description、FAQ 和内链。' },
				{ question: '站点可以部署到 Cloudflare 吗？', answer: '可以。当前使用 Astro 和 Cloudflare 适配器，页面静态友好，适合后续部署到 Workers 体系。' },
			],
		},
		footer: { description: '一个基于可商用开源库构建的轻量 PDF 工具站，后续可以继续扩展更多语言和更多工具页。', popularRoutes: '热门路由', securityRoutes: '安全工具' },
	},
	en: {
		nav: { allTools: 'All Tools', categories: 'Categories', faq: 'FAQ', start: 'Start With Merge PDF' },
		hero: {
			badge: 'Free online PDF tools powered by open-source libraries',
			title: 'Free PDF tools with multilingual pages, browser-first processing, and a clean upload flow.',
			description: 'A lightweight, SEO-friendly PDF tool site for merge, split, compress, PDF to Word, Word to PDF, OCR, watermark, unlock, protect, and rotate workflows.',
			primary: 'Open Merge PDF',
			secondary: 'Open PDF to Word',
			pills: ['No account required', 'Commercial-friendly open-source stack', 'Cloudflare-friendly deployment'],
		},
		stack: {
			eyebrow: 'Featured Stack',
			title: 'Cloudflare-ready PDF tool station',
			adSlot: 'Ad Slot Ready',
			items: [
				{ title: 'Frontend', description: 'Astro, Tailwind CSS, Flowbite-style components, and browser-native upload UX.' },
				{ title: 'PDF Engines', description: 'PDF.js, pdf-lib, qpdf-wasm, tesseract.js, mammoth, docx, and jsPDF.' },
				{ title: 'SEO', description: 'Static-friendly routes, per-tool metadata, FAQ schema, internal links, and sitemap.' },
				{ title: 'Monetization', description: 'Minimal layout with stable placement for future AdSense blocks.' },
			],
		},
		tools: { eyebrow: 'Tool Directory', title: 'All PDF tools on one site', description: 'Each tool route has its own title, meta description, H1, FAQ block, and related links.' },
		categories: { eyebrow: 'Tool Categories', title: 'A route structure that scales to more languages and more tools' },
		seo: {
			eyebrow: 'SEO Copy',
			title: 'Why this multilingual PDF tool structure is built for long-term growth',
			paragraphs: [
				'The homepage targets broad free PDF tool queries while each tool route targets a specific search intent such as merge PDF, split PDF, unlock PDF, protect PDF, OCR PDF, or rotate PDF.',
				'The pages stay light by putting static copy first and the interactive workbench second, which helps crawlability, performance, and future monetization.',
			],
		},
		ads: { eyebrow: 'Ad-Friendly Layout', title: 'Prepared for future monetization', items: ['Above-the-fold banner slot', 'In-content native block between tool intro and FAQ', 'Footer grid slot for AdSense or affiliate widgets'] },
		faq: {
			eyebrow: 'Homepage FAQ',
			title: 'Questions users ask before uploading a PDF',
			items: [
				{ question: 'Are these PDF tools free to use?', answer: 'Yes. The site is designed as a free online PDF tool station with browser-side processing for common workflows.' },
				{ question: 'Do the tools rely on commercial-only SDKs?', answer: 'No. The current implementation uses commercial-friendly open-source libraries such as PDF.js, pdf-lib, qpdf-wasm, tesseract.js, mammoth, docx, and jsPDF.' },
				{ question: 'Why does each tool have its own URL?', answer: 'Dedicated tool routes are better for SEO because each page can target a single intent with tailored metadata, FAQ, and internal links.' },
				{ question: 'Can this site run on Cloudflare?', answer: 'Yes. The site uses Astro with the Cloudflare adapter and keeps routes static-friendly for deployment in the Cloudflare ecosystem.' },
			],
		},
		footer: { description: 'A lightweight PDF tool station built with commercial-friendly open-source libraries and a route structure that scales to more languages and more tools.', popularRoutes: 'Popular routes', securityRoutes: 'Security tools' },
	},
};

const toolPageCopyByLocale: Record<Locale, ToolPageCopy> = {
	'zh-cn': {
		home: '首页',
		tool: '工具区',
		faq: '常见问题',
		moreTools: '更多工具',
		howItWorksEyebrow: '使用步骤',
		howItWorksTitle: (toolName) => `如何使用 ${toolName}`,
		steps: [
			{ title: '上传源文件', description: '按工具类型上传 PDF、DOCX 或图片文件，并在右侧查看预览。' },
			{ title: '设置输出参数', description: '根据需要配置页码范围、密码、旋转角度、水印内容或 OCR 输出格式。' },
			{ title: '下载结果', description: '浏览器执行处理后会直接生成下载按钮，并显示结果说明。' },
		],
		faqEyebrow: 'FAQ',
		faqTitle: (toolName) => `${toolName} 常见问题`,
		adEyebrow: '广告位',
		adBody: '这里预留给 AdSense、联盟推荐或赞助位。',
		relatedEyebrow: '相关工具',
	},
	en: {
		home: 'Home',
		tool: 'Tool',
		faq: 'FAQ',
		moreTools: 'More tools',
		howItWorksEyebrow: 'How It Works',
		howItWorksTitle: (toolName) => `How to use ${toolName.toLowerCase()}`,
		steps: [
			{ title: 'Upload the source file', description: 'Choose a PDF, DOCX, or image depending on the tool and review the preview panel.' },
			{ title: 'Configure the output', description: 'Adjust ranges, passwords, rotation, watermark text, or OCR output format before processing.' },
			{ title: 'Download the result', description: 'The browser runs the job and returns a direct download button with a result summary.' },
		],
		faqEyebrow: 'FAQ',
		faqTitle: (toolName) => `Questions about ${toolName.toLowerCase()}`,
		adEyebrow: 'Ad Space',
		adBody: 'Reserved block for AdSense, affiliate offers, or sponsored placements.',
		relatedEyebrow: 'Related Tools',
	},
};

const toolBase: ToolStatic[] = [
	{ slug: 'merge-pdf', category: 'edit', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传两个或更多 PDF 文件，浏览器会在本地完成合并。', en: 'Upload two or more PDF files. Processing happens locally in the browser.' }, allowMultiple: true, related: ['split-pdf', 'compress-pdf', 'pdf-watermark'] },
	{ slug: 'split-pdf', category: 'edit', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个 PDF，然后输入如 1-2,4,7-9 的页码范围。', en: 'Upload one PDF, then define ranges such as 1-2,4,7-9.' }, allowMultiple: false, related: ['merge-pdf', 'rotate-pdf', 'protect-pdf'] },
	{ slug: 'compress-pdf', category: 'edit', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个 PDF，并通过质量滑块控制压缩强度。', en: 'Upload one PDF and choose a JPEG quality level.' }, allowMultiple: false, related: ['merge-pdf', 'pdf-to-word', 'ocr-pdf'] },
	{ slug: 'pdf-to-word', category: 'convert', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个文本型 PDF，效果通常优于扫描件。', en: 'Upload one PDF. Best results come from text-based PDFs.' }, allowMultiple: false, related: ['word-to-pdf', 'ocr-pdf', 'compress-pdf'] },
	{ slug: 'word-to-pdf', category: 'convert', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', acceptHint: { 'zh-cn': '上传 DOCX 文件，浏览器会先解析文档再导出 PDF。', en: 'Upload a DOCX file and export a PDF in the browser.' }, allowMultiple: false, related: ['pdf-to-word', 'merge-pdf', 'protect-pdf'] },
	{ slug: 'ocr-pdf', category: 'ocr', accept: '.pdf,application/pdf,image/png,image/jpeg,image/webp', acceptHint: { 'zh-cn': '支持上传扫描 PDF 或图片，识别效果取决于原文件清晰度。', en: 'Upload one scanned PDF or image file. OCR accuracy depends on quality.' }, allowMultiple: false, related: ['pdf-to-word', 'compress-pdf', 'unlock-pdf'] },
	{ slug: 'pdf-watermark', category: 'security', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个 PDF，设置水印文字和透明度后即可导出。', en: 'Upload one PDF and configure the watermark text before exporting.' }, allowMultiple: false, related: ['protect-pdf', 'merge-pdf', 'rotate-pdf'] },
	{ slug: 'unlock-pdf', category: 'security', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传加密 PDF，并输入当前密码来移除保护。', en: 'Upload one protected PDF and enter the current password.' }, allowMultiple: false, related: ['protect-pdf', 'ocr-pdf', 'pdf-watermark'] },
	{ slug: 'protect-pdf', category: 'security', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个 PDF，并设置打开密码和可选的所有者密码。', en: 'Upload one PDF and set an open password and optional owner password.' }, allowMultiple: false, related: ['unlock-pdf', 'pdf-watermark', 'word-to-pdf'] },
	{ slug: 'rotate-pdf', category: 'edit', accept: '.pdf,application/pdf', acceptHint: { 'zh-cn': '上传一个 PDF，然后选择页面旋转角度。', en: 'Upload one PDF and choose the rotation angle.' }, allowMultiple: false, related: ['split-pdf', 'merge-pdf', 'pdf-watermark'] },
];

const toolCopyByLocale: Record<Locale, Record<ToolSlug, ToolCopy>> = {
	'zh-cn': {
		'merge-pdf': {
			name: 'PDF 合并',
			title: '免费在线合并 PDF：在浏览器中合并多个 PDF 文件',
			metaDescription: '免费在线合并 PDF 文件。上传多个 PDF 后直接导出一个合并结果，无需注册。',
			h1: '免费在线合并 PDF 文件',
			intro: '把多个 PDF 合并成一个文档，适合合同、发票、报告和批量资料整理。',
			pageCopy: '这个页面围绕“合并 PDF”这一高意图词构建，页面静态文案负责 SEO，上传工作台负责真实工具转化。',
			actionLabel: '合并 PDF',
			highlights: ['支持多文件上传', '一个结果文件直接下载', '浏览器本地处理'],
			cardDescription: '把多个 PDF 文件合并成一个文档。',
			engineSummary: '由 pdf-lib 在浏览器中完成页面复制和文档合并。',
			faqs: [
				{ question: 'PDF 合并是在本地完成的吗？', answer: '是。当前实现优先在浏览器本地完成合并，降低服务器成本。' },
				{ question: '能一次合并多个 PDF 吗？', answer: '可以。上传框支持选择多个 PDF 文件并生成一个合并结果。' },
				{ question: '页面顺序会保留吗？', answer: '会。工具会按你选择文件的顺序复制页面并生成输出。' },
			],
		},
		'split-pdf': {
			name: 'PDF 拆分',
			title: '免费在线拆分 PDF：按页码范围提取 PDF 页面',
			metaDescription: '免费在线拆分 PDF。支持输入 1-2、4、7-9 这类页码范围，并以 ZIP 形式下载结果。',
			h1: '按页码范围拆分 PDF',
			intro: '提取单页或多个页码区间，并将拆分结果打包为 ZIP 下载。',
			pageCopy: '这个工具页适合围绕“拆分 PDF”“提取 PDF 页面”等关键词扩展长尾流量。',
			actionLabel: '拆分 PDF',
			highlights: ['自定义范围', 'ZIP 打包下载', '页级拆分控制'],
			cardDescription: '按指定页码范围拆分 PDF 页面。',
			engineSummary: '由 pdf-lib 提取页面，JSZip 负责打包多个输出文件。',
			faqs: [
				{ question: '页码范围怎么填写？', answer: '使用逗号分隔多个范围，例如 1-2,4,7-9。' },
				{ question: '拆分后会输出什么？', answer: '每个范围会生成一个 PDF，并统一打包成 ZIP 文件。' },
				{ question: '支持只提取单页吗？', answer: '支持，直接填写单个页码即可。' },
			],
		},
		'compress-pdf': {
			name: 'PDF 压缩',
			title: '免费在线压缩 PDF：减小 PDF 文件大小',
			metaDescription: '免费在线压缩 PDF。通过页面重建和图像压缩来减小文件体积，适合上传和发送。',
			h1: '在线压缩 PDF 文件大小',
			intro: '通过质量滑块控制压缩强度，生成更轻量的 PDF 下载结果。',
			pageCopy: '这个工具优先解决“文件太大传不上去”的真实需求，适合表单上传、邮箱附件和网盘场景。',
			actionLabel: '压缩 PDF',
			highlights: ['质量滑块控制', '减小结果体积', '浏览器侧执行'],
			cardDescription: '减小 PDF 文件体积，便于上传和发送。',
			engineSummary: '使用 PDF.js 渲染页面，再由 jsPDF 重新生成更轻量的 PDF。',
			faqs: [
				{ question: '压缩会影响清晰度吗？', answer: '会。压缩通过重建页面图片来换取更小体积，因此画质会有变化。' },
				{ question: '这是无损压缩吗？', answer: '不是。当前实现更偏向实用型压缩，优先明显减小文件体积。' },
				{ question: '适合什么场景？', answer: '适合上传受限、邮件发送或需要控制存储空间的场景。' },
			],
		},
		'pdf-to-word': {
			name: 'PDF 转 Word',
			title: '免费在线 PDF 转 Word：导出可编辑 DOCX',
			metaDescription: '免费在线将 PDF 转为 Word。提取 PDF 文本并导出为可编辑 DOCX 文件。',
			h1: '在线把 PDF 转成 Word',
			intro: '适合文本型 PDF，提取页面文本后生成可编辑的 DOCX 文件。',
			pageCopy: '这个页面用于承接“pdf to word”“pdf 转 word”等高转化搜索词，重点是可编辑输出而不是复杂排版还原。',
			actionLabel: '转换为 Word',
			highlights: ['导出 DOCX', '按页抽取文本', '浏览器中转换'],
			cardDescription: '提取 PDF 文本并导出为可编辑 Word 文档。',
			engineSummary: '由 PDF.js 提取文本，再由 docx 生成 Word 输出。',
			faqs: [
				{ question: '能完整保留原排版吗？', answer: '当前版本更偏向文字可编辑，不追求复杂版式 1:1 还原。' },
				{ question: '扫描件也能转吗？', answer: '扫描件建议先使用 OCR 工具，再导出 Word。' },
				{ question: '输出格式是什么？', answer: '输出为 DOCX，可在 Word 或兼容编辑器中打开。' },
			],
		},
		'word-to-pdf': {
			name: 'Word 转 PDF',
			title: '免费在线 Word 转 PDF：把 DOCX 导出为 PDF',
			metaDescription: '免费在线将 Word 转换为 PDF。上传 DOCX 后在浏览器中导出 PDF 文件。',
			h1: '在线把 Word 转成 PDF',
			intro: '上传 DOCX 文档，预览内容后导出 PDF 文件，适合轻量办公转换。',
			pageCopy: '该页面围绕 Word 转 PDF 的办公刚需构建，适合后续扩展更多语言和更多办公文档入口页。',
			actionLabel: '转换为 PDF',
			highlights: ['支持 DOCX 上传', '预览后导出', '浏览器中生成 PDF'],
			cardDescription: '把 DOCX 文档导出为 PDF 文件。',
			engineSummary: '由 mammoth 解析 DOCX，再由 jsPDF 导出 PDF。',
			faqs: [
				{ question: '支持哪种 Word 格式？', answer: '当前支持现代 DOCX 格式。' },
				{ question: '需要安装 Word 吗？', answer: '不需要，浏览器会直接完成转换流程。' },
				{ question: '上传后能先预览吗？', answer: '可以，右侧预览区域会显示文档内容摘要。' },
			],
		},
		'ocr-pdf': {
			name: 'OCR PDF',
			title: '免费在线 OCR PDF：识别扫描 PDF 和图片文字',
			metaDescription: '免费在线 OCR 识别扫描 PDF 或图片，支持导出为 DOCX 或 TXT。',
			h1: '在线识别扫描 PDF 文本',
			intro: '把扫描版 PDF 或图片中的文字识别出来，导出为可编辑文本。',
			pageCopy: '这个页面适合承接“ocr pdf”“扫描 PDF 识别”等高意图流量，并支持后续扩展更多语言 OCR。',
			actionLabel: '开始 OCR',
			highlights: ['支持 PDF 和图片', '可导出 DOCX 或 TXT', '浏览器中 OCR'],
			cardDescription: '识别扫描 PDF 或图片中的文字内容。',
			engineSummary: '由 PDF.js 渲染页面，tesseract.js 进行 OCR，再由 docx 导出结果。',
			faqs: [
				{ question: '图片文件也能识别吗？', answer: '可以，当前支持 PDF 以及常见图片格式。' },
				{ question: 'OCR 后能下载什么格式？', answer: '可以导出为 DOCX 或纯文本 TXT。' },
				{ question: '识别准确率稳定吗？', answer: '准确率取决于清晰度、对比度、字体和原文件质量。' },
			],
		},
		'pdf-watermark': {
			name: 'PDF 加水印',
			title: '免费在线给 PDF 加水印',
			metaDescription: '免费在线为 PDF 添加文字水印。设置水印文字和透明度后即可导出。',
			h1: '在线给 PDF 添加文字水印',
			intro: '适合草稿、内部分发、品牌文件和演示版文档。',
			pageCopy: '水印工具页适合承接“pdf watermark”“给 pdf 加水印”等安全类和办公类需求流量。',
			actionLabel: '添加水印',
			highlights: ['自定义文字', '透明度可调', '每页统一加水印'],
			cardDescription: '给 PDF 每一页添加统一文字水印。',
			engineSummary: '使用 pdf-lib 在每页直接绘制文字水印。',
			faqs: [
				{ question: '能修改水印文字吗？', answer: '可以，输入任意文字即可。' },
				{ question: '所有页面都会加上水印吗？', answer: '会，当前实现默认对每一页统一处理。' },
				{ question: '能调节水印强度吗？', answer: '可以，通过透明度滑块控制。' },
			],
		},
		'unlock-pdf': {
			name: 'PDF 解锁',
			title: '免费在线解锁 PDF：移除 PDF 密码保护',
			metaDescription: '免费在线解锁 PDF。输入当前密码后移除保护，并下载无密码版本。',
			h1: '解锁带密码保护的 PDF',
			intro: '适用于你已知当前密码，希望导出一个无需再次输入密码的版本。',
			pageCopy: '该页面使用 qpdf 的 WebAssembly 构建完成解锁能力，适合做安全类 SEO 路由。',
			actionLabel: '解锁 PDF',
			highlights: ['输入当前密码即可解锁', 'WASM 浏览器处理', '无需注册'],
			cardDescription: '输入当前密码后移除 PDF 保护。',
			engineSummary: '基于 qpdf-wasm，在浏览器中执行 PDF 解密处理。',
			faqs: [
				{ question: '必须知道当前密码吗？', answer: '必须。这是一个合法使用场景下的解锁工具，不用于绕过未知密码。' },
				{ question: '解锁是在本地完成的吗？', answer: '当前实现通过 qpdf WebAssembly 在浏览器中执行。' },
				{ question: '所有加密 PDF 都能解锁吗？', answer: '只要 qpdf 能识别且密码正确，就可以尝试导出。' },
			],
		},
		'protect-pdf': {
			name: 'PDF 加密',
			title: '免费在线加密 PDF：为 PDF 添加打开密码',
			metaDescription: '免费在线为 PDF 添加打开密码。支持设置用户密码和所有者密码。',
			h1: '给 PDF 添加密码保护',
			intro: '为 PDF 增加打开密码，适合共享前做基础访问控制。',
			pageCopy: '这个页面适合承接“protect pdf”“给 pdf 加密”等强意图关键词，并直接服务转化。',
			actionLabel: '加密 PDF',
			highlights: ['打开密码', '所有者密码', 'WASM 浏览器加密'],
			cardDescription: '为 PDF 设置打开密码和可选的所有者密码。',
			engineSummary: '基于 qpdf-wasm 在浏览器中完成 PDF 加密。',
			faqs: [
				{ question: '什么是打开密码？', answer: '打开密码是用户查看 PDF 前必须输入的密码。' },
				{ question: '什么是所有者密码？', answer: '所有者密码通常用于管理权限或后续维护。' },
				{ question: '所有者密码能留空吗？', answer: '可以，当前实现会在必要时复用打开密码。' },
			],
		},
		'rotate-pdf': {
			name: 'PDF 旋转',
			title: '免费在线旋转 PDF：90、180、270 度旋转页面',
			metaDescription: '免费在线旋转 PDF 页面，支持 90、180、270 度整体旋转后导出。',
			h1: '在线旋转 PDF 页面',
			intro: '适合横向扫描、倒置文件或手机拍照导出的页面方向修正。',
			pageCopy: '旋转工具页适合快速解决页面方向错误问题，是 PDF 工具站里很稳定的一类实用工具路由。',
			actionLabel: '旋转 PDF',
			highlights: ['支持 90/180/270 度', '快速修正页面方向', '浏览器中导出'],
			cardDescription: '快速旋转 PDF 页面方向并重新导出。',
			engineSummary: '使用 pdf-lib 修改页面旋转信息并导出新文件。',
			faqs: [
				{ question: '支持旋转 90 度吗？', answer: '支持，也支持 180 度和 270 度。' },
				{ question: '会旋转全部页面吗？', answer: '当前版本会统一处理整个 PDF 的所有页面。' },
				{ question: '输出结果是新文件吗？', answer: '是，工具会生成一个新的旋转结果文件。' },
			],
		},
	},
	en: {
		'merge-pdf': {
			name: 'Merge PDF',
			title: 'Merge PDF Online Free: Combine PDF Files in Your Browser',
			metaDescription: 'Merge PDF files online for free. Upload multiple PDFs and download one combined file without creating an account.',
			h1: 'Merge PDF files online for free',
			intro: 'Combine multiple PDF files into one clean document with a browser-based upload flow designed for speed and clarity.',
			pageCopy: 'This route is built for the high-intent merge PDF query. Static copy handles SEO while the upload workbench handles the actual conversion flow.',
			actionLabel: 'Merge PDFs',
			highlights: ['Multiple file upload', 'Single merged download', 'Browser-side processing'],
			cardDescription: 'Combine multiple PDF files into one document.',
			engineSummary: 'Built with pdf-lib in the browser for lightweight page copying and merge output.',
			faqs: [
				{ question: 'Is the merge process done on my device?', answer: 'Yes. This implementation merges files in the browser using open-source JavaScript libraries.' },
				{ question: 'Can I merge more than two PDFs?', answer: 'Yes. The upload input accepts multiple PDFs so you can combine several files in one run.' },
				{ question: 'Will the output keep the original page order?', answer: 'Yes. The tool copies pages according to the order of the selected files.' },
			],
		},
		'split-pdf': {
			name: 'Split PDF',
			title: 'Split PDF Online Free: Extract PDF Pages by Range',
			metaDescription: 'Split PDF pages online for free. Extract custom page ranges and download the results as a ZIP archive.',
			h1: 'Split PDF pages by custom range',
			intro: 'Extract exact pages or page ranges from a PDF and download the output as a ZIP package.',
			pageCopy: 'This tool route targets split PDF and extract PDF pages queries with a simple range-based flow.',
			actionLabel: 'Split PDF',
			highlights: ['Custom range syntax', 'ZIP output', 'Page-level extraction'],
			cardDescription: 'Extract selected pages from a PDF and download the parts.',
			engineSummary: 'Uses pdf-lib for extraction and JSZip for bundled output.',
			faqs: [
				{ question: 'How do I enter page ranges?', answer: 'Use commas to separate ranges, for example 1-2,4,7-9.' },
				{ question: 'What happens after splitting?', answer: 'The tool creates one PDF per range and packages them into a ZIP archive.' },
				{ question: 'Can I extract a single page?', answer: 'Yes. Enter a single page number such as 4.' },
			],
		},
		'compress-pdf': {
			name: 'Compress PDF',
			title: 'Compress PDF Online Free: Reduce PDF File Size',
			metaDescription: 'Compress PDF online for free. Rebuild pages with lighter images and reduce PDF file size for upload and sharing.',
			h1: 'Compress PDF file size online',
			intro: 'Reduce PDF size with a browser-based compression flow and a simple quality slider.',
			pageCopy: 'This route is built for people who need smaller files for email attachments, upload limits, or storage control.',
			actionLabel: 'Compress PDF',
			highlights: ['Quality slider', 'Smaller output', 'Browser-side execution'],
			cardDescription: 'Reduce PDF file size for upload and sharing.',
			engineSummary: 'Uses PDF.js to render pages and jsPDF to rebuild a lighter PDF output.',
			faqs: [
				{ question: 'Does compression affect quality?', answer: 'Yes. Lower values reduce size more aggressively by recompressing rendered page images.' },
				{ question: 'Is this a lossless compressor?', answer: 'No. This implementation is intentionally lossy to achieve stronger size reduction.' },
				{ question: 'When should I use it?', answer: 'Use it when your PDF is too large for upload limits, email, or storage constraints.' },
			],
		},
		'pdf-to-word': {
			name: 'PDF to Word',
			title: 'PDF to Word Online Free: Export PDF Text to DOCX',
			metaDescription: 'Convert PDF to Word online for free. Extract text from PDF pages and export an editable DOCX file.',
			h1: 'Convert PDF to Word online',
			intro: 'Turn a text-based PDF into an editable DOCX document using a browser-first extraction flow.',
			pageCopy: 'This route is designed for PDF to Word intent where editable text matters more than perfect layout fidelity.',
			actionLabel: 'Convert to Word',
			highlights: ['DOCX export', 'Page-by-page text extraction', 'Runs in the browser'],
			cardDescription: 'Extract PDF text and export it into an editable DOCX file.',
			engineSummary: 'Uses PDF.js for text extraction and docx for Word output generation.',
			faqs: [
				{ question: 'Will this keep the original layout?', answer: 'This version focuses on editable text rather than full visual layout reproduction.' },
				{ question: 'Does it work on scanned PDFs?', answer: 'For scanned PDFs, use the OCR tool first and then export the result.' },
				{ question: 'What file format do I get?', answer: 'The output is a DOCX file that opens in Microsoft Word and compatible editors.' },
			],
		},
		'word-to-pdf': {
			name: 'Word to PDF',
			title: 'Word to PDF Online Free: Convert DOCX Files to PDF',
			metaDescription: 'Convert Word to PDF online for free. Upload a DOCX file and export a PDF in the browser.',
			h1: 'Convert Word to PDF online',
			intro: 'Upload a DOCX document, preview the content, and generate a PDF file in the browser.',
			pageCopy: 'This route addresses a common office workflow and is a strong candidate for multilingual long-tail SEO expansion.',
			actionLabel: 'Convert to PDF',
			highlights: ['DOCX upload', 'Preview before export', 'PDF generated in browser'],
			cardDescription: 'Turn a DOCX document into a downloadable PDF.',
			engineSummary: 'Uses mammoth for DOCX parsing and jsPDF for PDF export.',
			faqs: [
				{ question: 'Which Word format is supported?', answer: 'This implementation currently supports DOCX.' },
				{ question: 'Do I need Word installed?', answer: 'No. The browser handles the conversion flow directly.' },
				{ question: 'Can I preview the file first?', answer: 'Yes. The preview panel shows a rendered summary after upload.' },
			],
		},
		'ocr-pdf': {
			name: 'OCR PDF',
			title: 'OCR PDF Online Free: Extract Text from Scanned PDFs',
			metaDescription: 'Run OCR on scanned PDFs or images online for free and export the recognized text as DOCX or TXT.',
			h1: 'OCR scanned PDF files online',
			intro: 'Extract text from scanned PDFs or images using browser-side OCR powered by open-source libraries.',
			pageCopy: 'This route targets OCR PDF and scanned PDF text extraction queries with editable output formats.',
			actionLabel: 'Run OCR',
			highlights: ['PDF and image input', 'DOCX or TXT output', 'OCR in the browser'],
			cardDescription: 'Extract text from scanned PDFs and images with OCR.',
			engineSummary: 'Uses PDF.js for rendering, tesseract.js for OCR, and docx for editable output.',
			faqs: [
				{ question: 'Does OCR work on image files too?', answer: 'Yes. This route accepts PDFs as well as common image formats.' },
				{ question: 'What can I download after OCR?', answer: 'You can export the recognized content as DOCX or plain text.' },
				{ question: 'Is OCR always accurate?', answer: 'Accuracy depends on scan clarity, contrast, font style, and source quality.' },
			],
		},
		'pdf-watermark': {
			name: 'PDF Watermark',
			title: 'Add Watermark to PDF Online Free',
			metaDescription: 'Add a text watermark to PDF online for free. Set the watermark text and opacity, then download the result.',
			h1: 'Add a text watermark to PDF online',
			intro: 'Stamp every page of a PDF with a visible text watermark for internal sharing, drafts, or branding.',
			pageCopy: 'This route supports watermark-related searches and converts well for document sharing and draft workflows.',
			actionLabel: 'Add Watermark',
			highlights: ['Custom text watermark', 'Opacity slider', 'Every-page stamping'],
			cardDescription: 'Stamp every page with a simple text watermark.',
			engineSummary: 'Uses pdf-lib to draw watermark text directly onto each page.',
			faqs: [
				{ question: 'Can I change the watermark text?', answer: 'Yes. Enter any text before generating the output.' },
				{ question: 'Will every page get the watermark?', answer: 'Yes. The current implementation applies the watermark to every page.' },
				{ question: 'Can I control watermark strength?', answer: 'Yes. Use the opacity slider to make it lighter or stronger.' },
			],
		},
		'unlock-pdf': {
			name: 'Unlock PDF',
			title: 'Unlock PDF Online Free: Remove PDF Password Protection',
			metaDescription: 'Unlock PDF online for free with your current password and download an unlocked version.',
			h1: 'Unlock a password-protected PDF',
			intro: 'Use your existing password to remove PDF protection and export a file that opens without a password prompt.',
			pageCopy: 'This route uses qpdf compiled to WebAssembly and is built for legitimate unlock workflows where the current password is known.',
			actionLabel: 'Unlock PDF',
			highlights: ['Use the current password', 'WASM-based processing', 'No account required'],
			cardDescription: 'Remove PDF password protection when you know the current password.',
			engineSummary: 'Uses qpdf-wasm in the browser for PDF decryption.',
			faqs: [
				{ question: 'Do I need the current password?', answer: 'Yes. This tool is designed for legitimate use cases where you already know the password.' },
				{ question: 'Where is unlocking processed?', answer: 'The page uses qpdf compiled to WebAssembly directly in the browser.' },
				{ question: 'Can it unlock every encrypted PDF?', answer: 'It can unlock PDFs that qpdf can open with the correct password.' },
			],
		},
		'protect-pdf': {
			name: 'Protect PDF',
			title: 'Protect PDF Online Free: Add PDF Password Protection',
			metaDescription: 'Protect PDF online for free by adding an open password and optional owner password.',
			h1: 'Add password protection to a PDF',
			intro: 'Encrypt a PDF with an open password before sharing it with clients, teams, or external users.',
			pageCopy: 'This route is built for protect PDF and PDF encryption search intent and converts directly with a simple workbench.',
			actionLabel: 'Protect PDF',
			highlights: ['Open password', 'Owner password', 'WASM-based encryption'],
			cardDescription: 'Add an open password and optional owner password to a PDF.',
			engineSummary: 'Uses qpdf-wasm in the browser to apply PDF encryption.',
			faqs: [
				{ question: 'What is the open password?', answer: 'It is the password a user must enter before opening the PDF.' },
				{ question: 'What is the owner password?', answer: 'It is a secondary administrative password often used for management or permissions.' },
				{ question: 'Can I leave owner password empty?', answer: 'Yes. The current implementation can reuse the open password when needed.' },
			],
		},
		'rotate-pdf': {
			name: 'Rotate PDF',
			title: 'Rotate PDF Online Free: Turn Pages 90, 180, or 270 Degrees',
			metaDescription: 'Rotate PDF online for free. Turn every page by 90, 180, or 270 degrees and download the result.',
			h1: 'Rotate PDF pages online',
			intro: 'Fix sideways scans, upside-down exports, and camera-captured files with one quick rotation tool.',
			pageCopy: 'Rotate PDF is a stable utility route for correcting page orientation and expanding multilingual SEO coverage.',
			actionLabel: 'Rotate PDF',
			highlights: ['90, 180, and 270 degrees', 'Fast page correction', 'Browser-side export'],
			cardDescription: 'Rotate every page in a PDF by a fixed angle.',
			engineSummary: 'Uses pdf-lib to update rotation metadata and export a new file.',
			faqs: [
				{ question: 'Can I rotate pages by 90 degrees?', answer: 'Yes. You can choose 90, 180, or 270 degrees before processing.' },
				{ question: 'Does it rotate all pages?', answer: 'Yes. The current version rotates every page in the uploaded PDF.' },
				{ question: 'Will the output be a new file?', answer: 'Yes. The tool generates a new rotated PDF for download.' },
			],
		},
	},
};

export function getLocaleMeta(locale: Locale) {
	return locales.find((entry) => entry.code === locale) ?? locales[0];
}

export function getLocalePath(locale: Locale, slug?: ToolSlug) {
	const prefix = locale === defaultLocale ? '' : `/${locale}`;
	return slug ? `${prefix}/${slug}/` : `${prefix || '/'}`;
}

export function getHomeCopy(locale: Locale) {
	return homeCopyByLocale[locale];
}

export function getToolPageCopy(locale: Locale) {
	return toolPageCopyByLocale[locale];
}

export function getCategoryCards(locale: Locale) {
	return categoryCardsByLocale[locale];
}

export function getTools(locale: Locale): ToolDefinition[] {
	return toolBase.map((item) => ({
		...item,
		...toolCopyByLocale[locale][item.slug],
		locale,
		categoryLabel: categoryLabels[locale][item.category],
		path: getLocalePath(locale, item.slug),
	}));
}

export function getToolBySlug(locale: Locale, slug: ToolSlug) {
	return getTools(locale).find((tool) => tool.slug === slug);
}

export function getHomeSeo(locale: Locale) {
	return locale === 'zh-cn'
		? {
				title: 'PDFKing：免费在线 PDF 工具站，支持合并、拆分、压缩、转换、OCR、水印、解锁、加密、旋转',
				description: '免费在线 PDF 工具站，支持 PDF 合并、拆分、压缩、PDF 转 Word、Word 转 PDF、OCR、水印、解锁、加密和旋转。',
			}
		: {
				title: 'PDFKing: Free Online PDF Tools for Merge, Split, Compress, Convert, OCR, Watermark, Unlock, Protect, and Rotate',
				description: 'Use free online PDF tools to merge PDF, split PDF, compress PDF, convert PDF to Word, convert Word to PDF, OCR scanned PDFs, add watermarks, unlock PDFs, protect PDFs, and rotate pages.',
			};
}

export function getAlternates(slug?: ToolSlug) {
	return locales.map((locale) => ({
		hreflang: locale.htmlLang,
		href: getLocalePath(locale.code, slug),
		label: locale.label,
		code: locale.code,
	}));
}

export function buildHomeSchema(locale: Locale, url: string) {
	const home = getHomeCopy(locale);
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteMeta.siteName,
			url,
			description: getHomeSeo(locale).description,
			inLanguage: getLocaleMeta(locale).htmlLang,
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: home.faq.items.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: item.answer,
				},
			})),
		},
	];
}

export function buildToolSchema(tool: ToolDefinition, url: string) {
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: tool.name,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web Browser',
			description: tool.metaDescription,
			url,
			inLanguage: getLocaleMeta(tool.locale).htmlLang,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: tool.faqs.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer },
			})),
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: tool.locale === 'zh-cn' ? '首页' : 'Home', item: getLocalePath(tool.locale) },
				{ '@type': 'ListItem', position: 2, name: tool.name, item: url },
			],
		},
	];
}

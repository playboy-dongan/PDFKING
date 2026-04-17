function pdfkingI18nRuntime() {
	const STORAGE_KEY = 'pdfking.language';
	const CARD_ID = 'pdfking-language-settings';
	const sourceText = new WeakMap();
	const sourcePlaceholder = new WeakMap();
	let applying = false;
	let scheduled = false;
	let translatedOnce = false;
	let pendingFullApply = false;
	const pendingRoots = new Set();

	const languages = [
		{ code: 'en', label: 'English', dir: 'ltr' },
		{ code: 'zh-CN', label: '简体中文', dir: 'ltr' },
		{ code: 'zh-TW', label: '繁體中文', dir: 'ltr' },
		{ code: 'es', label: 'Español', dir: 'ltr' },
		{ code: 'fr', label: 'Français', dir: 'ltr' },
		{ code: 'de', label: 'Deutsch', dir: 'ltr' },
		{ code: 'ja', label: '日本語', dir: 'ltr' },
		{ code: 'ko', label: '한국어', dir: 'ltr' },
		{ code: 'pt-BR', label: 'Português', dir: 'ltr' },
		{ code: 'ru', label: 'Русский', dir: 'ltr' },
		{ code: 'ar', label: 'العربية', dir: 'rtl' },
		{ code: 'hi', label: 'हिन्दी', dir: 'ltr' },
	];

	const settingsCopy = {
		en: {
			title: 'Language',
			eyebrow: 'Interface preference',
			description: 'Choose the language used for navigation, settings, and common tool actions. Your choice is saved in this browser.',
			label: 'Display language',
			note: 'The original PDFKING layout is preserved. This setting only adds a local translation layer.',
			applied: 'Language preference saved.',
		},
		'zh-CN': {
			title: '语言',
			eyebrow: '界面偏好',
			description: '选择导航、设置和常用工具操作所使用的语言。你的选择会保存在此浏览器中。',
			label: '显示语言',
			note: 'PDFKING 原始布局保持不变。此设置只添加本地翻译层。',
			applied: '语言偏好已保存。',
		},
		'zh-TW': {
			title: '語言',
			eyebrow: '介面偏好',
			description: '選擇導覽、設定與常用工具操作使用的語言。你的選擇會儲存在此瀏覽器中。',
			label: '顯示語言',
			note: 'PDFKING 原始版面保持不變。此設定只加入本機翻譯層。',
			applied: '語言偏好已儲存。',
		},
		es: {
			title: 'Idioma',
			eyebrow: 'Preferencia de interfaz',
			description: 'Elige el idioma para la navegación, la configuración y las acciones comunes de las herramientas. La elección se guarda en este navegador.',
			label: 'Idioma de visualización',
			note: 'El diseño original de PDFKING se conserva. Esta opción solo añade una capa local de traducción.',
			applied: 'Preferencia de idioma guardada.',
		},
		fr: {
			title: 'Langue',
			eyebrow: 'Préférence d’interface',
			description: 'Choisissez la langue utilisée pour la navigation, les paramètres et les actions courantes des outils. Le choix est enregistré dans ce navigateur.',
			label: 'Langue d’affichage',
			note: 'La mise en page PDFKING d’origine est conservée. Ce réglage ajoute seulement une couche de traduction locale.',
			applied: 'Préférence de langue enregistrée.',
		},
		de: {
			title: 'Sprache',
			eyebrow: 'Oberflächeneinstellung',
			description: 'Wähle die Sprache für Navigation, Einstellungen und häufige Werkzeugaktionen. Die Auswahl wird in diesem Browser gespeichert.',
			label: 'Anzeigesprache',
			note: 'Das ursprüngliche PDFKING-Layout bleibt erhalten. Diese Einstellung ergänzt nur eine lokale Übersetzungsebene.',
			applied: 'Spracheinstellung gespeichert.',
		},
		ja: {
			title: '言語',
			eyebrow: '表示設定',
			description: 'ナビゲーション、設定、よく使うツール操作に使用する言語を選択します。選択内容はこのブラウザに保存されます。',
			label: '表示言語',
			note: 'PDFKING の元のレイアウトは維持されます。この設定はローカル翻訳レイヤーのみを追加します。',
			applied: '言語設定を保存しました。',
		},
		ko: {
			title: '언어',
			eyebrow: '인터페이스 설정',
			description: '탐색, 설정, 일반 도구 작업에 사용할 언어를 선택합니다. 선택 내용은 이 브라우저에 저장됩니다.',
			label: '표시 언어',
			note: '원래 PDFKING 레이아웃은 유지됩니다. 이 설정은 로컬 번역 레이어만 추가합니다.',
			applied: '언어 설정이 저장되었습니다.',
		},
		'pt-BR': {
			title: 'Idioma',
			eyebrow: 'Preferência da interface',
			description: 'Escolha o idioma usado na navegação, nas configurações e nas ações comuns das ferramentas. A escolha fica salva neste navegador.',
			label: 'Idioma de exibição',
			note: 'O layout original do PDFKING é preservado. Esta opção adiciona apenas uma camada local de tradução.',
			applied: 'Preferência de idioma salva.',
		},
		ru: {
			title: 'Язык',
			eyebrow: 'Настройка интерфейса',
			description: 'Выберите язык для навигации, настроек и основных действий инструментов. Выбор сохраняется в этом браузере.',
			label: 'Язык интерфейса',
			note: 'Исходная компоновка PDFKING сохраняется. Эта настройка добавляет только локальный слой перевода.',
			applied: 'Языковая настройка сохранена.',
		},
		ar: {
			title: 'اللغة',
			eyebrow: 'تفضيل الواجهة',
			description: 'اختر اللغة المستخدمة للتنقل والإعدادات وإجراءات الأدوات الشائعة. سيتم حفظ اختيارك في هذا المتصفح.',
			label: 'لغة العرض',
			note: 'يتم الحفاظ على تخطيط PDFKING الأصلي. يضيف هذا الخيار طبقة ترجمة محلية فقط.',
			applied: 'تم حفظ تفضيل اللغة.',
		},
		hi: {
			title: 'भाषा',
			eyebrow: 'इंटरफेस प्राथमिकता',
			description: 'नेविगेशन, सेटिंग्स और सामान्य टूल क्रियाओं के लिए भाषा चुनें। आपका चयन इसी ब्राउज़र में सहेजा जाएगा।',
			label: 'प्रदर्शन भाषा',
			note: 'मूल PDFKING लेआउट सुरक्षित रहता है। यह सेटिंग केवल स्थानीय अनुवाद परत जोड़ती है।',
			applied: 'भाषा प्राथमिकता सहेजी गई।',
		},
	};

	const dictionaries = {
		'zh-CN': {
			'Tools': '工具',
			'Home': '首页',
			'Image Tools': '图片工具',
			'PDF Tools': 'PDF 工具',
			'Text Tools': '文本工具',
			'Misc Tools': '其他工具',
			'More': '更多',
			'Help': '帮助',
			'Settings': '设置',
			'Toggle Sidebar': '切换侧栏',
			'Dashboard': '仪表盘',
			'All Tools': '全部工具',
			'Search all tools...': '搜索全部工具...',
			'All': '全部',
			'Organize': '整理',
			'Optimize': '优化',
			'Convert': '转换',
			'Edit': '编辑',
			'Security': '安全',
			'New!': '新功能！',
			'Coming Soon': '即将推出',
			'Merge PDF': '合并 PDF',
			'Merge PDF Files': '合并 PDF 文件',
			'Combine multiple PDFs into a single document instantly.': '立即将多个 PDF 合并为一个文档。',
			'100% free, secure, and purely local processing.': '100% 免费、安全，并且完全在本地处理。',
			'Drop your PDFs here': '将 PDF 拖到这里',
			'Drag and drop your files here, or click to select.': '将文件拖放到这里，或点击选择。',
			'Privately processed on your device.': '在你的设备上私密处理。',
			'Select PDF files': '选择 PDF 文件',
			'Secure & Private': '安全且私密',
			'All processing happens locally in your browser. No data is ever transmitted to external servers.': '所有处理都在你的浏览器本地完成。不会向外部服务器传输任何数据。',
			'Lightning Fast': '极速处理',
			'Files': '文件',
			'Pages': '页数',
			'Add Files': '添加文件',
			'Clear All': '全部清除',
			'Processing files...': '正在处理文件...',
			'Leave blank for all': '留空表示全部',
			'Drag to reorder • Specify page ranges': '拖动排序 • 指定页码范围',
			'🔒 Your files never leave your device': '🔒 你的文件不会离开设备',
			'Download': '下载',
			'Back': '返回',
			'Go Back': '返回',
			'Try Again': '重试',
			'Go to Homepage': '前往首页',
			'Contact Support': '联系支持',
			'Help & Support': '帮助与支持',
		},
		'zh-TW': {
			'Tools': '工具',
			'Home': '首頁',
			'Image Tools': '圖片工具',
			'PDF Tools': 'PDF 工具',
			'Text Tools': '文字工具',
			'Misc Tools': '其他工具',
			'More': '更多',
			'Help': '說明',
			'Settings': '設定',
			'Toggle Sidebar': '切換側欄',
			'Dashboard': '儀表板',
			'All Tools': '全部工具',
			'Search all tools...': '搜尋全部工具...',
			'All': '全部',
			'Organize': '整理',
			'Optimize': '最佳化',
			'Convert': '轉換',
			'Edit': '編輯',
			'Security': '安全',
			'New!': '新功能！',
			'Coming Soon': '即將推出',
			'Merge PDF': '合併 PDF',
			'Merge PDF Files': '合併 PDF 檔案',
			'Combine multiple PDFs into a single document instantly.': '立即將多個 PDF 合併成一份文件。',
			'Drop your PDFs here': '將 PDF 拖到這裡',
			'Select PDF files': '選擇 PDF 檔案',
			'Secure & Private': '安全且私密',
			'Files': '檔案',
			'Pages': '頁數',
			'Add Files': '新增檔案',
			'Clear All': '全部清除',
			'Processing files...': '正在處理檔案...',
			'Leave blank for all': '留空表示全部',
			'Download': '下載',
			'Back': '返回',
		},
		es: {
			'Tools': 'Herramientas',
			'Home': 'Inicio',
			'Image Tools': 'Herramientas de imagen',
			'PDF Tools': 'Herramientas PDF',
			'Text Tools': 'Herramientas de texto',
			'Misc Tools': 'Otras herramientas',
			'More': 'Más',
			'Help': 'Ayuda',
			'Settings': 'Configuración',
			'Dashboard': 'Panel',
			'All Tools': 'Todas las herramientas',
			'Search all tools...': 'Buscar herramientas...',
			'All': 'Todo',
			'Organize': 'Organizar',
			'Optimize': 'Optimizar',
			'Convert': 'Convertir',
			'Edit': 'Editar',
			'Security': 'Seguridad',
			'Coming Soon': 'Próximamente',
			'Merge PDF': 'Unir PDF',
			'Merge PDF Files': 'Unir archivos PDF',
			'Drop your PDFs here': 'Suelta tus PDF aquí',
			'Select PDF files': 'Seleccionar archivos PDF',
			'Secure & Private': 'Seguro y privado',
			'Files': 'Archivos',
			'Pages': 'Páginas',
			'Add Files': 'Añadir archivos',
			'Clear All': 'Borrar todo',
			'Processing files...': 'Procesando archivos...',
			'Leave blank for all': 'Dejar en blanco para todo',
			'Download': 'Descargar',
			'Back': 'Volver',
		},
		fr: {
			'Tools': 'Outils',
			'Home': 'Accueil',
			'Image Tools': 'Outils image',
			'PDF Tools': 'Outils PDF',
			'Text Tools': 'Outils texte',
			'Misc Tools': 'Autres outils',
			'More': 'Plus',
			'Help': 'Aide',
			'Settings': 'Paramètres',
			'Dashboard': 'Tableau de bord',
			'All Tools': 'Tous les outils',
			'Search all tools...': 'Rechercher des outils...',
			'All': 'Tous',
			'Organize': 'Organiser',
			'Optimize': 'Optimiser',
			'Convert': 'Convertir',
			'Edit': 'Modifier',
			'Security': 'Sécurité',
			'Coming Soon': 'Bientôt disponible',
			'Merge PDF': 'Fusionner PDF',
			'Merge PDF Files': 'Fusionner des fichiers PDF',
			'Drop your PDFs here': 'Déposez vos PDF ici',
			'Select PDF files': 'Sélectionner des fichiers PDF',
			'Secure & Private': 'Sécurisé et privé',
			'Files': 'Fichiers',
			'Pages': 'Pages',
			'Add Files': 'Ajouter des fichiers',
			'Clear All': 'Tout effacer',
			'Processing files...': 'Traitement des fichiers...',
			'Leave blank for all': 'Laisser vide pour tout',
			'Download': 'Télécharger',
			'Back': 'Retour',
		},
		de: {
			'Tools': 'Werkzeuge',
			'Home': 'Startseite',
			'Image Tools': 'Bildwerkzeuge',
			'PDF Tools': 'PDF-Werkzeuge',
			'Text Tools': 'Textwerkzeuge',
			'Misc Tools': 'Weitere Werkzeuge',
			'More': 'Mehr',
			'Help': 'Hilfe',
			'Settings': 'Einstellungen',
			'Dashboard': 'Dashboard',
			'All Tools': 'Alle Werkzeuge',
			'Search all tools...': 'Alle Werkzeuge suchen...',
			'All': 'Alle',
			'Organize': 'Organisieren',
			'Optimize': 'Optimieren',
			'Convert': 'Konvertieren',
			'Edit': 'Bearbeiten',
			'Security': 'Sicherheit',
			'Coming Soon': 'Demnächst',
			'Merge PDF': 'PDF zusammenführen',
			'Merge PDF Files': 'PDF-Dateien zusammenführen',
			'Drop your PDFs here': 'PDFs hier ablegen',
			'Select PDF files': 'PDF-Dateien auswählen',
			'Secure & Private': 'Sicher und privat',
			'Files': 'Dateien',
			'Pages': 'Seiten',
			'Add Files': 'Dateien hinzufügen',
			'Clear All': 'Alles löschen',
			'Processing files...': 'Dateien werden verarbeitet...',
			'Leave blank for all': 'Für alle leer lassen',
			'Download': 'Herunterladen',
			'Back': 'Zurück',
		},
		ja: {
			'Tools': 'ツール',
			'Home': 'ホーム',
			'Image Tools': '画像ツール',
			'PDF Tools': 'PDF ツール',
			'Text Tools': 'テキストツール',
			'Misc Tools': 'その他のツール',
			'More': 'その他',
			'Help': 'ヘルプ',
			'Settings': '設定',
			'Dashboard': 'ダッシュボード',
			'All Tools': 'すべてのツール',
			'Search all tools...': 'ツールを検索...',
			'All': 'すべて',
			'Organize': '整理',
			'Optimize': '最適化',
			'Convert': '変換',
			'Edit': '編集',
			'Security': 'セキュリティ',
			'Coming Soon': '近日公開',
			'Merge PDF': 'PDF を結合',
			'Merge PDF Files': 'PDF ファイルを結合',
			'Drop your PDFs here': 'PDF をここにドロップ',
			'Select PDF files': 'PDF ファイルを選択',
			'Secure & Private': '安全でプライベート',
			'Files': 'ファイル',
			'Pages': 'ページ',
			'Add Files': 'ファイルを追加',
			'Clear All': 'すべてクリア',
			'Processing files...': 'ファイルを処理中...',
			'Leave blank for all': 'すべての場合は空欄',
			'Download': 'ダウンロード',
			'Back': '戻る',
		},
		ko: {
			'Tools': '도구',
			'Home': '홈',
			'Image Tools': '이미지 도구',
			'PDF Tools': 'PDF 도구',
			'Text Tools': '텍스트 도구',
			'Misc Tools': '기타 도구',
			'More': '더보기',
			'Help': '도움말',
			'Settings': '설정',
			'Dashboard': '대시보드',
			'All Tools': '모든 도구',
			'Search all tools...': '모든 도구 검색...',
			'All': '전체',
			'Organize': '정리',
			'Optimize': '최적화',
			'Convert': '변환',
			'Edit': '편집',
			'Security': '보안',
			'Coming Soon': '곧 출시',
			'Merge PDF': 'PDF 병합',
			'Merge PDF Files': 'PDF 파일 병합',
			'Drop your PDFs here': 'PDF를 여기에 놓기',
			'Select PDF files': 'PDF 파일 선택',
			'Secure & Private': '안전 및 비공개',
			'Files': '파일',
			'Pages': '페이지',
			'Add Files': '파일 추가',
			'Clear All': '모두 지우기',
			'Processing files...': '파일 처리 중...',
			'Leave blank for all': '전체는 비워 두기',
			'Download': '다운로드',
			'Back': '뒤로',
		},
		'pt-BR': {
			'Tools': 'Ferramentas',
			'Home': 'Início',
			'Image Tools': 'Ferramentas de imagem',
			'PDF Tools': 'Ferramentas PDF',
			'Text Tools': 'Ferramentas de texto',
			'Misc Tools': 'Outras ferramentas',
			'More': 'Mais',
			'Help': 'Ajuda',
			'Settings': 'Configurações',
			'Dashboard': 'Painel',
			'All Tools': 'Todas as ferramentas',
			'Search all tools...': 'Pesquisar ferramentas...',
			'Merge PDF': 'Mesclar PDF',
			'Merge PDF Files': 'Mesclar arquivos PDF',
			'Drop your PDFs here': 'Solte seus PDFs aqui',
			'Select PDF files': 'Selecionar PDFs',
			'Files': 'Arquivos',
			'Pages': 'Páginas',
			'Add Files': 'Adicionar arquivos',
			'Clear All': 'Limpar tudo',
			'Processing files...': 'Processando arquivos...',
			'Download': 'Baixar',
			'Back': 'Voltar',
		},
		ru: {
			'Tools': 'Инструменты',
			'Home': 'Главная',
			'Image Tools': 'Инструменты изображений',
			'PDF Tools': 'PDF-инструменты',
			'Text Tools': 'Текстовые инструменты',
			'Misc Tools': 'Другие инструменты',
			'More': 'Еще',
			'Help': 'Помощь',
			'Settings': 'Настройки',
			'Dashboard': 'Панель',
			'All Tools': 'Все инструменты',
			'Search all tools...': 'Поиск инструментов...',
			'Merge PDF': 'Объединить PDF',
			'Merge PDF Files': 'Объединить PDF-файлы',
			'Drop your PDFs here': 'Перетащите PDF сюда',
			'Select PDF files': 'Выбрать PDF-файлы',
			'Files': 'Файлы',
			'Pages': 'Страницы',
			'Add Files': 'Добавить файлы',
			'Clear All': 'Очистить все',
			'Processing files...': 'Обработка файлов...',
			'Download': 'Скачать',
			'Back': 'Назад',
		},
		ar: {
			'Tools': 'الأدوات',
			'Home': 'الرئيسية',
			'Image Tools': 'أدوات الصور',
			'PDF Tools': 'أدوات PDF',
			'Text Tools': 'أدوات النص',
			'Misc Tools': 'أدوات أخرى',
			'More': 'المزيد',
			'Help': 'المساعدة',
			'Settings': 'الإعدادات',
			'Dashboard': 'لوحة التحكم',
			'All Tools': 'كل الأدوات',
			'Search all tools...': 'ابحث في الأدوات...',
			'Merge PDF': 'دمج PDF',
			'Merge PDF Files': 'دمج ملفات PDF',
			'Drop your PDFs here': 'أفلت ملفات PDF هنا',
			'Select PDF files': 'اختر ملفات PDF',
			'Files': 'الملفات',
			'Pages': 'الصفحات',
			'Add Files': 'إضافة ملفات',
			'Clear All': 'مسح الكل',
			'Processing files...': 'جارٍ معالجة الملفات...',
			'Download': 'تنزيل',
			'Back': 'رجوع',
		},
		hi: {
			'Tools': 'टूल्स',
			'Home': 'होम',
			'Image Tools': 'इमेज टूल्स',
			'PDF Tools': 'PDF टूल्स',
			'Text Tools': 'टेक्स्ट टूल्स',
			'Misc Tools': 'अन्य टूल्स',
			'More': 'अधिक',
			'Help': 'सहायता',
			'Settings': 'सेटिंग्स',
			'Dashboard': 'डैशबोर्ड',
			'All Tools': 'सभी टूल्स',
			'Search all tools...': 'सभी टूल्स खोजें...',
			'Merge PDF': 'PDF मर्ज करें',
			'Merge PDF Files': 'PDF फ़ाइलें मर्ज करें',
			'Drop your PDFs here': 'अपनी PDF यहाँ छोड़ें',
			'Select PDF files': 'PDF फ़ाइलें चुनें',
			'Files': 'फ़ाइलें',
			'Pages': 'पृष्ठ',
			'Add Files': 'फ़ाइलें जोड़ें',
			'Clear All': 'सब साफ़ करें',
			'Processing files...': 'फ़ाइलें प्रोसेस हो रही हैं...',
			'Download': 'डाउनलोड',
			'Back': 'वापस',
		},
	};

	function currentLanguage() {
		const saved = localStorage.getItem(STORAGE_KEY);
		return languages.some((item) => item.code === saved) ? saved : 'en';
	}

	function copy() {
		return settingsCopy[currentLanguage()] || settingsCopy.en;
	}

	function isSettingsRoute() {
		return location.pathname.replace(/\/$/, '') === '/settings';
	}

	function settingsMain() {
		const mains = [...document.querySelectorAll('main')];
		return mains.find((node) => String(node.className).includes('h-[calc(100vh-4rem)]')) || mains.at(-1);
	}

	function renderSettingsCard() {
		if (!isSettingsRoute()) {
			document.getElementById(CARD_ID)?.remove();
			return;
		}
		const main = settingsMain();
		if (!main) return;
		const existing = document.getElementById(CARD_ID);
		const selected = currentLanguage();
		if (existing?.dataset.lang === selected) return;
		if (existing) existing.remove();
		const text = copy();
		const options = languages
			.map((item) => `<option value="${item.code}" ${item.code === selected ? 'selected' : ''}>${item.label}</option>`)
			.join('');
		main.insertAdjacentHTML(
			'afterbegin',
			`<section id="${CARD_ID}" data-lang="${selected}" class="container mx-auto flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
				<div class="mx-auto max-w-3xl space-y-6">
					<div class="space-y-2">
						<p class="text-sm font-medium text-primary">${text.eyebrow}</p>
						<h1 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">${text.title}</h1>
						<p class="text-base leading-7 text-muted-foreground">${text.description}</p>
					</div>
					<div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
						<label class="mb-2 block text-sm font-medium text-foreground" for="pdfking-language-select">${text.label}</label>
						<select id="pdfking-language-select" class="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
							${options}
						</select>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">${text.note}</p>
						<p id="pdfking-language-status" class="mt-4 hidden rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">${text.applied}</p>
					</div>
				</div>
			</section>`,
		);
		document.getElementById('pdfking-language-select')?.addEventListener('change', (event) => {
			localStorage.setItem(STORAGE_KEY, event.target.value);
			renderSettingsCard();
			applyLanguage({ force: true });
			const status = document.getElementById('pdfking-language-status');
			if (status) {
				status.classList.remove('hidden');
				window.setTimeout(() => status.classList.add('hidden'), 1800);
			}
		});
	}

	function translatedText(value, lang) {
		if (lang === 'en') return value;
		return dictionaries[lang]?.[value] || value;
	}

	function translateTextNode(node, lang) {
		const stored = sourceText.get(node) || node.nodeValue || '';
		if (!sourceText.has(node)) sourceText.set(node, stored);
		const key = stored.trim();
		if (!key) return;
		const translated = translatedText(key, lang);
		node.nodeValue = stored.replace(key, translated);
	}

	function translatePlaceholders(lang, root = document) {
		const elements = [];
		if (root instanceof Element && root.matches('input[placeholder], textarea[placeholder]')) elements.push(root);
		root.querySelectorAll?.('input[placeholder], textarea[placeholder]').forEach((element) => elements.push(element));
		elements.forEach((element) => {
			const source = sourcePlaceholder.get(element) || element.getAttribute('placeholder') || '';
			if (!sourcePlaceholder.has(element)) sourcePlaceholder.set(element, source);
			const key = source.trim();
			if (key) element.setAttribute('placeholder', translatedText(key, lang));
		});
	}

	function translateNodeTree(root, lang) {
		if (!root) return;
		if (root.nodeType === Node.TEXT_NODE) {
			translateTextNode(root, lang);
			return;
		}
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (parent.closest('script,style,noscript,svg,canvas,code,pre')) return NodeFilter.FILTER_REJECT;
				return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			},
		});
		while (walker.nextNode()) translateTextNode(walker.currentNode, lang);
	}

	function setDocumentLanguage(lang) {
		const meta = languages.find((item) => item.code === lang) || languages[0];
		document.documentElement.lang = lang;
		document.documentElement.dir = meta.dir;
		if (document.body) document.body.dir = meta.dir;
	}

	function applyLanguage({ root = document.body, force = false } = {}) {
		if (applying) return;
		const lang = currentLanguage();
		setDocumentLanguage(lang);
		if (!document.body) return;
		if (lang === 'en' && !translatedOnce && !force) return;
		applying = true;
		try {
			translateNodeTree(document.body, lang);
			translatePlaceholders(lang, root);
			if (lang !== 'en') translatedOnce = true;
		} finally {
			applying = false;
		}
	}

	function schedule({ full = false, roots = [] } = {}) {
		if (applying || scheduled) return;
		if (full) pendingFullApply = true;
		roots.forEach((root) => pendingRoots.add(root));
		scheduled = true;
		window.requestAnimationFrame(() => {
			scheduled = false;
			const fullApply = pendingFullApply;
			const rootsToApply = [...pendingRoots];
			pendingFullApply = false;
			pendingRoots.clear();
			renderSettingsCard();
			if (fullApply || !rootsToApply.length) {
				applyLanguage({ force: fullApply });
				return;
			}
			for (const root of rootsToApply) applyLanguage({ root });
		});
	}

	function patchNavigation() {
		for (const method of ['pushState', 'replaceState']) {
			const original = history[method];
			if (original.__pdfkingLanguagePatched) continue;
			history[method] = function (...args) {
				const result = original.apply(this, args);
				window.setTimeout(() => schedule({ full: currentLanguage() !== 'en' || translatedOnce }), 80);
				return result;
			};
			history[method].__pdfkingLanguagePatched = true;
		}
		window.addEventListener('popstate', () => window.setTimeout(() => schedule({ full: currentLanguage() !== 'en' || translatedOnce }), 80));
	}

	function init() {
		patchNavigation();
		renderSettingsCard();
		applyLanguage();
		new MutationObserver((mutations) => {
			if (applying) return;
			const roots = [];
			for (const mutation of mutations) {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) roots.push(node);
				});
			}
			if (isSettingsRoute() && !document.getElementById(CARD_ID)) schedule();
			if (currentLanguage() === 'en' && !translatedOnce) return;
			if (roots.length) schedule({ roots });
		}).observe(document.body || document.documentElement, { childList: true, subtree: true });
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
	else init();
}

(pdfkingI18nRuntime)();

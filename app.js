document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let rawDescription = '';
    let rawSeo = '';
    let currentLang = 'en';

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const html = document.documentElement;
    const body = document.body;

    const langToggleBtn = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');

    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');

    const form = document.getElementById('generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const loadingSpinner = document.getElementById('loading-spinner');

    const errorMsgContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    const descPlaceholder = document.getElementById('desc-placeholder');
    const descriptionOutput = document.getElementById('description-output');
    const copyDescBtn = document.getElementById('copy-desc-btn');
    const copyDescText = document.getElementById('copy-desc-text');

    // Tabs
    const tabRaw = document.getElementById('tab-raw');
    const tabPreview = document.getElementById('tab-preview');
    const contentRaw = document.getElementById('content-raw');
    const contentPreview = document.getElementById('content-preview');

    // Preview
    const previewProductName = document.getElementById('preview-product-name');
    const shopifyPreviewOutput = document.getElementById('shopify-preview-output');

    const seoPlaceholder = document.getElementById('seo-placeholder');
    const seoOutput = document.getElementById('seo-output');
    const seoPreviewTitle = document.getElementById('seo-preview-title');
    const seoPreviewDesc = document.getElementById('seo-preview-desc');
    const seoCharCount = document.getElementById('seo-char-count');
    const copySeoBtn = document.getElementById('copy-seo-btn');
    const copySeoText = document.getElementById('copy-seo-text');

    // --- Theme Management ---
    // Check local storage or system preference on load
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        html.classList.remove('dark');
        themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
    }

    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        if (html.classList.contains('dark')) {
            localStorage.setItem('color-theme', 'dark');
            themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('color-theme', 'light');
            themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    // --- Translation Dictionary ---
    const translations = {
        en: {
            'lang-text': 'العربية',
            'hero-title': 'Generate High-Converting Product Descriptions',
            'hero-subtitle': 'Boost your sales with AI-powered, SEO-optimized descriptions tailored to your audience and brand voice.',
            'api-setup-title': 'Setup Google Gemini API Key',
            'api-setup-desc': 'Your key is stored locally in your browser and is not sent anywhere else. Get a free key <a href="https://aistudio.google.com/app/apikey" target="_blank" class="underline">here</a>.',
            'save-api-key': 'Save Key',
            'saved-key': 'Saved!',
            'form-title': 'Product Details',
            'label-product-name': 'Product Name <span class="text-red-500">*</span>',
            'label-features': 'Key Features / Keywords <span class="text-red-500">*</span>',
            'label-tone': 'Tone of Voice',
            'label-audience': 'Target Audience',
            'label-length': 'Length & Format',
            'label-language': 'Output Language',
            'btn-text': 'Generate Description',
            'generating-text': 'Generating...',
            'share-title': '🔥 Love this tool? Share it with your network!',
            'tab-raw-text': 'Raw Text',
            'tab-preview-text': 'Shopify Preview',
            'output-title': 'Product Description',
            'copy-desc-text': 'Copy',
            'copied-text': 'Copied!',
            'desc-placeholder-text': 'Fill out the form and click generate to create a high-converting description.',
            'seo-title': 'SEO Meta Description',
            'copy-seo-text': 'Copy',
            'seo-placeholder-text': 'SEO optimized meta description will appear here.',
            'chars-text': 'chars',
            'faq-title': 'Frequently Asked Questions',
            'faq-1-q': 'Why are product descriptions important?',
            'faq-1-a': 'Good descriptions highlight the value of your product, answer customer questions, and build trust, directly leading to higher conversion rates.',
            'faq-2-q': 'Does this help with SEO?',
            'faq-2-a': 'Yes! This tool automatically structures content and generates a dedicated SEO Meta Description to help your product rank higher on Google.'
        },
        ar: {
            'lang-text': 'English',
            'hero-title': 'إنشاء وصف منتجات عالي التحويل',
            'hero-subtitle': 'عزز مبيعاتك بوصف منتجات مدعوم بالذكاء الاصطناعي، ومحسن لمحركات البحث، ومصمم خصيصًا لجمهورك وهوية علامتك التجارية.',
            'api-setup-title': 'إعداد مفتاح واجهة برمجة تطبيقات Google Gemini',
            'api-setup-desc': 'يتم تخزين المفتاح محليًا في متصفحك ولا يتم إرساله لأي مكان آخر. احصل على مفتاح مجاني <a href="https://aistudio.google.com/app/apikey" target="_blank" class="underline">من هنا</a>.',
            'save-api-key': 'حفظ المفتاح',
            'saved-key': 'تم الحفظ!',
            'form-title': 'تفاصيل المنتج',
            'label-product-name': 'اسم المنتج <span class="text-red-500">*</span>',
            'label-features': 'الميزات الرئيسية / الكلمات المفتاحية <span class="text-red-500">*</span>',
            'label-tone': 'نبرة الصوت',
            'label-audience': 'الجمهور المستهدف',
            'label-length': 'الطول والتنسيق',
            'label-language': 'لغة الإخراج',
            'btn-text': 'إنشاء الوصف',
            'generating-text': 'جاري الإنشاء...',
            'share-title': '🔥 هل أعجبتك هذه الأداة؟ شاركها مع شبكتك!',
            'tab-raw-text': 'النص الخام',
            'tab-preview-text': 'معاينة شوبيفاي',
            'output-title': 'وصف المنتج',
            'copy-desc-text': 'نسخ',
            'copied-text': 'تم النسخ!',
            'desc-placeholder-text': 'املأ النموذج واضغط على إنشاء للحصول على وصف عالي التحويل.',
            'seo-title': 'وصف الميتا (SEO)',
            'copy-seo-text': 'نسخ',
            'seo-placeholder-text': 'سيظهر هنا وصف الميتا المحسن لمحركات البحث.',
            'chars-text': 'حرف',
            'faq-title': 'الأسئلة الشائعة',
            'faq-1-q': 'لماذا تعتبر أوصاف المنتجات مهمة؟',
            'faq-1-a': 'الأوصاف الجيدة تبرز قيمة منتجك، وتجيب على أسئلة العملاء، وتبني الثقة، مما يؤدي مباشرة إلى معدلات تحويل أعلى.',
            'faq-2-q': 'هل يساعد هذا في تحسين محركات البحث (SEO)؟',
            'faq-2-a': 'نعم! تقوم هذه الأداة تلقائيًا بهيكلة المحتوى وإنشاء وصف ميتا مخصص لمساعدة منتجك على تصدر نتائج بحث جوجل.'
        }
    };

    function setLanguage(lang) {
        currentLang = lang;
        const dict = translations[lang];

        // Update DOM elements
        for (const [id, text] of Object.entries(dict)) {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'api-setup-desc' || id === 'label-product-name' || id === 'label-features') {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        }

        // Update direction & fonts
        if (lang === 'ar') {
            html.setAttribute('dir', 'rtl');
            body.classList.remove('font-inter');
            body.classList.add('font-tajawal');

            // Adjust input placeholders
            document.getElementById('product-name').placeholder = 'مثال: سماعات لاسلكية عازلة للضوضاء';
            document.getElementById('key-features').placeholder = 'مثال: بطارية 30 ساعة، عزل ضوضاء نشط، بلوتوث 5.0';
            document.getElementById('target-audience').placeholder = 'مثال: عشاق التكنولوجيا';
        } else {
            html.setAttribute('dir', 'ltr');
            body.classList.remove('font-tajawal');
            body.classList.add('font-inter');

            // Adjust input placeholders
            document.getElementById('product-name').placeholder = 'e.g. Wireless Noise-Cancelling Headphones';
            document.getElementById('key-features').placeholder = 'e.g. 30-hour battery life, active noise cancellation, Bluetooth 5.0';
            document.getElementById('target-audience').placeholder = 'e.g. Tech Enthusiasts';
        }
    }

    langToggleBtn.addEventListener('click', () => {
        setLanguage(currentLang === 'en' ? 'ar' : 'en');
    });

    // --- API Key Management ---
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
        saveApiKeyBtn.textContent = 'Saved!';
        saveApiKeyBtn.classList.replace('bg-yellow-500', 'bg-green-500');
        saveApiKeyBtn.classList.replace('hover:bg-yellow-600', 'hover:bg-green-600');
    }

    saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            saveApiKeyBtn.textContent = 'Saved!';
            saveApiKeyBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            saveApiKeyBtn.classList.add('bg-green-500', 'hover:bg-green-600');

            setTimeout(() => {
                saveApiKeyBtn.textContent = 'Save Key';
                saveApiKeyBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                saveApiKeyBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
            }, 2000);
        } else {
            localStorage.removeItem('gemini_api_key');
            showError("API Key removed.");
        }
    });

    // --- Main Generator Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide previous errors
        errorMsgContainer.classList.add('hidden');

        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showError("Please enter your Google Gemini API Key above.");
            apiKeyInput.focus();
            return;
        }

        // Get Form Values
        const productName = document.getElementById('product-name').value.trim();
        const keyFeatures = document.getElementById('key-features').value.trim();
        const targetAudience = document.getElementById('target-audience').value;
        const toneVoice = document.getElementById('tone-voice').value;
        const wordCount = document.getElementById('word-count').value;
        const language = document.getElementById('language-output').value;

        // Determine specific structural instructions based on Length requirement
        let lengthInstruction = "Include an engaging hook, a paragraph highlighting the main benefits, and bullet points for key features. Keep it structured and easy to read.";
        if (wordCount === 'Short & Punchy') {
            lengthInstruction = "Make it very short, punchy, and straight to the point. 1-2 short paragraphs max.";
        } else if (wordCount === 'Bullet Points Only') {
            lengthInstruction = "Do not write paragraphs. Output the description ONLY as a list of compelling bullet points.";
        } else if (wordCount === 'Detailed') {
            lengthInstruction = "Write a comprehensive and detailed description. Include a hook, story-driven benefits, technical specifications in bullet points, and a strong call to action.";
        }

        // Construct Prompt
        const prompt = `You are an expert E-commerce Copywriter and SEO specialist.
        Please generate two things based on the following product details:

        Product Name: ${productName}
        Key Features/Keywords: ${keyFeatures}
        Target Audience: ${targetAudience}
        Tone of Voice: ${toneVoice}
        Length & Format: ${wordCount}
        Output Language: ${language}

        REQUIRED FORMAT:
        Please provide the output EXACTLY in this format with these exact headings:

        [DESCRIPTION]
        (Write a compelling, high-converting product description using markdown. ${lengthInstruction})

        [SEO]
        (Write ONLY the SEO meta description here. It must be compelling, include the main keywords, and be under 160 characters.)
        `;

        // Set Loading State
        setLoadingState(true);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
                const generatedText = data.candidates[0].content.parts[0].text;
                parseAndDisplayResult(generatedText, productName);
            } else {
                throw new Error("Received empty response from the API.");
            }

        } catch (error) {
            console.error("Generation Error:", error);
            showError(error.message);
        } finally {
            setLoadingState(false);
        }
    });

    function parseAndDisplayResult(text, productName) {
        // Simple parser looking for the specific headings requested in the prompt
        let descMatch = text.match(/\[DESCRIPTION\]([\s\S]*?)(?=\[SEO\]|$)/i);
        let seoMatch = text.match(/\[SEO\]([\s\S]*)$/i);

        // Fallback parsing if the model didn't perfectly follow the [TAG] format
        if (!descMatch && !seoMatch) {
             rawDescription = text;
             rawSeo = `Buy the best ${productName} online today. Check out its amazing features and get yours now!`; // Fallback
        } else {
             rawDescription = descMatch ? descMatch[1].trim() : "Description could not be parsed.";
             rawSeo = seoMatch ? seoMatch[1].trim() : "SEO description could not be parsed.";
        }

        // Clean up markdown markers if the model put them around the tags
        rawDescription = rawDescription.replace(/^```markdown\n/, '').replace(/\n```$/, '').trim();
        rawSeo = rawSeo.replace(/^```\n/, '').replace(/\n```$/, '').replace(/^"|"$/g, '').trim();

        // Update UI: Description
        descPlaceholder.classList.add('hidden');
        descriptionOutput.classList.remove('hidden');
        descriptionOutput.classList.add('animate-fade-in');

        const htmlOutput = marked.parse(rawDescription);
        descriptionOutput.innerHTML = htmlOutput;

        // Update Shopify Preview
        previewProductName.textContent = productName;
        shopifyPreviewOutput.innerHTML = htmlOutput;

        copyDescBtn.disabled = false;

        // Update UI: SEO
        seoPlaceholder.classList.add('hidden');
        seoOutput.classList.remove('hidden');
        seoOutput.classList.add('animate-fade-in');
        seoPreviewTitle.textContent = productName;
        seoPreviewDesc.textContent = rawSeo;
        seoCharCount.textContent = rawSeo.length;

        if (rawSeo.length > 160) {
            seoCharCount.classList.add('text-red-500');
            seoCharCount.classList.remove('text-gray-500');
        } else {
            seoCharCount.classList.remove('text-red-500');
            seoCharCount.classList.add('text-gray-500');
        }
        copySeoBtn.disabled = false;
    }

    // --- Utility Functions ---
    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-80', 'cursor-not-allowed');
            btnText.textContent = translations[currentLang]['generating-text'];
            btnIcon.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            btnText.textContent = translations[currentLang]['btn-text'];
            btnIcon.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }

    function showError(message) {
        errorMsgContainer.classList.remove('hidden');
        errorText.textContent = message;
    }

    async function copyToClipboard(text, btnElement, textElement) {
        try {
            await navigator.clipboard.writeText(text);

            // Visual feedback
            const originalText = textElement.textContent;
            const icon = btnElement.querySelector('i');
            const originalIconClass = icon.className;

            textElement.textContent = translations[currentLang]['copied-text'];
            icon.className = 'fa-solid fa-check text-green-500';
            btnElement.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/30');

            setTimeout(() => {
                textElement.textContent = originalText;
                icon.className = originalIconClass;
                btnElement.classList.remove('border-green-500', 'bg-green-50', 'dark:bg-green-900/30');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        }
    }

    // --- Tab Switching Logic ---
    function switchTab(activeTab, inactiveTab, activeContent, inactiveContent) {
        // Active tab styling
        activeTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300');
        activeTab.classList.add('text-primary', 'border-primary');

        // Inactive tab styling
        inactiveTab.classList.remove('text-primary', 'border-primary');
        inactiveTab.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent', 'hover:text-gray-700', 'dark:hover:text-gray-300');

        // Toggle content
        activeContent.classList.remove('hidden');
        inactiveContent.classList.add('hidden');
    }

    tabRaw.addEventListener('click', () => {
        switchTab(tabRaw, tabPreview, contentRaw, contentPreview);
    });

    tabPreview.addEventListener('click', () => {
        switchTab(tabPreview, tabRaw, contentPreview, contentRaw);
    });

    // --- Event Listeners for Copy Buttons ---
    copyDescBtn.addEventListener('click', () => {
        if (rawDescription) {
            copyToClipboard(rawDescription, copyDescBtn, copyDescText);
        }
    });

    copySeoBtn.addEventListener('click', () => {
        if (rawSeo) {
            copyToClipboard(rawSeo, copySeoBtn, copySeoText);
        }
    });
});
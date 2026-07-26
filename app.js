document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let rawDescription = '';
    let rawSeo = '';

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const html = document.documentElement;

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
        const language = document.getElementById('language-output').value;

        // Construct Prompt
        const prompt = `You are an expert E-commerce Copywriter and SEO specialist.
        Please generate two things based on the following product details:

        Product Name: ${productName}
        Key Features/Keywords: ${keyFeatures}
        Target Audience: ${targetAudience}
        Tone of Voice: ${toneVoice}
        Output Language: ${language}

        REQUIRED FORMAT:
        Please provide the output EXACTLY in this format with these exact headings:

        [DESCRIPTION]
        (Write a compelling, high-converting product description using markdown. Include an engaging hook, a paragraph highlighting the main benefits, and bullet points for key features. Keep it structured and easy to read.)

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
        descriptionOutput.innerHTML = marked.parse(rawDescription);
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
            btnText.textContent = 'Generating...';
            btnIcon.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            btnText.textContent = 'Generate Description';
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

            textElement.textContent = 'Copied!';
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
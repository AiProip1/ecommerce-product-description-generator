export default async function handler(req, res) {
  // CORS configuration (optional but good practice for API routes)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin for this demo
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // 1. Get Environment Variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return res.status(500).json({ error: "Server configuration error. API Key missing." });
    }

    // 2. Extract Data from Request Body
    const {
      productName,
      keyFeatures,
      targetAudience,
      toneVoice,
      wordCount,
      language
    } = req.body;

    if (!productName || !keyFeatures) {
       return res.status(400).json({ error: "Product Name and Key Features are required." });
    }

    // 3. Construct Prompt (Moved from frontend to backend)
    let lengthInstruction = "Include an engaging hook, a paragraph highlighting the main benefits, and bullet points for key features. Keep it structured and easy to read.";
    if (wordCount === 'Short & Punchy') {
        lengthInstruction = "Make it very short, punchy, and straight to the point. 1-2 short paragraphs max.";
    } else if (wordCount === 'Bullet Points Only') {
        lengthInstruction = "Do not write paragraphs. Output the description ONLY as a list of compelling bullet points.";
    } else if (wordCount === 'Detailed') {
        lengthInstruction = "Write a comprehensive and detailed description. Include a hook, story-driven benefits, technical specifications in bullet points, and a strong call to action.";
    }

    const prompt = `You are an expert E-commerce Copywriter and SEO specialist.
    Please generate two things based on the following product details:

    Product Name: ${productName}
    Key Features/Keywords: ${keyFeatures}
    Target Audience: ${targetAudience || 'General Audience'}
    Tone of Voice: ${toneVoice || 'Professional'}
    Length & Format: ${wordCount || 'Standard'}
    Output Language: ${language || 'English'}

    REQUIRED FORMAT:
    Please provide the output EXACTLY in this format with these exact headings:

    [DESCRIPTION]
    (Write a compelling, high-converting product description using markdown. ${lengthInstruction})

    [SEO]
    (Write ONLY the SEO meta description here. It must be compelling, include the main keywords, and be under 160 characters.)
    `;

    // 4. Call Gemini API
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
        console.error("Gemini API Error:", errorData);
        return res.status(response.status).json({
            error: errorData.error?.message || `API Error: ${response.status}`
        });
    }

    const data = await response.json();

    // 5. Parse output and return clean JSON to the frontend
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        const generatedText = data.candidates[0].content.parts[0].text;

        let descMatch = generatedText.match(/\[DESCRIPTION\]([\s\S]*?)(?=\[SEO\]|$)/i);
        let seoMatch = generatedText.match(/\[SEO\]([\s\S]*)$/i);

        let rawDescription = "";
        let rawSeo = "";

        if (!descMatch && !seoMatch) {
             rawDescription = generatedText.trim();
             rawSeo = `Buy the best ${productName} online today. Check out its amazing features and get yours now!`; // Fallback
        } else {
             rawDescription = descMatch ? descMatch[1].trim() : "Description could not be parsed.";
             rawSeo = seoMatch ? seoMatch[1].trim() : "SEO description could not be parsed.";
        }

        // Clean up markdown markers
        rawDescription = rawDescription.replace(/^```markdown\n/, '').replace(/\n```$/, '').trim();
        rawSeo = rawSeo.replace(/^```\n/, '').replace(/\n```$/, '').replace(/^"|"$/g, '').trim();

        // Send successful response
        return res.status(200).json({
            description: rawDescription,
            seo: rawSeo
        });

    } else {
        return res.status(500).json({ error: "Received empty response from the AI model." });
    }

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred on the server." });
  }
}
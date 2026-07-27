// Cache variables outside the handler to persist across warm invocations
let cachedModels = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches and filters available models from the Gemini API.
 */
async function getAvailableFlashModels(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch models list: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.models || !Array.isArray(data.models)) {
    throw new Error('Invalid models response format');
  }

  const validModels = data.models.filter(model => {
    const name = model.name.toLowerCase();

    // Check if it supports generateContent
    const supportsGenerateContent = model.supportedGenerationMethods &&
                                    model.supportedGenerationMethods.includes('generateContent');

    // Check for 'flash' and exclude unwanted terms
    const isFlash = name.includes('flash');
    const hasUnwantedTerms = name.includes('vision') ||
                             name.includes('embedding') ||
                             name.includes('deprecated');

    return supportsGenerateContent && isFlash && !hasUnwantedTerms;
  });

  // Sort to prioritize 'flash-lite' models
  validModels.sort((a, b) => {
    const aIsLite = a.name.toLowerCase().includes('flash-lite');
    const bIsLite = b.name.toLowerCase().includes('flash-lite');

    if (aIsLite && !bIsLite) return -1; // a comes first
    if (!aIsLite && bIsLite) return 1;  // b comes first
    return 0; // maintain original order otherwise
  });

  // Extract just the names (e.g., "models/gemini-2.5-flash")
  return validModels.map(model => model.name);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
  }

  try {
    const { prompt } = req.body;

    // Check cache
    const now = Date.now();
    if (!cachedModels || cachedModels.length === 0 || (now - lastCacheTime > CACHE_DURATION_MS)) {
        try {
            cachedModels = await getAvailableFlashModels(apiKey);
            lastCacheTime = now;
        } catch (e) {
            console.error("Error updating model cache:", e);
            // If cache is empty and update fails, we cannot proceed
            if (!cachedModels || cachedModels.length === 0) {
                 return res.status(500).json({ error: 'Failed to retrieve available models from Google API.' });
            }
        }
    }

    if (!cachedModels || cachedModels.length === 0) {
        return res.status(500).json({ error: 'No compatible flash models found.' });
    }

    // Try generating content, iterating through available models if one fails with 404
    for (let i = 0; i < cachedModels.length; i++) {
        const modelName = cachedModels[i];
        // Strip 'models/' prefix if it's already there to construct the URL correctly
        const modelId = modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                    ]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error?.message || 'Gemini API Error';

                // If 404 or specific error message indicating unavailability, try the next model
                if (response.status === 404 || errorMessage.toLowerCase().includes('no longer available') || errorMessage.toLowerCase().includes('not found')) {
                     console.warn(`Model ${modelId} failed with 404/unavailable. Trying next model...`);

                     // If it's the last model in the cached list, force a refresh and try one more time
                     if (i === cachedModels.length - 1) {
                         console.log("Exhausted cached models. Forcing cache refresh...");
                         cachedModels = await getAvailableFlashModels(apiKey);
                         lastCacheTime = Date.now();

                         if (cachedModels.length > 0 && cachedModels[0] !== modelName) {
                             // Reset loop to try the new first model
                             i = -1;
                             continue;
                         } else {
                             // Still no luck, return the error
                             return res.status(response.status).json({ error: errorMessage });
                         }
                     }

                     continue; // Move to the next model in the list
                }

                // For other errors (e.g., 400 Bad Request, 429 Too Many Requests), return immediately
                return res.status(response.status).json({ error: errorMessage });
            }

            // Success! Return the response
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return res.status(200).json({ result: generatedText });

        } catch (fetchError) {
             console.error(`Fetch error with model ${modelId}:`, fetchError);
             // On network error during fetch, return a generic 500
             if (i === cachedModels.length - 1) {
                 return res.status(500).json({ error: 'Network error connecting to Gemini API.' });
             }
        }
    }

    // Should not reach here normally
    return res.status(500).json({ error: 'All compatible models failed.' });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server Internal Error' });
  }
}

# E-commerce Product Description Generator

A modern, responsive web application designed to generate high-converting product descriptions and SEO meta tags using the Google Gemini AI API. Built with HTML5, CSS3, Tailwind CSS, and Vanilla JavaScript.

## Features

- **AI-Powered Generation**: Leverages Google's Gemini 1.5 Flash model to create tailored product descriptions.
- **Customizable Output**: Adjust inputs for Target Audience, Tone of Voice, and Output Language.
- **SEO Optimization**: Generates a dedicated SEO meta description complete with a character counter preview.
- **Modern UI**: Clean interface built with Tailwind CSS, featuring full Dark/Light mode support.
- **Copy to Clipboard**: One-click copying of generated content with visual feedback.
- **Secure API Key Handling**: API key is stored locally in the browser (`localStorage`) and is only sent directly to Google's API endpoints.

## Tech Stack

- **HTML5**
- **CSS3 / Tailwind CSS** (via CDN for rapid styling)
- **Vanilla JavaScript**
- **marked.js** (for parsing markdown output from the AI)
- **FontAwesome** (for icons)

## Setup & Usage

Since this is a client-side only application using Vanilla JS, no build steps are required.

1. **Clone or Download** the repository.
2. **Open `index.html`** in any modern web browser.
   - *Optional:* Use a local development server like Live Server (VS Code) or `python3 -m http.server`.
3. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key.
4. **Enter your API Key**: Paste the key into the setup banner at the top of the application and click "Save Key".
5. **Generate**: Fill out the product details form and click "Generate Description".

## File Structure

- `index.html`: The main markup structure and Tailwind CDN configuration.
- `app.js`: Contains all the logic for state management, API requests, and DOM manipulation.
- `style.css`: Custom CSS overrides for scrollbars and markdown formatting.
- `README.md`: Project documentation.

## Note on Production

This application is designed as a demonstration/client-side tool. In a production environment facing public users, you should **never** expose API keys in client-side code. Instead, you would set up a backend server to proxy requests to the Gemini API to keep your API keys secure. However, in this application, the user provides their *own* key which is stored in their browser's local storage.
# E-commerce Product Description Generator

A modern, responsive web application designed to generate high-converting product descriptions and SEO meta tags using the Google Gemini AI API. Built with HTML5, CSS3, Tailwind CSS, and Vanilla JavaScript.

## Features

- **Serverless Backend**: Securely connects to the Google Gemini API using a Vercel Serverless Function (`/api/generate.js`).
- **Bilingual Interface**: Full support for English (LTR) and Arabic (RTL) with language toggle.
- **AI-Powered Generation**: Leverages Google's Gemini model to create tailored product descriptions.
- **Customizable Output**: Adjust inputs for Target Audience, Tone of Voice (with emoji formatting), Length & Format, and Output Language.
- **Shopify Preview**: Visualize the output instantly inside a simulated Shopify product tab.
- **SEO Optimization**: Generates a dedicated SEO meta description.
- **Modern UI**: Clean interface built with Tailwind CSS, featuring full Dark/Light mode support.
- **Social Sharing**: Easily share the tool with your network via WhatsApp and LinkedIn.

## Tech Stack

- **HTML5**
- **CSS3 / Tailwind CSS**
- **Vanilla JavaScript**
- **marked.js** (for parsing markdown output from the AI)
- **Node.js / Vercel Serverless Functions** (for backend API)

## Setup & Usage

To run this application, you need to set up the backend environment to securely access the Gemini API.

1. **Clone or Download** the repository.
2. **Get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free API key.
3. **Environment Setup**: Create a `.env` file in the root directory (or configure Vercel environment variables) and set your key:
   `GEMINI_API_KEY=your_api_key_here`
4. **Run Locally**: Use a tool like Vercel CLI to run the app locally:
   `vercel dev`
5. **Generate**: Fill out the product details form and click "Generate Description".

## File Structure

- `index.html`: The main markup structure and Tailwind CDN configuration.
- `app.js`: Contains all the frontend logic, state management, and form submissions to the backend.
- `style.css`: Custom CSS overrides for fonts (Inter/Tajawal), RTL helpers, and markdown formatting.
- `api/generate.js`: The Vercel serverless function that securely interacts with the Gemini API.
- `README.md`: Project documentation.

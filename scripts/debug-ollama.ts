
import './env-setup';
import { summarize } from '../src/lib/ai-provider';

async function testOllama() {
    console.log('Testing Ollama Summarization with Exaone...');

    const englishText = `
    Next.js 14 includes a new compiler capability that allows you to write standard JavaScript code that runs on the server.
    This is often referred to as "Server Actions". It is built on top of React Server Components and allows for seamless
    data mutations without the need for manual API endpoints. The App Router has been stabilized and provides a new
    paradigm for building React applications with nested layouts and simplified data fetching.
  `;

    try {
        const summary = await summarize(englishText);
        console.log('--- Original Text (English) ---');
        console.log(englishText.trim());
        console.log('\n--- Summary (Korean Expected) ---');
        console.log(summary);
    } catch (error) {
        console.error('Error during summarization:', error);
    }
}

testOllama();

// scripts/list-gemini-models.ts
// scripts/list-gemini-models.ts
import axios from 'axios';

async function main() {
  console.log('Listing available Gemini models...');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
  }

  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const models = response.data.models;

    if (models && models.length > 0) {
      console.log('Available Models:');
      models.forEach((model: any) => {
        // Filter out models that do not support generateContent, as we need this method
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- Name: ${model.name}, Supported Methods: ${model.supportedGenerationMethods.join(', ')}, Input Token Limit: ${model.inputTokenLimit}`);
        }
      });
    } else {
      console.log('No models found or error occurred.');
    }
  } catch (error: any) {
    console.error("Error listing Gemini models via REST API:", error.message);
    if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
    }
  }
}

main();
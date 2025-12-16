// scripts/list-gemini-models.ts
import { listAvailableModels } from '../src/lib/gemini';

async function main() {
  console.log('Listing available Gemini models...');
  const models = await listAvailableModels();
  if (models.length > 0) {
    console.log('Available Models:');
    models.forEach(model => {
      // Filter out models that do not support generateContent, as we need this method
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`- Name: ${model.name}, Supported Methods: ${model.supportedGenerationMethods.join(', ')}, Input Token Limit: ${model.inputTokenLimit}`);
      }
    });
  } else {
    console.log('No models found or error occurred.');
  }
}

main();
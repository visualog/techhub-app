// src/lib/ai-provider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// 1. Define the AISummarizerProvider Interface
interface AISummarizerProvider {
  summarize(text: string, title?: string): Promise<string | null>;
}

// 2. Implement GeminiSummarizerProvider
class GeminiSummarizerProvider implements AISummarizerProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async summarize(text: string, title?: string): Promise<string | null> {

    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `다음 텍스트를 한국어로 요약해줘. 원문의 핵심 내용을 중심으로 3~4문장의 간결한 요약문을 만들어줘:

${text}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const summary = response.text();
      return summary;
    } catch (error: any) {
      console.error(`Error generating summary with Gemini (${this.modelName}):`, error.message);
      return null;
    }
  }
}

// 3. Implement HuggingFaceSummarizerProvider
class HuggingFaceSummarizerProvider implements AISummarizerProvider {
  private apiKey: string;
  private modelUrl: string;
  private maxInputLength = 1024; // Increased limit for better summary context

  constructor(apiKey: string, modelUrl: string) {
    if (!apiKey) {
      throw new Error("HUGGING_FACE_API_KEY environment variable is not set.");
    }
    this.apiKey = apiKey;
    this.modelUrl = modelUrl;
  }

  async summarize(text: string, title?: string): Promise<string | null> {

    // Truncate text if it's too long for the model
    let inputText = text;
    if (inputText.length > this.maxInputLength) {
      console.warn(`Input text truncated from ${inputText.length} to ${this.maxInputLength} characters for Hugging Face summarization.`);
      inputText = inputText.substring(0, this.maxInputLength);
    }

    try {
      const response = await axios.post(
        this.modelUrl,
        { inputs: inputText }, // Use truncated text
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000, // Increase timeout to 60 seconds
        }
      );

      // Hugging Face summarization API often returns an array of summaries
      const summaries = response.data;
      if (Array.isArray(summaries) && summaries.length > 0 && summaries[0].summary_text) {
        return summaries[0].summary_text;
      } else {
        console.warn("Hugging Face API returned an unexpected response format.", summaries);
        return null;
      }
    } catch (error: any) {
      console.error("Error generating summary with Hugging Face:", error.message);
      if (error.response) {
        console.error("Hugging Face API Response Status:", error.response.status);
        console.error("Hugging Face API Response Data:", error.response.data);
      }
      return null;
    }
  }
}

// NEW: 3.1 Implement OllamaSummarizerProvider
class OllamaSummarizerProvider implements AISummarizerProvider {
  private ollamaApiUrl: string;
  private modelName: string;
  private maxInputLength = 1024; // Common limit for summarization models

  constructor(ollamaApiUrl: string, modelName: string) {
    if (!ollamaApiUrl) {
      throw new Error("OLLAMA_API_URL environment variable is not set for OllamaSummarizerProvider.");
    }
    if (!modelName) {
      throw new Error("OLLAMA_MODEL_NAME environment variable is not set for OllamaSummarizerProvider.");
    }
    this.ollamaApiUrl = ollamaApiUrl;
    this.modelName = modelName;
  }

  async summarize(text: string, title?: string): Promise<string | null> {
    if (!text) {
      return null;
    }

    // NEW: Truncate text if it's too long for the model
    let inputText = text;
    if (inputText.length > this.maxInputLength) {
      console.warn(`[OllamaSummarizer] Input text for article (Title: "${title || 'Unknown'}") truncated from ${inputText.length} to ${this.maxInputLength} characters for Ollama summarization.`);
      inputText = inputText.substring(0, this.maxInputLength);
    }

    // Ollama typically has a chat or completion endpoint
    // We'll use the 'generate' endpoint for simplicity and control over prompt
    // Use inputText here instead of original 'text'
    const prompt = `다음 텍스트를 한국어로 요약해줘. 만약 원문이 영어라면, 먼저 한국어로 번역한 후 요약해줘. 원문의 핵심 내용을 중심으로 3~4문장의 간결한 요약문을 만들어줘:

${inputText}`; // Use truncated inputText


    console.log(`- Ollama Input Text Length: ${prompt.length}`); // ADDED LOG
    console.log(`- Ollama Input Text Snippet (first 200 chars): ${prompt.substring(0, 200)}...`); // ADDED LOG

    try {
      const response = await axios.post(
        `${this.ollamaApiUrl}/api/generate`,
        {
          model: this.modelName,
          prompt: prompt,
          stream: false, // We want the full response at once
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 300000, // Increased timeout to 5 minutes for local LLM inference
        }
      );

      // Ollama's /api/generate endpoint returns data.response for the generated text
      if (response.data && response.data.response) {
        return response.data.response.trim();
      } else {
        console.warn("Ollama API returned an unexpected response format.", response.data);
        return null;
      }
    } catch (error: any) {
      console.error("Error generating summary with Ollama:", error.message);
      if (error.response) {
        console.error("Ollama API Response Status:", error.response.status);
        console.error("Ollama API Response Data:", error.response.data);
      }
      return null;
    }
  }
}


// 4. Factory function to select the provider
let activeSummarizer: AISummarizerProvider | null = null;

export function getAISummarizer(): AISummarizerProvider {
  if (activeSummarizer) {
    return activeSummarizer;
  }

  const aiProvider = process.env.AI_SUMMARIZER_PROVIDER || "GEMINI"; // Default to Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;

  // NEW: Ollama environment variables
  const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434"; // Default Ollama URL
  const ollamaModelName = process.env.OLLAMA_MODEL_NAME;


  switch (aiProvider.toUpperCase()) {
    case "GEMINI":
      // Use gemini-pro-latest by default for Gemini, as it's often more accessible.
      // User can override this by setting GEMINI_MODEL_NAME environment variable if needed.
      activeSummarizer = new GeminiSummarizerProvider(geminiApiKey!, process.env.GEMINI_MODEL_NAME || "gemini-pro-latest");
      console.log(`Using GeminiSummarizerProvider with model: ${process.env.GEMINI_MODEL_NAME || "gemini-pro-latest"}.`);
      break;
    case "HUGGINGFACE":
      // For Hugging Face, we'll need a model URL. This can also come from env or be hardcoded.
      const hfModelUrl = process.env.HUGGING_FACE_MODEL_URL || "https://router.huggingface.co/hf-inference/models/eenzeenee/t5-base-korean-summarization"; // Example model
      activeSummarizer = new HuggingFaceSummarizerProvider(huggingFaceApiKey!, hfModelUrl);
      console.log(`Using HuggingFaceSummarizerProvider with model URL: ${hfModelUrl}.`);
      break;
    case "OLLAMA":
      activeSummarizer = new OllamaSummarizerProvider(ollamaApiUrl, ollamaModelName!);
      console.log(`Using OllamaSummarizerProvider with model: ${ollamaModelName} at ${ollamaApiUrl}.`);
      break;
    default:
      throw new Error(`Unknown AI_SUMMARIZER_PROVIDER: ${aiProvider}. Please set AI_SUMMARIZER_PROVIDER to 'GEMINI', 'HUGGINGFACE', or 'OLLAMA'.`);
  }
  return activeSummarizer;
}

// Export the summarize function that the rss-parser will call
export const summarize = (text: string, title?: string): Promise<string | null> => {
  return getAISummarizer().summarize(text, title);
};
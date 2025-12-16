// src/lib/ai-provider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios"; // Will be needed for HuggingFace

// 1. Define the AISummarizerProvider Interface
interface AISummarizerProvider {
  summarize(text: string): Promise<string | null>;
}

// 2. Implement GeminiSummarizerProvider
class GeminiSummarizerProvider implements AISummarizerProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set for GeminiSummarizerProvider.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async summarize(text: string): Promise<string | null> {
    if (!text) {
      return null;
    }

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

// 3. Implement HuggingFaceSummarizerProvider (Placeholder for now)
class HuggingFaceSummarizerProvider implements AISummarizerProvider {
  private apiKey: string;
  private modelUrl: string; // e.g., "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"

  constructor(apiKey: string, modelUrl: string) {
    if (!apiKey) {
      throw new Error("HUGGING_FACE_API_KEY environment variable is not set for HuggingFaceSummarizerProvider.");
    }
    this.apiKey = apiKey;
    this.modelUrl = modelUrl;
  }

  async summarize(text: string): Promise<string | null> {
    if (!text) {
      return null;
    }

    try {
      const response = await axios.post(
        this.modelUrl,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
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


// 4. Factory function to select the provider
let activeSummarizer: AISummarizerProvider | null = null;

export function getAISummarizer(): AISummarizerProvider {
  if (activeSummarizer) {
    return activeSummarizer;
  }

  const aiProvider = process.env.AI_SUMMARIZER_PROVIDER || "GEMINI"; // Default to Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;

  switch (aiProvider.toUpperCase()) {
    case "GEMINI":
      // Use gemini-pro-latest by default for Gemini, as it's often more accessible.
      // User can override this by setting GEMINI_MODEL_NAME environment variable if needed.
      activeSummarizer = new GeminiSummarizerProvider(geminiApiKey!, process.env.GEMINI_MODEL_NAME || "gemini-pro-latest"); 
      console.log(`Using GeminiSummarizerProvider with model: ${process.env.GEMINI_MODEL_NAME || "gemini-pro-latest"}.`);
      break;
    case "HUGGINGFACE":
      // For Hugging Face, we'll need a model URL. This can also come from env or be hardcoded.
      const hfModelUrl = process.env.HUGGING_FACE_MODEL_URL || "https://router.huggingface.co/models/facebook/bart-large-cnn"; // Example model
      activeSummarizer = new HuggingFaceSummarizerProvider(huggingFaceApiKey!, hfModelUrl);
      console.log(`Using HuggingFaceSummarizerProvider with model URL: ${hfModelUrl}.`);
      break;
    default:
      throw new Error(`Unknown AI_SUMMARIZER_PROVIDER: ${aiProvider}. Please set AI_SUMMARIZER_PROVIDER to 'GEMINI' or 'HUGGINGFACE'.`);
  }
  return activeSummarizer;
}

// Export the summarize function that the rss-parser will call
export const summarize = (text: string): Promise<string | null> => {
  return getAISummarizer().summarize(text);
};
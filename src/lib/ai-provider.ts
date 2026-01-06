// src/lib/ai-provider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// 1. Define the AISummarizerProvider Interface
interface AISummarizerProvider {
  summarize(text: string): Promise<string | null>;
  generateText(prompt: string): Promise<string | null>; // NEW: Generic text generation
  generateImage(prompt: string): Promise<Buffer | null>;
}

// 2. Implement GeminiSummarizerProvider
class GeminiSummarizerProvider implements AISummarizerProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;
  private apiKey: string;

  constructor(apiKey: string, modelName: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async summarize(text: string): Promise<string | null> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `다음 텍스트를 한국어로 요약해줘. 원문의 핵심 내용을 중심으로 3~4문장의 간결한 요약문을 만들어줘:
${text}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: unknown) {
      console.error(`Error generating summary with Gemini (${this.modelName}):`, (error as Error).message);
      return null;
    }
  }

  async generateText(prompt: string): Promise<string | null> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error("Error generating text with Gemini:", error.message);
      return null;
    }
  }

  async generateImage(prompt: string): Promise<Buffer | null> {
    // Note: The @google/generative-ai SDK currently wraps the Gemini API.
    // Image generation (Imagen 3) via the direct API might require a specific call structure.
    // We will attempt to use the REST API endpoint for Imagen 3 if SDK doesn't abstract it perfectly yet,
    // or use the model name "imagen-3.0-generate-001".

    // For simplicity and guaranteed standard HTTP access to Imagen 3 on Google AI Studio:
    // POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
    // But standard Gemini API Key works.

    console.log(`- Generating image with Imagen 3... Prompt: ${prompt.substring(0, 50)}...`);

    // Using basic axios for Imagen 3 REST API to ensure compatibility
    // Model: imagen-3.0-generate-001
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`;

    try {
      const response = await axios.post(
        url,
        {
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "4:3" // Optimized for modal
          }
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Response structure: { predictions: [ { bytesBase64Encoded: "..." } ] }
      if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
        const base64 = response.data.predictions[0].bytesBase64Encoded;
        return Buffer.from(base64, 'base64');
      } else {
        console.error("Imagen 3 unexpected response:", JSON.stringify(response.data).substring(0, 200));
        return null;
      }

    } catch (error: any) {
      console.error("Error generating image with Imagen 3:", error.response?.data || error.message);
      return null; // Fallback to null
    }
  }
}

// 3. Implement HuggingFaceSummarizerProvider
class HuggingFaceSummarizerProvider implements AISummarizerProvider {
  private apiKey: string;
  private modelUrl: string;
  private maxInputLength = 1024;

  constructor(apiKey: string, modelUrl: string) {
    if (!apiKey) throw new Error("HUGGING_FACE_API_KEY environment variable is not set.");
    this.apiKey = apiKey;
    this.modelUrl = modelUrl;
  }

  async summarize(text: string): Promise<string | null> {
    // ... (Existing implementation, truncated for brevity in replace tool unless I replace whole file. 
    // I SHOULD REPLACE WHOLE FILE to avoid missing chunks if I use replace_file_content with range 1-221)
    // RE-IMPLEMENTING EXISTING LOGIC for completeness
    let inputText = text;
    if (inputText.length > this.maxInputLength) inputText = inputText.substring(0, this.maxInputLength);

    try {
      const response = await axios.post(
        this.modelUrl,
        { inputs: inputText },
        { headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" }, timeout: 60000 }
      );
      const summaries = response.data;
      if (Array.isArray(summaries) && summaries.length > 0 && summaries[0].summary_text) {
        return summaries[0].summary_text;
      }
      return null;
    } catch (error: any) {
      console.error("Error generating summary with Hugging Face:", error.message);
      return null;
    }
  }

  async generateText(prompt: string): Promise<string | null> {
    // Hugging Face inference logic varies by model. Skipping for now.
    return null;
  }

  async generateImage(prompt: string): Promise<Buffer | null> {
    return null;
  }
}

// 3.1 Implement OllamaSummarizerProvider
class OllamaSummarizerProvider implements AISummarizerProvider {
  private ollamaApiUrl: string;
  private modelName: string;
  private maxInputLength = 2000; // Increased

  constructor(ollamaApiUrl: string, modelName: string) {
    if (!ollamaApiUrl) throw new Error("OLLAMA_API_URL not set.");
    if (!modelName) throw new Error("OLLAMA_MODEL_NAME not set.");
    this.ollamaApiUrl = ollamaApiUrl;
    this.modelName = modelName;
  }

  async summarize(text: string): Promise<string | null> {
    if (!text) return null;
    let inputText = text;
    if (inputText.length > this.maxInputLength) inputText = inputText.substring(0, this.maxInputLength);

    // REFINED PROMPT
    const prompt = `[System]
You are a professional editor. Your task is to summarize the following text into Korean.
Rules:
1. If the text is in English, translate it to Korean first, then summarize.
2. The summary must be 3-4 concise sentences (around 200-300 characters).
3. OUTPUT ONLY THE SUMMARY TEXT. Do not include labels like "Summary:", "요약:", or "Here is the summary".
4. Do not include any introductory or concluding remarks.

[Input Text]
${inputText}`;

    return this.generateText(prompt); // Re-use generateText
  }

  async generateText(prompt: string): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.ollamaApiUrl}/api/generate`,
        { model: this.modelName, prompt: prompt, stream: false },
        { headers: { "Content-Type": "application/json" }, timeout: 300000 }
      );
      if (response.data && response.data.response) {
        return response.data.response.trim();
      }
      return null;
    } catch (error: any) {
      console.error("Error generating text with Ollama:", error.message);
      return null;
    }
  }

  async generateImage(prompt: string): Promise<Buffer | null> {
    // Ollama doesn't generate images natively (usually). We will return null or fallback to Gemini if configured hybrid.
    // For this project, we might want to use Gemini for images even if Ollama is used for text.
    // Let's create a helper to use Gemini for images specifically if API key is present.

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiProvider = new GeminiSummarizerProvider(geminiKey, "imagen-3.0-generate-001");
      return geminiProvider.generateImage(prompt);
    }

    console.warn("No GEMINI_API_KEY found for image generation fallback.");
    return null;
  }
}

// 4. Factory function
let activeSummarizer: AISummarizerProvider | null = null;

export function getAISummarizer(): AISummarizerProvider {
  if (activeSummarizer) return activeSummarizer;

  const aiProvider = process.env.AI_SUMMARIZER_PROVIDER || "GEMINI";
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
  const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
  const ollamaModelName = process.env.OLLAMA_MODEL_NAME;

  switch (aiProvider.toUpperCase()) {
    case "GEMINI":
      activeSummarizer = new GeminiSummarizerProvider(geminiApiKey!, process.env.GEMINI_MODEL_NAME || "gemini-pro-latest");
      break;
    case "HUGGINGFACE":
      const hfModelUrl = process.env.HUGGING_FACE_MODEL_URL || "https://router.huggingface.co/hf-inference/models/eenzeenee/t5-base-korean-summarization";
      activeSummarizer = new HuggingFaceSummarizerProvider(huggingFaceApiKey!, hfModelUrl);
      break;
    case "OLLAMA":
      activeSummarizer = new OllamaSummarizerProvider(ollamaApiUrl, ollamaModelName!);
      break;
    default:
      throw new Error(`Unknown AI provider: ${aiProvider}`);
  }
  return activeSummarizer;
}

export const summarize = (text: string) => getAISummarizer().summarize(text);
export const generateText = (prompt: string) => getAISummarizer().generateText(prompt);
export const generateImage = (prompt: string) => getAISummarizer().generateImage(prompt);
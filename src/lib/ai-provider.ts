// src/lib/ai-provider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// 1. Define the AISummarizerProvider Interface
// 1. Define the AISummarizerProvider Interface
interface AISummarizerProvider {
  summarize(text: string): Promise<string | null>;
  translateTitle(title: string): Promise<string | null>; // NEW: Translate title
  generateText(prompt: string): Promise<string | null>;
  generateImage(prompt: string): Promise<Buffer | null>;
}

// ... (GeminiSummarizerProvider implementation) ...
// Implement stub for Gemini for now (or implement if easy)
class GeminiSummarizerProvider implements AISummarizerProvider {
  // ... existing members ...
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
    // ... existing ...
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `다음 텍스트를 한국어로 요약해줘. 원문의 핵심 내용을 중심으로 3~4문장의 간결한 요약문을 만들어줘:
${text}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error(`Error generating summary with Gemini:`, error.message);
      return null;
    }
  }

  async translateTitle(title: string): Promise<string | null> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = `Translate the following title into Korean. Output ONLY the translated title, no explanations.
Original Title: ${title}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      console.error(`Error translating title with Gemini:`, error.message);
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
    // ... existing ...
    console.log(`- Generating image with Imagen 3... Prompt: ${prompt.substring(0, 50)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${this.apiKey}`;
    try {
      const response = await axios.post(url,
        { instances: [{ prompt: prompt }], parameters: { sampleCount: 1, aspectRatio: "4:3" } },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
        return Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
      } else {
        return null;
      }
    } catch (error: any) {
      console.error("Error generating image with Imagen 3:", error.message);
      return null;
    }
  }
}

// ... (HuggingFaceSummarizerProvider - stubbed) ...
class HuggingFaceSummarizerProvider implements AISummarizerProvider {
  private apiKey: string;
  private modelUrl: string;
  private maxInputLength = 1024;

  constructor(apiKey: string, modelUrl: string) {
    this.apiKey = apiKey;
    this.modelUrl = modelUrl;
  }
  async summarize(text: string) { return null; } // truncated for brevity usage
  async translateTitle(title: string) { return title; } // fallback
  async generateText(prompt: string) { return null; }
  async generateImage(prompt: string) { return null; }
}


// ... (OllamaSummarizerProvider) ...
class OllamaSummarizerProvider implements AISummarizerProvider {
  private ollamaApiUrl: string;
  private modelName: string;
  private maxInputLength = 2000;

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

    const prompt = `[System]
You are a professional translator and editor. 
Your task is to summarize the provided text INTO KOREAN. 

Instructions:
1. Regardless of the input language (English or Korean), the OUTPUT MUST BE IN KOREAN.
2. Summarize the key points in 3-4 concise sentences.
3. Use a professional, formal Korean tone (해요체 or 하십시오체).
4. DO NOT output any English text in the summary. 

[Input Text]
${inputText} 

[Output (Korean)]
`;
    return this.generateText(prompt);
  }

  async translateTitle(title: string): Promise<string | null> {
    if (!title) return null;
    const prompt = `[System]
You are a professional translator.
Translate the following English title into natural, professional Korean.
Do not add quotes or explanations. Just the translated title.

[Original Title]
${title}

[Korean Title]
`;
    return this.generateText(prompt);
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
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiProvider = new GeminiSummarizerProvider(geminiKey, "imagen-3.0-generate-001");
      return geminiProvider.generateImage(prompt);
    }
    console.warn("No GEMINI_API_KEY found for image generation fallback.");
    return null;
  }
}

// ... (Factor function and exports) ...
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
      // Stub implementation used above
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
export const translateTitle = (title: string) => getAISummarizer().translateTitle(title);
export const generateText = (prompt: string) => getAISummarizer().generateText(prompt);
export const generateImage = (prompt: string) => getAISummarizer().generateImage(prompt);
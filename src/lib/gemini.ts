// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * Generates a summary for the given text content.
 * @param text The text content to summarize.
 * @returns The generated summary as a string, or null if an error occurs.
 */
export async function generateSummary(text: string): Promise<string | null> {
  if (!text) {
    return null;
  }

  const prompt = `다음 텍스트를 한국어로 요약해줘. 원문의 핵심 내용을 중심으로 3~4문장의 간결한 요약문을 만들어줘:

${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();
    return summary;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return null;
  }
}

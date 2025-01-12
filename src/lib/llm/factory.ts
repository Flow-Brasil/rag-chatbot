import { ModelType, LLMModel } from "@/lib/types/llm";
import { GeminiModel } from "./gemini";
import { GroqModel } from "./groq";

export class LLMFactory {
  static createModel(type: ModelType, apiKey: string): LLMModel {
    switch (type) {
      case "gemini":
        return new GeminiModel(apiKey);
      case "groq":
        return new GroqModel(apiKey);
      default:
        throw new Error(`Modelo não suportado: ${type}`);
    }
  }
} 
import { ModelType } from "@/lib/types/llm";

export function validateApiKey(apiKey: string | undefined, modelType: ModelType): string {
  if (!apiKey) {
    throw new Error(`API key is required for ${modelType} model`);
  }

  switch (modelType) {
    case "groq":
      // Groq API keys start with "gsk_" and are at least 50 chars long
      if (!apiKey.startsWith("gsk_") || apiKey.length < 50 || !/^gsk_[a-zA-Z0-9]{48}$/.test(apiKey)) {
        throw new Error("Invalid Groq API key format. Keys should start with 'gsk_' and be at least 50 characters long.");
      }
      break;
    case "gemini":
      // Gemini API keys are typically long alphanumeric strings
      if (apiKey.length < 20) {
        throw new Error("Invalid Gemini API key format. Key seems too short.");
      }
      break;
  }

  return apiKey;
} 
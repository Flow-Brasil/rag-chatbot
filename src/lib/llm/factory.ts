import { Message } from "ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { LLM_CONFIG } from "@/lib/config/constants";
import { LLMModel, LLMResponse, ModelType } from "@/lib/types/llm";
import { getSystemPrompt } from "@/lib/utils/chat";
import { validateApiKey } from "@/lib/utils/validation";
import { type ChatCompletionMessage } from "@groq/groq-sdk";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

class GeminiModel implements LLMModel {
  private model: GoogleGenerativeAI;
  private chat: any;

  constructor(apiKey: string) {
    this.model = new GoogleGenerativeAI(apiKey);
    this.chat = this.model.getGenerativeModel({ model: "gemini-pro" });
  }

  async invoke(messages: Message[]): Promise<LLMResponse> {
    try {
      const systemPrompt = getSystemPrompt("gemini");
      
      // Format messages for Gemini - map roles correctly
      const formattedMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Add system prompt as first user message
      formattedMessages.unshift({
        role: "user",
        parts: [{ text: systemPrompt }]
      });

      const result = await this.chat.generateContent({
        contents: formattedMessages,
        generationConfig: {
          temperature: LLM_CONFIG.gemini.temperature,
          maxOutputTokens: LLM_CONFIG.gemini.maxTokens,
          topK: 1,
          topP: 1,
        }
      });

      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("Modelo não retornou resposta");
      }
      
      return {
        content: text,
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        error: error instanceof Error ? error.message : "Erro desconhecido ao processar mensagem"
      };
    }
  }
}

// Define the minimal interface we need for the Groq client
interface GroqClient {
  chat: {
    completions: {
      create: (params: {
        messages: { role: "user" | "assistant"; content: string }[];
        model: string;
        temperature: number;
        max_tokens: number;
      }) => Promise<{
        choices: Array<{
          message?: {
            content?: string;
          };
        }>;
      }>;
    };
  };
}

class GroqModel implements LLMModel {
  private client: GroqClient;

  constructor(apiKey: string) {
    try {
      const validatedKey = validateApiKey(apiKey, "groq");
      this.client = new Groq({
        apiKey: validatedKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to initialize Groq model: ${message}`);
    }
  }

  async invoke(messages: Message[]): Promise<LLMResponse> {
    try {
      const chatMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      })) as { role: "user" | "assistant"; content: string }[];

      const completion = await this.client.chat.completions.create({
        messages: chatMessages,
        model: LLM_CONFIG.groq.model,
        temperature: LLM_CONFIG.groq.temperature,
        max_tokens: LLM_CONFIG.groq.maxTokens
      });

      return {
        text: completion.choices[0]?.message?.content || "",
      };
    } catch (error: unknown) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("Invalid API Key") || 
            (error as any).status === 401) {
          throw new Error("Invalid or expired API key for Groq model. Please check your API key.");
        }
        if (error.message.includes("rate limit")) {
          throw new Error("Rate limit exceeded for Groq API. Please try again later.");
        }
        throw new Error(`Error calling Groq API: ${error.message}`);
      }
      // Generic error fallback
      throw new Error("Unknown error occurred while calling Groq API");
    }
  }
}

export class LLMFactory {
  static createModel(modelType: ModelType, apiKey: string): LLMModel {
    switch (modelType) {
      case "gemini":
        return new GeminiModel(apiKey);
      case "groq":
        return new GroqModel(apiKey);
      default:
        throw new Error(`Modelo não suportado: ${modelType}`);
    }
  }

  static clearInstances() {
    // Limpa instâncias se necessário
  }
} 
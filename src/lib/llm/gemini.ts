import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMModel, Message, LLMResponse } from "@/lib/types/llm";

export class GeminiModel implements LLMModel {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async invoke(messages: Message[], data?: {
    documentId?: string;
    scope?: string;
  }): Promise<LLMResponse> {
    try {
      // Preparar o prompt com base no contexto
      let prompt = "";

      if (data?.documentId) {
        prompt += `Responda com base no documento ${data.documentId}`;
        if (data.scope) {
          prompt += ` no escopo "${data.scope}"`;
        }
        prompt += ".\n\n";
      }

      // Adicionar histórico de mensagens
      messages.forEach((m) => {
        prompt += `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}\n`;
      });

      // Gerar resposta
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
} 
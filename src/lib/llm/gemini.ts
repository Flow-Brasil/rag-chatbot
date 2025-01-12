import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMModel, Message, LLMResponse } from "@/lib/types/llm";

export class GeminiModel implements LLMModel {
  private model: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.model = new GoogleGenerativeAI(apiKey);
  }

  async invoke(messages: Message[]): Promise<LLMResponse> {
    try {
      // Configurar o modelo Gemini
      const model = this.model.getGenerativeModel({ model: "gemini-pro" });

      // Preparar o histórico de mensagens para o modelo
      const prompt = messages
        .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
        .join('\n');

      // Gerar resposta
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        error: undefined
      };
    } catch (error) {
      console.error('Erro ao chamar Gemini:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 
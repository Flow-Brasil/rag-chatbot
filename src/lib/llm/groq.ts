import Groq from 'groq-sdk';
import { LLMModel, Message, LLMResponse } from '@/lib/types/llm';

export class GroqModel implements LLMModel {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
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
      const completion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 2048,
      });

      return {
        content: completion.choices[0]?.message?.content || "",
      };
    } catch (error) {
      console.error("Groq Error:", error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
} 
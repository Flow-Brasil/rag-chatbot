import Groq from 'groq-sdk';
import { LLMModel, Message, LLMResponse } from '@/lib/types/llm';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export class GroqModel implements LLMModel {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async invoke(messages: Message[]): Promise<LLMResponse> {
    try {
      // Preparar mensagens para o formato do Groq
      const formattedMessages: ChatMessage[] = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      // Fazer a chamada para a API do Groq
      const completion = await this.client.chat.completions.create({
        messages: formattedMessages,
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      });

      // Extrair a resposta
      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('Resposta vazia do modelo');
      }

      return {
        content: response,
        error: undefined
      };
    } catch (error) {
      console.error('Erro ao chamar Groq:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 
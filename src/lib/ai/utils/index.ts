import { Message, ChatMessage, LLMResponse } from '../types';

export function formatChatMessage(content: string, role: Message["role"] = "user"): ChatMessage {
  return {
    id: String(Date.now()),
    role,
    content,
    timestamp: Date.now(),
  };
}

export function extractModelResponse(response: any): LLMResponse {
  try {
    if (response.text) return { content: "", text: response.text };
    if (response.content) return { content: response.content };
    if (response.choices?.[0]?.message?.content) {
      return { content: response.choices[0].message.content };
    }
    return { content: "", error: "Formato de resposta desconhecido" };
  } catch (error) {
    return { content: "", error: "Erro ao processar resposta do modelo" };
  }
}

export function sanitizeMessages(messages: Message[]): Message[] {
  return messages.map(msg => ({
    id: msg.id || String(Date.now()),
    role: msg.role,
    content: msg.content,
  }));
} 
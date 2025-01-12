import { Message } from "ai";
import { LLM_CONFIG } from "@/lib/config/constants";
import { ChatMessage, LLMResponse } from "@/lib/types/llm";

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
    if (response.text) return { text: response.text };
    if (response.content) return { content: response.content };
    if (response.choices?.[0]?.message?.content) {
      return { content: response.choices[0].message.content };
    }
    return { error: "Formato de resposta desconhecido" };
  } catch (error) {
    return { error: "Erro ao processar resposta do modelo" };
  }
}

export function getSystemPrompt(key: keyof typeof LLM_CONFIG.systemPrompts = "default"): string {
  return LLM_CONFIG.systemPrompts[key];
}

export function sanitizeMessages(messages: Message[]): Message[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    id: msg.id,
  }));
} 
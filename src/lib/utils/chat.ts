import { Message } from "ai";
import { LLM_CONFIG } from "@/lib/config/constants";
import { ChatMessage, LLMResponse } from "@/lib/types/llm";

export function formatChatMessage(role: "user" | "assistant" | "system", content: string): Message {
  return {
    id: Math.random().toString(36).substring(7),
    role,
    content,
    createdAt: new Date()
  };
}

export function getSystemPrompt(key: keyof typeof LLM_CONFIG): string {
  return LLM_CONFIG[key].systemPrompt;
}

export function extractModelResponse(response: LLMResponse): string {
  if (response.error) {
    throw new Error(response.error);
  }
  return response.content || "";
}

export function sanitizeMessages(messages: Message[]): Message[] {
  return messages.map(msg => ({
    id: msg.id || Math.random().toString(36).substring(7),
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt || new Date()
  }));
} 
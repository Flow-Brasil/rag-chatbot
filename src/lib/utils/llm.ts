import { Message } from "ai";
import { LLM_CONFIG } from "@/lib/config/constants";
import { ChatMessage, LLMResponse } from "@/lib/types/llm";

export function formatChatMessage(content: string, role: "user" | "assistant" = "user"): ChatMessage {
  return {
    id: String(Date.now()),
    role,
    content,
    timestamp: Date.now(),
  };
}

export function extractModelResponse(response: any): LLMResponse {
  if (response?.text) {
    return { content: response.text };
  }

  if (response?.error) {
    return { content: `Error: ${response.error}` };
  }

  if (typeof response === 'string') {
    return { content: response };
  }

  return { content: 'No response content available' };
}

export function getSystemPrompt(key: string): string {
  const config = LLM_CONFIG[key as keyof typeof LLM_CONFIG];
  return config?.systemPrompt || '';
}

export function sanitizeMessages(messages: Message[]): Message[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    id: msg.id,
  }));
} 
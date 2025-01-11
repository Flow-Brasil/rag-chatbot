import { Message } from "ai";

export type ModelType = "gemini" | "groq";

export interface LLMConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  text?: string;
  content?: string;
  error?: string;
}

export interface LLMModel {
  invoke(messages: Message[]): Promise<LLMResponse>;
}

export interface ChatMessage extends Message {
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export type ChatHistory = ChatMessage[]; 
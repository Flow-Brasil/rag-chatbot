export type ModelType = "gemini" | "groq";

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface LLMConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
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
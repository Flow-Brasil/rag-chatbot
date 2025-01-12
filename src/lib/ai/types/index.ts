import { 
  Message,
  BaseMessage,
  ChatMessage,
  ModelResponse,
  StreamConfig
} from './message';

// Tipos para respostas dos modelos
export interface LLMResponse {
  content: string;
  error?: string;
  text?: string;
}

// Tipos para configuração dos modelos
export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

// Tipos para invocação de ferramentas
export interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

// Tipos para middleware
export interface AIMiddleware {
  before?: (messages: Message[]) => Promise<Message[]>;
  after?: (response: LLMResponse) => Promise<LLMResponse>;
}

// Configurações do sistema
export interface SystemConfig {
  groq: ModelConfig;
  gemini: ModelConfig;
}

// Re-exportando todos os tipos
export type {
  Message,
  BaseMessage,
  ChatMessage,
  ModelResponse,
  StreamConfig
}; 
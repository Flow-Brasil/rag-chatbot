// Tipos base para mensagens AI
export interface BaseMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

// Tipo Message do pacote 'ai'
export interface Message extends BaseMessage {
  id: string;
}

// Tipo para mensagens de chat
export interface ChatMessage extends BaseMessage {
  id: string;
  timestamp: number;
}

// Tipo para respostas do modelo
export interface ModelResponse {
  content: string;
  role: 'assistant';
  id?: string;
}

// Tipo para configuração de streaming
export interface StreamConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
} 
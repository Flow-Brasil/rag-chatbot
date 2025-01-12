import { type Message as AIMessage } from 'ai';

export interface Message extends AIMessage {
  error?: boolean;
}

export interface SendMessageOptions {
  role?: 'user' | 'assistant';
  error?: boolean;
} 
import { Message } from "ai";
import { useState, useCallback } from "react";

export type MessageWithModel = Message & {
  model?: 'groq' | 'gemini';
};

export function useChatMessages(initialMessages: MessageWithModel[] = []) {
  const [messages, setMessages] = useState<MessageWithModel[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((message: MessageWithModel) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((model: 'groq' | 'gemini') => {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant' && !lastMessage.model) {
        return [...prev.slice(0, -1), { ...lastMessage, model }];
      }
      return prev;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    setIsProcessing,
    addMessage,
    updateLastMessage,
    clearMessages,
  };
} 
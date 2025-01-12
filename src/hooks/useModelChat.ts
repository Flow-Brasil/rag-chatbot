"use client";

import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

interface SendMessageOptions {
  role?: 'user' | 'assistant';
  data?: {
    documentId?: string;
    scope?: string;
  };
}

export function useModelChat(modelType: string = 'gemini') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, options: SendMessageOptions = {}) => {
    const { role = 'user', data } = options;
    const messageId = uuid();

    const newMessage: Message = {
      id: messageId,
      content,
      role,
    };

    setMessages(prev => [...prev, newMessage]);

    if (role === 'user') {
      setIsLoading(true);
      try {
        console.log('Enviando mensagem:', {
          message: content,
          modelType,
          messages: [...messages, newMessage],
          data,
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            modelType,
            messages: [...messages, newMessage],
            data,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Falha ao enviar mensagem';
          try {
            const error = await response.json();
            errorMessage = error.error || error.detail || error.message || errorMessage;
          } catch {
            // Se não conseguir parsear o JSON, usa a mensagem padrão
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        const assistantMessage: Message = {
          id: uuid(),
          content: responseData.response,
          role: 'assistant',
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Remove a mensagem do usuário em caso de erro
        setMessages(prev => prev.slice(0, -1));
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  }, [modelType, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
  };
} 
"use client";

import { useCallback, useState } from 'react';
import type { Message, SendMessageOptions } from '@/lib/types/message';

export function useModelChat(modelType: string = 'gemini') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, options?: SendMessageOptions) => {
    try {
      setIsLoading(true);
      
      // Verifica se deve sugerir limpar o chat (a cada 10 mensagens)
      if (messages.length >= 10 && messages.length % 10 === 0 && !options?.error) {
        const sugestionMessage: Message = {
          id: Date.now().toString(),
          content: "💡 Você já tem várias mensagens no chat. Para melhor performance, considere limpar o histórico clicando no botão 'Limpar'.",
          role: 'assistant',
          error: true
        };
        setMessages(prev => [...prev, sugestionMessage]);
      }

      // Adiciona mensagem do usuário se não for erro
      if (!options?.error) {
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
      }

      // Se for mensagem de erro, adiciona diretamente
      if (options?.error) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content,
          role: options.role || 'assistant',
          error: true
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Faz a requisição para a API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: messages,
          modelType
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error?.includes('Failed to fetch')) {
          throw new Error('Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet e tente novamente.');
        }
        throw new Error(error.error || 'Erro ao processar mensagem');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Adiciona mensagem de erro
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: error instanceof Error ? error.message : 'Erro ao processar mensagem',
        role: 'assistant',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, modelType]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading
  };
} 
"use client";

import { type Message } from "@/lib/types/message";
import { useChat } from "ai/react";
import { useCallback, useState } from "react";
import { useModelSelection } from "./useModelSelection";

interface UseCustomChatProps {
  initialMessages?: Message[];
  id?: string;
}

export function useCustomChat({ initialMessages = [], id }: UseCustomChatProps = {}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: chatSubmit,
    setInput,
    isLoading,
    stop,
    setMessages
  } = useChat({
    initialMessages,
    id,
    api: '/api/chat'
  });

  const [error, setError] = useState<string | null>(null);
  const { selectedModel, getModelOptions } = useModelSelection();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<Element>) => {
      e.preventDefault();
      setError(null);

      if (!input.trim()) {
        setError("Por favor, digite uma mensagem");
        return;
      }

      try {
        const modelOptions = getModelOptions();
        
        // Adiciona tratamento especial para comandos
        if (input.startsWith('/')) {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [...messages, { role: 'user', content: input }],
              ...modelOptions
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao processar comando');
          }

          const data = await response.json();
          
          // Atualiza as mensagens com a resposta do comando
          setMessages([
            ...messages,
            { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
            { 
              role: 'assistant', 
              content: data.content || data.response, 
              id: `assistant-${Date.now()}`,
              error: data.error ? true : false
            } as Message
          ]);
          setInput('');
          return;
        }

        // Processa mensagens normais
        try {
          await chatSubmit(e as React.FormEvent<HTMLFormElement>, {
            data: modelOptions
          });
        } catch (error) {
          // Adiciona mensagem de erro diretamente no chat
          setMessages([
            ...messages,
            { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
            { 
              role: 'assistant', 
              content: error instanceof Error ? error.message : 'Erro ao processar mensagem. Por favor, tente novamente.',
              id: `assistant-${Date.now()}`,
              error: true
            } as Message
          ]);
          setInput('');
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Adiciona mensagem de erro diretamente no chat
        setMessages([
          ...messages,
          { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
          { 
            role: 'assistant', 
            content: error instanceof Error ? error.message : 'Erro ao enviar mensagem. Por favor, tente novamente.',
            id: `assistant-${Date.now()}`,
            error: true
          } as Message
        ]);
        setInput('');
      }
    },
    [chatSubmit, input, messages, getModelOptions, setMessages, setInput]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    stop,
    setMessages,
    error
  };
} 
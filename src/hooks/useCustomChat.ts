"use client";

import { Message } from "ai";
import { useChat } from "ai/react";
import { useCallback } from "react";
import { toast } from "sonner";
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
    id
  });

  const { selectedModel, getModelOptions } = useModelSelection();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<Element>) => {
      e.preventDefault();

      if (!input.trim()) {
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
            throw new Error('Erro ao processar comando');
          }

          const data = await response.json();
          
          // Atualiza as mensagens com a resposta do comando
          setMessages([
            ...messages,
            { role: 'user', content: input, id: `user-${Date.now()}` },
            { role: 'assistant', content: data.content, id: `assistant-${Date.now()}` }
          ]);
          setInput('');
          return;
        }

        // Processa mensagens normais
        await chatSubmit(e as React.FormEvent<HTMLFormElement>, {
          data: modelOptions
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Erro ao enviar mensagem. Por favor, tente novamente.");
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
    setMessages
  };
} 
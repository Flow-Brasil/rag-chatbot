"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Message } from "ai";
import { LLMFactory } from "@/lib/llm/factory";
import { ModelType } from "@/lib/types/llm";
import { formatChatMessage } from "@/lib/utils/chat";

interface UseModelChatProps {
  modelType: ModelType;
  apiKey: string;
  onError?: (error: string) => void;
}

export function useModelChat({ 
  modelType, 
  apiKey,
  onError 
}: UseModelChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);

  // Memoize model creation to prevent infinite updates
  const model = useMemo(() => {
    try {
      if (!apiKey) return null;
      return LLMFactory.createModel(modelType, apiKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao inicializar o modelo";
      onError?.(errorMessage);
      return null;
    }
  }, [modelType, apiKey, onError]);

  // Update model ready state when model changes
  useEffect(() => {
    setIsModelReady(!!model);
    setError(null);
  }, [model]);

  const sendMessage = useCallback(async (content: string) => {
    if (!model || !isModelReady) {
      const errorMessage = "Modelo não está pronto. Verifique a API key e tente novamente.";
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Adiciona a mensagem do usuário
      const userMessage = formatChatMessage("user", content);
      setMessages(prev => [...prev, userMessage]);

      // Envia para o modelo
      const response = await model.invoke([...messages, userMessage]);

      if (response.error) {
        setError(response.error);
        onError?.(response.error);
        return;
      }

      if (!response.content) {
        throw new Error("Resposta vazia do modelo");
      }

      // Adiciona a resposta do assistente
      const assistantMessage = formatChatMessage("assistant", response.content);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar mensagem";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [model, messages, onError, isModelReady]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isModelReady
  };
} 
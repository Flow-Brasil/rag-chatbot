import { Message } from "ai";
import { useChat as useVercelChat } from "ai/react";
import { useCallback, useEffect, useState } from "react";
import { useModelSelection } from "../../hooks/useModelSelection";
import { toast } from "sonner";

export function useCustomChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    setInput,
    isLoading,
    stop,
  } = useVercelChat();

  const {
    selectedModel,
    geminiKey,
    handleModelClick: originalHandleModelClick,
    getModelOptions
  } = useModelSelection();

  // Função para lidar com a mudança de modelo
  const handleModelClick = useCallback((model: 'groq' | 'gemini') => {
    originalHandleModelClick(model);
    // Limpa o input ao trocar de modelo
    setInput('');
  }, [originalHandleModelClick, setInput]);

  // Função para lidar com o envio de mensagens
  const handleSubmit = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!input.trim()) return;

      const modelOptions = getModelOptions();
      const options = {
        data: {
          ...modelOptions,
          messages: messages // Inclui o histórico de mensagens
        }
      };

      try {
        await originalHandleSubmit(e, options);
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    },
    [input, originalHandleSubmit, getModelOptions, messages]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    stop,
    selectedModel,
    handleModelClick,
  };
} 
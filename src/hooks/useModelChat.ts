"use client";

import { useState, useEffect } from 'react';
import { ModelType, Message, LLMResponse } from '@/lib/types/llm';
import { LLMFactory } from '@/lib/llm/factory';
import { MediaFile } from '@/lib/types/media';

interface UseModelChatProps {
  modelType: ModelType;
  apiKey: string;
  onError?: (error: string) => void;
}

export function useModelChat({ modelType, apiKey, onError }: UseModelChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Carrega mensagens do localStorage ao iniciar
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
      }
    }
  }, []);

  // Salva mensagens no localStorage quando atualizadas
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async (content: string, files?: MediaFile[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Preparar conteúdo com mídia
      let messageContent = content;

      if (files && files.length > 0) {
        const mediaPromises = files.map(async (file) => {
          const reader = new FileReader();
          return new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(`[${file.type.toUpperCase()}]${base64}`);
            };
            reader.readAsDataURL(file.file);
          });
        });

        const mediaBase64 = await Promise.all(mediaPromises);
        messageContent += '\n' + mediaBase64.join('\n');
      }

      // Adiciona mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, userMessage]);

      // Cria o modelo usando a factory
      const model = LLMFactory.createModel(modelType, apiKey);

      // Envia a mensagem
      const response = await model.invoke([...messages, userMessage]);

      if (response.error) {
        throw new Error(response.error);
      }

      // Adiciona resposta do assistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setMediaFiles([]); // Limpa arquivos após envio
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setMediaFiles([]);
    localStorage.removeItem('chat_messages');
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    mediaFiles,
    setMediaFiles
  };
} 
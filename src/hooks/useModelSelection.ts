"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export type ModelType = 'gemini';

// Lê a chave de API do ambiente
const GEMINI_API_KEY = process.env['NEXT_PUBLIC_GEMINI_API_KEY'] || '';

export function useModelSelection() {
  const [selectedModel] = useState<ModelType>('gemini');
  const [geminiKey, setGeminiKey] = useState(GEMINI_API_KEY);
  const [showGeminiEdit, setShowGeminiEdit] = useState(false);

  // Carrega as configurações do localStorage após a montagem do componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGeminiKey = localStorage.getItem('geminiKey');
      if (storedGeminiKey) setGeminiKey(storedGeminiKey);
    }
  }, []);

  const handleGeminiKeyChange = useCallback((key: string) => {
    setGeminiKey(key);
  }, []);

  const handleGeminiKeyConfirm = useCallback(() => {
    if (geminiKey.length < 10) {
      toast.error('Chave API Gemini inválida');
      return;
    }
    localStorage.setItem('geminiKey', geminiKey);
    setShowGeminiEdit(false);
    toast.success('Chave API Gemini salva com sucesso');
  }, [geminiKey]);

  const toggleGeminiEdit = useCallback(() => {
    setShowGeminiEdit(prev => !prev);
  }, []);

  const getModelOptions = useCallback(() => {
    return {
      model: selectedModel,
      geminiKey
    } as Record<string, string>;
  }, [selectedModel, geminiKey]);

  return {
    selectedModel,
    geminiKey,
    showGeminiEdit,
    handleGeminiKeyChange,
    handleGeminiKeyConfirm,
    toggleGeminiEdit,
    getModelOptions
  };
} 
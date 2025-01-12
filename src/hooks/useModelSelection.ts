"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export type ModelType = 'groq' | 'gemini';

// Lê as chaves de API das variáveis de ambiente
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('groq');
  const [geminiKey, setGeminiKey] = useState(GEMINI_API_KEY);
  const [groqKey, setGroqKey] = useState(GROQ_API_KEY);
  const [showGeminiEdit, setShowGeminiEdit] = useState(false);
  const [showGroqEdit, setShowGroqEdit] = useState(false);

  // Carrega as configurações do localStorage após a montagem do componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedModel = localStorage.getItem('selectedModel') as ModelType;
      const storedGeminiKey = localStorage.getItem('geminiKey');
      const storedGroqKey = localStorage.getItem('groqKey');

      if (storedModel) setSelectedModel(storedModel);
      if (storedGeminiKey) setGeminiKey(storedGeminiKey);
      if (storedGroqKey) setGroqKey(storedGroqKey);
    }
  }, []);

  const handleGeminiKeyChange = useCallback((key: string) => {
    setGeminiKey(key);
  }, []);

  const handleGroqKeyChange = useCallback((key: string) => {
    setGroqKey(key);
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

  const handleGroqKeyConfirm = useCallback(() => {
    if (groqKey.length < 10) {
      toast.error('Chave API Groq inválida');
      return;
    }
    localStorage.setItem('groqKey', groqKey);
    setShowGroqEdit(false);
    toast.success('Chave API Groq salva com sucesso');
  }, [groqKey]);

  const toggleGeminiEdit = useCallback(() => {
    setShowGeminiEdit(prev => !prev);
  }, []);

  const toggleGroqEdit = useCallback(() => {
    setShowGroqEdit(prev => !prev);
  }, []);

  const handleModelClick = useCallback((model: ModelType) => {
    setSelectedModel(model);
    localStorage.setItem('selectedModel', model);
    toast.success(`Modelo ${model} ativado`);
  }, []);

  const getModelOptions = useCallback(() => {
    return {
      model: selectedModel,
      ...(selectedModel === 'gemini' ? { geminiKey } : { groqKey })
    } as Record<string, string>;
  }, [selectedModel, geminiKey, groqKey]);

  return {
    selectedModel,
    geminiKey,
    groqKey,
    showGeminiEdit,
    showGroqEdit,
    handleGeminiKeyChange,
    handleGroqKeyChange,
    handleGeminiKeyConfirm,
    handleGroqKeyConfirm,
    toggleGeminiEdit,
    toggleGroqEdit,
    handleModelClick,
    getModelOptions
  };
} 
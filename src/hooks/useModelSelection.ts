import { useState, useEffect, useCallback } from 'react';
import { ModelType } from '@/lib/types/llm';
import { toast } from 'sonner';

// Valores padrão das API keys
const DEFAULT_GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCDaK960WJ3_rWHTN2SzLaSKz20oekflCE";
const DEFAULT_GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "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";
const DEFAULT_RAGIE_KEY = process.env.NEXT_PUBLIC_RAGIE_API_KEY || "tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA";

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');
  const [geminiKey, setGeminiKey] = useState(DEFAULT_GEMINI_KEY);
  const [groqKey, setGroqKey] = useState(DEFAULT_GROQ_KEY);
  const [ragieKey, setRagieKey] = useState(DEFAULT_RAGIE_KEY);

  // Carrega as configurações do localStorage após a montagem do componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedModel = localStorage.getItem('selectedModel') as ModelType;
      const storedGeminiKey = localStorage.getItem('gemini_api_key');
      const storedGroqKey = localStorage.getItem('groq_api_key');
      const storedRagieKey = localStorage.getItem('ragie_api_key');

      if (storedModel) setSelectedModel(storedModel);
      if (storedGeminiKey) setGeminiKey(storedGeminiKey);
      if (storedGroqKey) setGroqKey(storedGroqKey);
      if (storedRagieKey) setRagieKey(storedRagieKey);
    }
  }, []);

  const handleModelClick = useCallback((model: ModelType) => {
    setSelectedModel(model);
    localStorage.setItem('selectedModel', model);
    toast.success(`Modelo ${model} ativado`);
  }, []);

  const getModelOptions = useCallback(() => {
    const apiKey = selectedModel === 'gemini' ? geminiKey : groqKey;
    return {
      model: selectedModel,
      apiKey,
      ragieKey
    };
  }, [selectedModel, geminiKey, groqKey, ragieKey]);

  return {
    selectedModel,
    geminiKey,
    groqKey,
    ragieKey,
    handleModelClick,
    getModelOptions
  };
} 
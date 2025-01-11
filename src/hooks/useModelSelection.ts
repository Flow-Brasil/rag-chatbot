import { useState } from 'react';

type ModelType = 'groq' | 'gemini';

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('groq');

  const handleModelClick = (model: ModelType) => {
    setSelectedModel(model);
  };

  return {
    selectedModel,
    handleModelClick,
  };
} 
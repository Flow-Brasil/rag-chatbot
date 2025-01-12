"use client";

import { Edit2 } from "lucide-react";
import { useModelSelection } from "@/hooks/useModelSelection";

export function GeminiConfig() {
  const {
    geminiKey,
    showGeminiEdit,
    handleGeminiKeyChange,
    handleGeminiKeyConfirm,
    toggleGeminiEdit,
  } = useModelSelection();

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={toggleGeminiEdit}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        title="Editar chave API"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      
      {showGeminiEdit && (
        <div className="flex items-center space-x-2">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => handleGeminiKeyChange(e.target.value)}
            placeholder="Insira sua chave API Gemini"
            className="px-4 py-2 rounded-lg border"
          />
          <button
            type="button"
            onClick={handleGeminiKeyConfirm}
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
} 
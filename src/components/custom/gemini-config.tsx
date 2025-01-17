"use client";

import { Edit2 } from "lucide-react";
import { useModelSelection } from "@/app/chat/geral/_hooks/useModelSelection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Button
        type="button"
        onClick={toggleGeminiEdit}
        variant="ghost"
        size="icon"
        className="hover:bg-muted"
        aria-label="Editar chave API"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
      
      {showGeminiEdit && (
        <div className="flex items-center space-x-2">
          <Input
            type="password"
            value={geminiKey}
            onChange={(e) => handleGeminiKeyChange(e.target.value)}
            placeholder="Insira sua chave API Gemini"
            aria-label="Chave API Gemini"
          />
          <Button
            type="button"
            onClick={handleGeminiKeyConfirm}
            variant="default"
            className="bg-green-500 hover:bg-green-600"
          >
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
} 
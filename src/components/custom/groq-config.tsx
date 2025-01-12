"use client";

import { Edit2 } from "lucide-react";
import { useModelSelection } from "@/hooks/useModelSelection";

export function GroqConfig() {
  const {
    groqKey,
    showGroqEdit,
    handleGroqKeyChange,
    handleGroqKeyConfirm,
    toggleGroqEdit
  } = useModelSelection();

  return (
    <div className="flex items-center gap-2">
      {showGroqEdit ? (
        <>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => handleGroqKeyChange(e.target.value)}
            placeholder="Insira sua chave API Groq"
            className="rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGroqKeyConfirm}
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Salvar
          </button>
        </>
      ) : (
        <button
          onClick={toggleGroqEdit}
          className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 
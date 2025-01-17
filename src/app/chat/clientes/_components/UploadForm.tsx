'use client';

import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Document, PendingUpload } from "./types";

interface UploadFormProps {
  input: string;
  loading: boolean;
  isUploadMode: boolean;
  uploadType: 'document' | 'chat' | null;
  pendingUpload: PendingUpload | null;
  selectedDocuments: Document[];
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const UploadForm = forwardRef<{ focus: () => void }, UploadFormProps>(({
  input,
  loading,
  isUploadMode,
  uploadType,
  pendingUpload,
  selectedDocuments,
  onInputChange,
  onSubmit
}, ref) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Se pressionar Enter sem Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const getPlaceholder = () => {
    if (!isUploadMode) return "Digite sua mensagem...";
    
    if (pendingUpload?.awaitingNameConfirmation) {
      return "Digite 'confirmar' para usar o nome sugerido ou digite um novo nome...";
    }
    
    if (pendingUpload?.awaitingMetadata) {
      return "Aguardando seleção de metadados...";
    }
    
    if (uploadType === 'document') {
      return "Cole aqui o texto que você deseja salvar como documento...";
    }
    
    return "Cole aqui a conversa que você deseja salvar...";
  };

  const isDisabled = () => {
    if (loading) return true;
    if (!isUploadMode && selectedDocuments.length === 0) return true;
    if (pendingUpload?.awaitingMetadata) return true;
    return false;
  };

  const getButtonText = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {pendingUpload?.awaitingNameConfirmation ? "Salvando..." : "Enviando..."}
        </div>
      );
    }

    if (pendingUpload?.awaitingNameConfirmation) {
      return "Confirmar Nome";
    }

    if (pendingUpload?.awaitingMetadata) {
      return "Aguardando Metadados";
    }

    return "Enviar";
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4">
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled()}
          placeholder={getPlaceholder()}
          className={`flex-1 p-2 border rounded resize-none h-[100px] transition-colors
            ${isDisabled() ? 'bg-gray-100' : 'bg-white'}
            ${pendingUpload?.awaitingMetadata ? 'opacity-50' : 'opacity-100'}
          `}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim() || (selectedDocuments.length === 0 && !isUploadMode) || pendingUpload?.awaitingMetadata}
          className={`px-4 min-w-[100px] transition-colors
            ${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}
            ${pendingUpload?.awaitingMetadata ? 'opacity-50' : 'opacity-100'}
          `}
        >
          {getButtonText()}
        </Button>
      </div>
    </form>
  );
}); 
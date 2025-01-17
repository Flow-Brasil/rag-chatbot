'use client';

import { Button } from "@/components/ui/button";
import { FileIcon, XIcon, RotateCwIcon } from "lucide-react";
import type { Document } from "./types";

interface DocumentHeaderProps {
  isUploadMode: boolean;
  selectedDocuments: Document[];
  onClearChat: () => void;
  onClearSelection: () => void;
}

export function DocumentHeader({
  isUploadMode,
  selectedDocuments,
  onClearChat,
  onClearSelection
}: DocumentHeaderProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <FileIcon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">
          Documentos Selecionados
        </h2>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onClearChat}
          className="flex items-center gap-2"
        >
          <XIcon className="w-4 h-4" />
          Limpar chat
        </Button>
        <Button
          variant="outline"
          onClick={handleReload}
          className="flex items-center gap-2"
          title="Recarregar página"
        >
          <RotateCwIcon className="w-4 h-4" />
        </Button>
        {selectedDocuments.length > 0 && (
          <Button
            variant="outline"
            onClick={onClearSelection}
            className="flex items-center gap-2"
          >
            <XIcon className="w-4 h-4" />
            Limpar seleção
          </Button>
        )}
      </div>
    </div>
  );
} 
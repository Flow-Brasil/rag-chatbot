"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createRagieClient } from '@/lib/ragie-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

interface Props {
  selectedModel?: string;
  onUpload?: (documentId: string) => void;
}

export function MultimodalInput({ selectedModel, onUpload }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      if (!selectedFile) {
        throw new Error('Nenhum arquivo selecionado');
      }

      const apiKey = process.env['NEXT_PUBLIC_RAGIE_API_KEY'];
      if (!apiKey) {
        throw new Error('API key não configurada');
      }

      const client = createRagieClient(apiKey);
      const response = await client.uploadDocument(selectedFile, {
        scope: selectedModel || 'default'
      });

      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      setShowUploadModal(false);
      onUpload?.(response.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar arquivo';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.json,.md"
            disabled={isUploading}
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isUploading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createRagieClient } from '@/lib/ragie-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { FileIcon } from "./icons";

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json',
  'text/markdown',
  'text/x-markdown',
  'application/x-markdown'
];

interface Props {
  onStatusUpdate?: (message: string) => void;
}

const convertToMarkdown = (file: File): File => {
  if (file.name.endsWith('.md') && !ALLOWED_TYPES.includes(file.type)) {
    console.log('🔄 Convertendo tipo do arquivo Markdown:', {
      tipoOriginal: file.type,
      novotipo: 'text/markdown'
    });
    return new File([file], file.name, { type: 'text/markdown' });
  }
  return file;
};

export function DocumentUpload({ onStatusUpdate }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const convertedFile = convertToMarkdown(file);
      if (!ALLOWED_TYPES.includes(convertedFile.type)) {
        setError('Tipo de arquivo não suportado');
        return;
      }
      setSelectedFile(convertedFile);
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
        scope: selectedFile.name.replace(/\.[^/.]+$/, '')
      });

      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      onStatusUpdate?.('Documento enviado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar arquivo';
      setError(message);
      toast.error(message);
      onStatusUpdate?.(`Erro: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-blue-400 bg-gray-50">
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Selecione um arquivo</h3>
          <p className="text-xs text-gray-500">PDF, DOCX, TXT, JSON ou MD</p>
        </div>
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt,.json,.md"
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center text-blue-500 hover:text-blue-600 transition-colors"
        >
          {selectedFile ? (
            <div className="text-center">
              <FileIcon size={32} />
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <>
              <FileIcon size={32} />
              <p>Clique para selecionar um arquivo</p>
            </>
          )}
        </label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {selectedFile && (
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
        >
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      )}
    </form>
  );
} 
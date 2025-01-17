'use client';

import { useState, useEffect } from 'react';

interface PendingUpload {
  content: any;
  suggestedName: string;
  awaitingNameConfirmation: boolean;
  metadata?: Record<string, any>;
  awaitingMetadata?: boolean;
}

interface UseUploadReturn {
  pendingUpload: PendingUpload | null;
  isUploadMode: boolean;
  uploadType: 'document' | 'chat' | null;
  startUploadMode: (type: 'document' | 'chat') => void;
  exitUploadMode: () => void;
  setPendingUpload: (upload: PendingUpload | null) => void;
  handleNameSelect: (name: string) => void;
  handleConfirmName: (metadata: Record<string, string>) => Promise<void>;
  validateJSON: (text: string) => { isValid: boolean; content?: any; error?: string };
  generateDefaultFileName: (content: any) => string[];
}

const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'text/plain',
  'text/markdown'
];

export function useUpload(
  selectedCliente: string | null,
  onUploadComplete: () => void,
  onError: (message: string) => void
): UseUploadReturn {
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [uploadType, setUploadType] = useState<'document' | 'chat' | null>(null);

  const startUploadMode = (type: 'document' | 'chat') => {
    if (!selectedCliente) {
      onError("Por favor, selecione um cliente primeiro para continuar.");
      return;
    }
    
    setIsUploadMode(true);
    setUploadType(type);
    setPendingUpload(null);
  };

  const exitUploadMode = () => {
    setIsUploadMode(false);
    setUploadType(null);
    setPendingUpload(null);
  };

  useEffect(() => {
    exitUploadMode();
  }, [selectedCliente]);

  const handleNameSelect = (fileName: string) => {
    if (!pendingUpload) return;
    setPendingUpload({
      ...pendingUpload,
      suggestedName: fileName
    });
  };

  const handleConfirmName = async (metadata: Record<string, string>) => {
    if (!pendingUpload || !selectedCliente) return;

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pendingUpload.content,
          fileName: pendingUpload.suggestedName,
          metadata: {
            ...metadata,
            cliente: selectedCliente,
            uploadedAt: new Date().toISOString(),
            contentType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao salvar o documento");
      }

      // Limpa o upload pendente e recarrega os documentos
      setPendingUpload(null);
      setIsUploadMode(false);
      setUploadType(null);
      onUploadComplete();

    } catch (error) {
      onError(error instanceof Error ? error.message : "Erro ao salvar o documento");
    }
  };

  const validateJSON = (input: string): { isValid: boolean; content?: any; error?: string } => {
    try {
      // Tenta fazer o parse do JSON
      const parsed = JSON.parse(input);
      
      // Validações adicionais do conteúdo
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          isValid: false,
          error: "O conteúdo deve ser um objeto JSON válido"
        };
      }

      // Se for um objeto vazio
      if (Object.keys(parsed).length === 0) {
        return {
          isValid: false,
          error: "O documento não pode estar vazio"
        };
      }

      return {
        isValid: true,
        content: parsed
      };
    } catch {
      // Se falhar o parse, trata como texto simples
      if (!input.trim()) {
        return {
          isValid: false,
          error: "O conteúdo não pode estar vazio"
        };
      }

      return {
        isValid: true,
        content: { text: input }
      };
    }
  };

  const generateDefaultFileName = (content: any): string[] => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    const time = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Tenta extrair informações relevantes do conteúdo
    let prefix = 'documento';
    let suggestions = [];

    // Se for um BDE, usa o dia da semana
    if (content.dia_da_semana) {
      suggestions.push(`BDE-${content.dia_da_semana}-${timestamp}`);
    }

    // Se tiver tipo definido, usa como prefixo
    if (content.tipo) {
      suggestions.push(`${content.tipo}-${timestamp}`);
    }

    // Se tiver uma saudação, tenta extrair informações dela
    if (content.saudacao) {
      const saudacaoText = content.saudacao.toLowerCase();
      if (saudacaoText.includes('bom dia')) {
        suggestions.push(`BDE-${timestamp}-manha`);
      } else if (saudacaoText.includes('boa tarde')) {
        suggestions.push(`BDE-${timestamp}-tarde`);
      }
    }

    // Se tiver conteúdo de introdução
    if (content.introducao) {
      const introText = content.introducao.toLowerCase();
      if (introText.includes('estratégico') || introText.includes('estrategico')) {
        suggestions.push(`BDE-${timestamp}`);
      } else if (introText.includes('relatório') || introText.includes('relatorio')) {
        suggestions.push(`relatorio-${timestamp}`);
      }
    }

    // Adiciona sugestões genéricas se não tiver nenhuma específica
    if (suggestions.length === 0) {
      suggestions = [
        `${prefix}-${timestamp}`,
        `texto-${timestamp}`,
        `documento-${timestamp}`
      ];
    }

    // Adiciona a extensão .json a todas as sugestões
    return suggestions.map(name => `${name}.json`);
  };

  return {
    pendingUpload,
    isUploadMode,
    uploadType,
    startUploadMode,
    exitUploadMode,
    setPendingUpload,
    handleNameSelect,
    handleConfirmName,
    validateJSON,
    generateDefaultFileName
  };
} 
"use client";

import { useState, useCallback } from 'react';
import { RagieService } from '@/lib/services/ragie';
import { RagieDocument } from '@/lib/types/ragie';

export function useRagieDocuments(apiKey: string) {
  const [documents, setDocuments] = useState<RagieDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ragie = new RagieService(apiKey);

  // Upload de arquivo
  const uploadDocument = useCallback(async (file: File, metadata: Record<string, unknown> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const document = await ragie.uploadDocument(file, metadata);
      setDocuments(prev => [...prev, document]);
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do documento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ragie]);

  // Upload de conteúdo raw
  const uploadRawContent = useCallback(async (content: string, metadata: Record<string, unknown> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const document = await ragie.uploadRawContent(content, metadata);
      setDocuments(prev => [...prev, document]);
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do conteúdo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ragie]);

  // Deletar documento
  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await ragie.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar documento');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ragie]);

  // Atualizar metadados
  const updateMetadata = useCallback(async (documentId: string, metadata: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await ragie.updateDocumentMetadata(documentId, metadata);
      setDocuments(prev => prev.map(doc => doc.id === documentId ? updated : doc));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar metadados');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ragie]);

  // Verificar status do documento
  const checkStatus = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const document = await ragie.getDocument(documentId);
      setDocuments(prev => prev.map(doc => doc.id === documentId ? document : doc));
      return document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [ragie]);

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    uploadRawContent,
    deleteDocument,
    updateMetadata,
    checkStatus
  };
} 
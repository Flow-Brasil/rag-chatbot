import { NextResponse } from 'next/server';

const RAGIE_API_KEY = process.env.RAGIE_API_KEY;

export interface Document {
  id: string;
  name: string;
  status: string;
  version: number;
  created_at: string;
  chunk_count: number;
  metadata: {
    scope?: string;
  };
}

export interface DocumentListResponse {
  documents: Document[];
}

export interface ScoredChunk {
  text: string;
  score?: number;
}

export interface SearchResponse {
  scored_chunks: ScoredChunk[];
}

export interface DocumentContentResponse {
  content: string;
}

export interface DocumentStatus {
  status: 'pending' | 'processing' | 'ready' | 'failed';
  error?: string;
}

export interface UploadResponse {
  documentId: string;
  status: string;
  message?: string;
}

export interface UploadResult {
  file: string;
  success: boolean;
  documentId?: string;
  error?: string;
}

export async function searchDocuments(query: string, documentId?: string): Promise<SearchResponse> {
  const response = await fetch('https://api.ragie.ai/retrievals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      rerank: true,
      ...(documentId && { filter: { document_id: documentId } })
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na busca: ${response.statusText}`);
  }

  return response.json();
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const response = await fetch('https://api.ragie.ai/documents', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao listar documentos: ${response.statusText}`);
  }

  return response.json();
}

export async function getDocumentContent(documentId: string): Promise<DocumentContentResponse> {
  const response = await fetch(`https://api.ragie.ai/documents/${documentId}/content`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao obter conteúdo: ${response.statusText}`);
  }

  return response.json();
}

export async function checkDocumentStatus(documentId: string): Promise<DocumentStatus> {
  const response = await fetch(`https://api.ragie.ai/documents/${documentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao verificar status: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    status: data.status,
    error: data.error
  };
}

export async function uploadDocument(
  file: File | Blob,
  metadata?: { scope?: string; [key: string]: any }
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch('https://api.ragie.ai/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Erro no upload: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    documentId: data.id,
    status: data.status,
    message: data.message
  };
}

export async function uploadDocuments(
  files: (File | Blob)[],
  metadata?: { scope?: string; [key: string]: any }
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  await Promise.all(
    files.map(async (file) => {
      try {
        const result = await uploadDocument(file, metadata);
        results.push({
          file: file instanceof File ? file.name : 'blob',
          success: true,
          documentId: result.documentId
        });
      } catch (error) {
        results.push({
          file: file instanceof File ? file.name : 'blob',
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    })
  );

  return results;
}

// Outras funções para interagir com a API Ragie... 
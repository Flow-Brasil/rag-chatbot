import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.ragie.ai';
const TIMEOUT = 5000;

interface RagieResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface Document {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
  metadata: Record<string, any>;
}

interface ScoredChunk {
  text: string;
  score: number;
  metadata: {
    source: string;
    [key: string]: any;
  };
}

interface SearchResult {
  scored_chunks: ScoredChunk[];
}

interface DocumentContent {
  content: string;
  metadata?: {
    title?: string;
    created_at?: string;
    [key: string]: any;
  };
}

// Função auxiliar para validar API key
function validateApiKey(): string {
  const apiKey = process.env.RAGIE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key não configurada');
  }
  
  if (!apiKey.startsWith('tnt_') || apiKey.length < 20) {
    throw new Error('API key inválida');
  }
  
  return apiKey;
}

// Função auxiliar para fazer requisições com timeout
async function fetchWithTimeout<T>(
  url: string, 
  options: RequestInit = {}
): Promise<RagieResponse<T>> {
  try {
    // Valida a API key antes de fazer a requisição
    const apiKey = validateApiKey();

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      return {
        ok: false,
        error: response.statusText || 'Erro na requisição',
        status: response.status,
      };
    }

    const data = await response.json();

    if (!data) {
      return {
        ok: false,
        error: 'Resposta inválida do servidor',
      };
    }

    return {
      ok: true,
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          ok: false,
          error: 'Timeout na conexão',
        };
      }
      if (error.message.includes('API key')) {
        return {
          ok: false,
          error: error.message,
        };
      }
      return {
        ok: false,
        error: 'Erro de conexão',
      };
    }
    return {
      ok: false,
      error: 'Erro desconhecido',
    };
  }
}

// Lista todos os documentos
export async function listDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetchWithTimeout<{ documents: Document[] }>(`${BASE_URL}/documents`);
  
  if (!response.ok) {
    throw new Error(response.error);
  }
  
  if (!response.data?.documents) {
    throw new Error('Resposta inválida do servidor');
  }
  
  return response.data;
}

// Busca documentos
export async function searchDocuments(
  query: string,
  documentId?: string
): Promise<SearchResult> {
  if (!query || query.length < 2) {
    throw new Error('Query muito curta');
  }

  const body: any = {
    query,
    rerank: true,
  };

  if (documentId) {
    body.filter = {
      document_id: documentId,
    };
  }

  const response = await fetchWithTimeout<SearchResult>(`${BASE_URL}/retrievals`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(response.error);
  }

  if (!response.data?.scored_chunks) {
    throw new Error('Resposta inválida do servidor');
  }

  return response.data;
}

// Obtém o conteúdo de um documento
export async function getDocumentContent(documentId: string): Promise<DocumentContent> {
  if (!documentId) {
    throw new Error('ID do documento inválido');
  }

  const response = await fetchWithTimeout<DocumentContent>(
    `${BASE_URL}/documents/${documentId}/content`
  );

  if (!response.ok) {
    throw new Error(response.error);
  }

  if (!response.data?.content) {
    throw new Error('Resposta inválida do servidor');
  }

  return response.data;
}

// Verifica o status da API
export async function checkApiStatus(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout<{ status: string }>(`${BASE_URL}/status`);
    return response.ok && response.data?.status === 'operational';
  } catch {
    return false;
  }
}

// Outras funções para interagir com a API Ragie... 
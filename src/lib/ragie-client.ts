import { RagieDocument, RetrievalResponse, UploadResponse } from "./types/ragie";

const RAGIE_API_URL = process.env.NEXT_PUBLIC_RAGIE_API_URL?.replace(/\/$/, '') || "https://api.ragie.ai";
const RAGIE_API_KEY = process.env.NEXT_PUBLIC_RAGIE_API_KEY || "";

interface RagieListResponse {
  pagination: {
    next_cursor: string | null;
  };
  documents: Array<{
    id: string;
    created_at: string;
    updated_at: string;
    status: string;
    name: string;
    metadata: Record<string, any>;
    partition: string;
    chunk_count: number;
    external_id: string | null;
  }>;
}

export class RagieClient {
  private apiKey: string;

  constructor(apiKey: string = RAGIE_API_KEY) {
    if (!apiKey) {
      throw new Error('API key do Ragie não configurada');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      if (!this.apiKey) {
        throw new Error('API key do Ragie não configurada');
      }

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      };

      // Só adiciona Content-Type se não for FormData
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const url = `${RAGIE_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      console.log('📡 Enviando requisição para API:', {
        url,
        method: options.method || 'GET',
        headers: {
          ...headers,
          Authorization: 'Bearer [REDACTED]', // Não loga a chave
        },
        body: options.body instanceof FormData ? '[FormData]' : options.body,
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = response.statusText;
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          // Se não conseguir parsear o JSON, usa o texto da resposta
          errorMessage = errorText || errorMessage;
        }
        console.error('❌ Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          url,
          method: options.method || 'GET',
        });
        throw new Error(`Erro na API do Ragie (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ Resposta da API:', {
        url,
        method: options.method || 'GET',
        data
      });
      return data;
    } catch (error) {
      console.error('❌ Erro na requisição:', {
        error,
        endpoint,
        method: options.method || 'GET',
        url: `${RAGIE_API_URL}${endpoint}`,
      });
      if (error instanceof Error) {
        throw new Error(`Falha ao acessar API do Ragie: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao acessar a API do Ragie');
    }
  }

  async listDocuments(): Promise<RagieDocument[]> {
    try {
      console.log('📋 Listando documentos...');
      const response = await this.request<RagieListResponse>("/documents");
      console.log('📚 Documentos encontrados:', response.documents.length);
      
      // Converte o formato da API para o formato esperado pela aplicação
      return response.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        metadata: doc.metadata,
        status: doc.status as 'processing' | 'ready' | 'failed',
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      }));
    } catch (error) {
      console.error('❌ Erro ao listar documentos:', error);
      throw error;
    }
  }

  async uploadDocument(file: File, metadata: Record<string, any> = {}): Promise<UploadResponse> {
    console.log('🚀 Iniciando upload:', {
      arquivo: file.name,
      tipo: file.type,
      tamanho: `${(file.size / 1024).toFixed(2)} KB`,
      metadata
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("mode", "fast");

    try {
      // Verifica se o arquivo é válido
      if (!file.size) {
        throw new Error('Arquivo vazio');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Arquivo muito grande. Limite de 10MB');
      }

      const response = await this.request<UploadResponse>("/documents", {
        method: "POST",
        body: formData,
      });

      console.log('✅ Upload concluído:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
  }

  async uploadRawDocument(content: string, metadata: Record<string, any> = {}): Promise<UploadResponse> {
    console.log('📝 Iniciando upload de conteúdo raw:', {
      tamanho: `${(content.length / 1024).toFixed(2)} KB`,
      metadata
    });

    try {
      const response = await this.request<UploadResponse>("/documents/raw", {
        method: "POST",
        body: JSON.stringify({
          content,
          metadata,
          mode: "fast"
        }),
      });

      console.log('✅ Upload raw concluído:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro no upload raw:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, filter: Record<string, any> = {}): Promise<RetrievalResponse> {
    console.log('🔍 Iniciando busca:', { query, filter });

    try {
      const response = await this.request<RetrievalResponse>("/retrievals", {
        method: "POST",
        body: JSON.stringify({
          query,
          filter,
          rerank: true,
        }),
      });

      console.log('✅ Busca concluída:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      throw error;
    }
  }

  async checkDocumentStatus(id: string): Promise<RagieDocument> {
    console.log('📋 Verificando status do documento:', id);

    try {
      const response = await this.request<RagieDocument>(`/documents/${id}`);
      console.log('✅ Status verificado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      throw error;
    }
  }

  async deleteDocument(id: string) {
    console.log('🗑️ Deletando documento:', id);

    try {
      const response = await this.request(`/documents/${id}`, {
        method: "DELETE",
      });
      console.log('✅ Documento deletado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao deletar documento:', error);
      throw error;
    }
  }

  async updateMetadata(id: string, metadata: Record<string, any>) {
    console.log('📝 Atualizando metadata:', { id, metadata });

    try {
      const response = await this.request(`/documents/${id}/metadata`, {
        method: "PATCH",
        body: JSON.stringify({ metadata }),
      });
      console.log('✅ Metadata atualizada:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao atualizar metadata:', error);
      throw error;
    }
  }

  async getDocument(id: string): Promise<RagieDocument> {
    try {
      console.log('🔍 Buscando documento:', id);
      const response = await this.request(`/documents/${id}`) as RagieDocument;
      console.log('📄 Documento encontrado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar documento:', error);
      throw error;
    }
  }
}

export function createRagieClient(apiKey: string = RAGIE_API_KEY) {
  return new RagieClient(apiKey);
} 
import { RagieDocument, RetrievalResponse, UploadResponse } from "./types/ragie";

const RAGIE_API_URL = process.env.NEXT_PUBLIC_RAGIE_API_URL || "https://api.ragie.tech";

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

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error('❌ API key não fornecida');
      throw new Error('API key do Ragie não configurada');
    }
    console.log('🔑 API key configurada:', apiKey.substring(0, 8) + '...');
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_RAGIE_API_KEY;
      if (!apiKey) {
        throw new Error('API key não configurada');
      }

      console.log('🔑 Usando API key:', apiKey.substring(0, 8) + '...');
      console.log('🌐 URL:', `${RAGIE_API_URL}${endpoint}`);
      console.log('📡 Método:', options.method || 'GET');

      const headers = new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      });

      // Adiciona Content-Type apenas se não for FormData
      if (!(options.body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
      }

      const response = await fetch(`${RAGIE_API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log('📥 Status:', response.status);
      console.log('📝 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erro na API do Ragie: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as T;
      console.log('✅ Resposta:', data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Erro na requisição:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('❌ Erro desconhecido:', error);
      }
      throw error;
    }
  }

  async listDocuments(): Promise<RagieDocument[]> {
    try {
      console.log('📚 Listando documentos...');
      const response = await this.request<{ documents: RagieDocument[] }>('/documents');
      const documents = response.documents;
      console.log(`📋 ${documents.length} documentos encontrados`);
      return documents;
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

export function createRagieClient(apiKey: string) {
  return new RagieClient(apiKey);
} 
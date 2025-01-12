import { Ragie } from 'ragie';
import type { RagieMetadata, CreateDocumentRawParams, PatchDocumentMetadataRequest } from './types/ragie';

const RAGIE_API_KEY = process.env['NEXT_PUBLIC_RAGIE_API_KEY'] || '';

export function createRagieClient(apiKey: string = RAGIE_API_KEY) {
  if (!apiKey) {
    console.error('❌ API key não fornecida');
    throw new Error('API key do Ragie não configurada');
  }
  console.log('🔑 API key configurada:', apiKey.substring(0, 8) + '...');
  return new Ragie({
    auth: apiKey
  });
}

export class RagieClient {
  private client: Ragie;

  constructor(apiKey: string) {
    this.client = createRagieClient(apiKey);
  }

  async listDocuments() {
    try {
      console.log('📚 Listando documentos...');
      const response = await this.client.documents.list({});
      const firstPage = await response.next();
      const documents = firstPage ? [firstPage] : [];
      console.log(`📋 ${documents.length} documentos encontrados`);
      return documents;
    } catch (error) {
      console.error('❌ Erro ao listar documentos:', error);
      throw error;
    }
  }

  async uploadDocument(file: File, metadata: Record<string, any> = {}) {
    console.log('🚀 Iniciando upload:', {
      arquivo: file.name,
      tipo: file.type,
      tamanho: `${(file.size / 1024).toFixed(2)} KB`,
      metadata
    });

    try {
      if (!file.size) {
        throw new Error('Arquivo vazio');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Limite de 10MB');
      }

      const formattedMetadata: RagieMetadata = {};
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
          formattedMetadata[key] = value;
        } else {
          formattedMetadata[key] = String(value);
        }
      });

      const response = await this.client.documents.create({
        file,
        metadata: formattedMetadata
      });
      
      console.log('✅ Upload concluído:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
  }

  async uploadRawDocument(content: string, metadata: Record<string, any> = {}) {
    console.log('📝 Iniciando upload de conteúdo raw:', {
      tamanho: `${(content.length / 1024).toFixed(2)} KB`,
      metadata
    });

    try {
      const formattedMetadata: RagieMetadata = {};
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
          formattedMetadata[key] = value;
        } else {
          formattedMetadata[key] = String(value);
        }
      });

      const params: CreateDocumentRawParams = {
        data: {
          content,
          metadata: formattedMetadata
        }
      };

      const response = await this.client.documents.createRaw(params);
      console.log('✅ Upload raw concluído:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro no upload raw:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, filter: Record<string, any> = {}) {
    console.log('🔍 Iniciando busca:', { query, filter });

    try {
      const formattedFilter: Record<string, any> = {};
      Object.entries(filter).forEach(([key, value]) => {
        formattedFilter[key] = value;
      });

      const response = await this.client.retrievals.retrieve({
        query,
        filter: formattedFilter
      });
      console.log('✅ Busca concluída:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      throw error;
    }
  }

  async checkDocumentStatus(id: string) {
    console.log('📋 Verificando status do documento:', id);

    try {
      const response = await this.client.documents.get({
        documentId: id
      });
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
      const response = await this.client.documents.delete({
        documentId: id
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
      const formattedMetadata: RagieMetadata = {};
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
          formattedMetadata[key] = value;
        } else {
          formattedMetadata[key] = String(value);
        }
      });

      const params: PatchDocumentMetadataRequest = {
        documentId: id,
        patchDocumentMetadataParams: {
          metadata: formattedMetadata
        }
      };

      const response = await this.client.documents.patchMetadata(params);
      console.log('✅ Metadata atualizada:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao atualizar metadata:', error);
      throw error;
    }
  }

  async getDocument(id: string) {
    try {
      console.log('🔍 Buscando documento:', id);
      const response = await this.client.documents.get({
        documentId: id
      });
      console.log('📄 Documento encontrado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar documento:', error);
      throw error;
    }
  }
} 
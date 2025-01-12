interface RagieConfig {
  apiKey: string;
  baseUrl: string;
}

interface RagieDocument {
  id: string;
  name: string;
  status: string;
  chunk_count?: number;
  metadata?: {
    scope?: string;
    [key: string]: any;
  };
}

interface RagieChunk {
  text: string;
  score: number;
  document_name?: string;
  document_id?: string;
}

interface RagieResponse {
  scored_chunks: RagieChunk[];
}

export class RagieClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: RagieConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`Ragie API error: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  async listDocuments(): Promise<{ documents: RagieDocument[] }> {
    return this.request('/documents');
  }

  async getDocument(documentId: string): Promise<RagieDocument> {
    return this.request(`/documents/${documentId}`);
  }

  async getContext(params: {
    query: string;
    rerank?: boolean;
    filter?: {
      scope?: string;
      document_id?: string;
    };
  }): Promise<RagieResponse> {
    return this.request('/retrievals', {
      method: 'POST',
      body: JSON.stringify({
        query: params.query,
        rerank: params.rerank ?? true,
        filter: params.filter,
      }),
    });
  }

  async uploadDocument(file: File, metadata: { scope: string }): Promise<RagieDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('mode', 'fast');

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(`Ragie API error: ${error.detail || response.statusText}`);
    }

    return response.json();
  }

  formatDocumentList(documents: RagieDocument[]): string {
    if (!documents || documents.length === 0) {
      return "# 📚 Documentos\n\nℹ️ **Nenhum documento encontrado**\n\nUse o botão de upload para adicionar documentos.";
    }

    const statusMap: Record<string, string> = {
      'pending': '⏳ Aguardando',
      'partitioning': '📄 Dividindo',
      'partitioned': '✂️ Dividido',
      'refined': '🔍 Refinado',
      'chunked': '📝 Em chunks',
      'indexed': '📑 Indexado',
      'summary_indexed': '📋 Sumário pronto',
      'ready': '✅ Pronto',
      'failed': '❌ Falhou'
    };

    const sections = documents.map(doc => {
      const status = statusMap[doc.status] || doc.status;
      return [
        `### ${doc.name}`,
        `- **ID**: \`${doc.id}\``,
        `- **Status**: ${status}`,
        doc.chunk_count ? `- **Chunks**: ${doc.chunk_count}` : null,
        `- **Escopo**: ${doc.metadata?.scope || 'N/A'}`,
        '',
        doc.status === 'ready' ? '> ✨ Este documento está pronto para consulta!' : 
        doc.status === 'indexed' ? '> 🔍 Este documento já pode ser consultado.' :
        doc.status === 'failed' ? '> ❌ Houve um erro no processamento deste documento.' :
        '> 🔄 Este documento ainda está sendo processado.',
        ''
      ].filter(Boolean).join('\n');
    });

    return [
      '# 📚 Documentos Disponíveis',
      '',
      '> Use o botão de upload para adicionar novos documentos.',
      '',
      ...sections
    ].join('\n');
  }
} 
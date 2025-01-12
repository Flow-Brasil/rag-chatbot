import {
  RagieDocument,
  RagieRetrievalRequest,
  RagieRetrievalResponse,
  RagieGenerateRequest,
  RagieGenerateResponse,
  DocumentMetadata,
  DocumentStatus
} from '../types/ragie';

export class RagieService {
  private baseUrl = 'https://api.ragie.ai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers({
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    });

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Erro na requisição');
    }

    return response.json();
  }

  // Upload de documento
  async uploadDocument(file: File, metadata: DocumentMetadata = {}): Promise<RagieDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('mode', 'fast');

    const response = await this.request<RagieDocument>('/documents', {
      method: 'POST',
      body: formData,
    });

    return {
      id: response.id,
      content: '',
      metadata: response.metadata || {},
      status: response.status as DocumentStatus
    };
  }

  // Upload de conteúdo raw
  async uploadRawContent(content: string, metadata: DocumentMetadata = {}): Promise<RagieDocument> {
    const response = await this.request<RagieDocument>('/documents/raw', {
      method: 'POST',
      body: JSON.stringify({ content, metadata }),
    });

    return {
      id: response.id,
      content,
      metadata: response.metadata || {},
      status: response.status as DocumentStatus
    };
  }

  // Verificar status do documento
  async getDocument(documentId: string): Promise<RagieDocument> {
    const response = await this.request<RagieDocument>(`/documents/${documentId}`);

    return {
      id: response.id,
      content: '',
      metadata: response.metadata || {},
      status: response.status as DocumentStatus
    };
  }

  // Deletar documento
  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Atualizar metadados do documento
  async updateDocumentMetadata(documentId: string, metadata: DocumentMetadata): Promise<RagieDocument> {
    const response = await this.request<RagieDocument>(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata }),
    });

    return {
      id: response.id,
      content: '',
      metadata: response.metadata || {},
      status: response.status as DocumentStatus
    };
  }

  // Buscar informações
  async retrieve(request: RagieRetrievalRequest): Promise<RagieRetrievalResponse> {
    const response = await this.request<RagieRetrievalResponse>('/retrievals', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return {
      results: response.results.map(result => ({
        content: result.content,
        score: result.score,
        metadata: result.metadata || {}
      }))
    };
  }

  // Gerar resposta
  async generate(request: RagieGenerateRequest): Promise<RagieGenerateResponse> {
    const response = await this.request<RagieGenerateResponse>('/tutorial/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return {
      content: response.content,
      sources: response.sources.map(source => ({
        content: source.content,
        score: source.score,
        metadata: source.metadata || {}
      }))
    };
  }
} 
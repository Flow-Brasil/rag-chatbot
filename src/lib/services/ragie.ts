import { RagieDocument } from '@/lib/types/ragie';

export class RagieService {
  private apiKey: string;
  private baseUrl = 'https://api.ragie.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || response.statusText);
    }

    return response.json();
  }

  async listDocuments(): Promise<RagieDocument[]> {
    return this.request<RagieDocument[]>('/documents');
  }

  async uploadDocument(file: File, metadata: Record<string, any>): Promise<RagieDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || response.statusText);
    }

    return response.json();
  }

  async uploadRawContent(content: string, metadata: Record<string, any> = {}): Promise<RagieDocument> {
    return this.request<RagieDocument>('/documents/raw', {
      method: 'POST',
      body: JSON.stringify({ content, metadata }),
    });
  }

  async updateDocumentMetadata(documentId: string, metadata: Record<string, any>): Promise<RagieDocument> {
    return this.request<RagieDocument>(`/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata }),
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async getDocument(documentId: string): Promise<RagieDocument> {
    return this.request<RagieDocument>(`/documents/${documentId}`);
  }
} 
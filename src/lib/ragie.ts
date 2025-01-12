const RAGIE_API_KEY = process.env["NEXT_PUBLIC_RAGIE_API_KEY"];
const RAGIE_API_URL = "https://api.ragie.ai";

interface RagieDocument {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
  metadata: {
    scope?: string;
    tipo?: string;
    autor?: string;
  };
  created_at: string;
}

class RagieClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async listDocuments(): Promise<RagieDocument[]> {
    const response = await this.request<{ documents: RagieDocument[] }>("/documents");
    return response.documents;
  }

  async getDocument(id: string): Promise<RagieDocument> {
    return this.request<RagieDocument>(`/documents/${id}`);
  }

  async getDocumentContent(id: string): Promise<{ content: string }> {
    return this.request<{ content: string }>(`/documents/${id}/content`);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.request(`/documents/${id}`, { method: "DELETE" });
  }

  async updateDocument(
    id: string, 
    updates: { name: string; metadata: Record<string, any> }
  ): Promise<RagieDocument> {
    return this.request<RagieDocument>(`/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async uploadDocument(file: File, metadata: Record<string, any>): Promise<RagieDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await fetch(`${this.apiUrl}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

if (!RAGIE_API_KEY) {
  throw new Error("NEXT_PUBLIC_RAGIE_API_KEY is not configured");
}

export const ragieClient = new RagieClient(RAGIE_API_KEY, RAGIE_API_URL); 
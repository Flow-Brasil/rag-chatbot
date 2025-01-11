export interface RagieChunk {
  text: string;
  score?: number;
  metadata?: Record<string, any>;
  document_id?: string;
}

export interface RagieResponse {
  scored_chunks: RagieChunk[];
  total_chunks?: number;
  processing_time?: number;
}

export interface RagieError {
  error: string;
  status: number;
  message: string;
}

export interface RagieRequestOptions {
  query: string;
  rerank?: boolean;
  filter?: {
    document_id?: string;
    scope?: string;
  };
  limit?: number;
}

export interface RagieConfig {
  apiKey: string;
  baseUrl: string;
  maxRetries?: number;
  timeout?: number;
} 
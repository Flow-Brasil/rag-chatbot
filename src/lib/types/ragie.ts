export type DocumentStatus = 
  | 'pending'
  | 'partitioning'
  | 'partitioned'
  | 'refined'
  | 'chunked'
  | 'indexed'
  | 'summary_indexed'
  | 'ready'
  | 'failed';

export interface DocumentMetadata {
  scope?: string;
  [key: string]: unknown;
}

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  status: DocumentStatus;
}

export interface RetrievalResult {
  content: string;
  score: number;
  metadata: DocumentMetadata;
}

export interface CompletionResult {
  content: string;
  sources: RetrievalResult[];
}

export interface RagieDocument {
  id: string;
  name: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status: DocumentStatus;
}

export interface RagieRetrievalRequest {
  query: string;
  rerank?: boolean;
  filter?: {
    documentId?: string;
    scope?: string;
  };
}

export interface RagieRetrievalResponse {
  results: {
    content: string;
    score: number;
    metadata: DocumentMetadata;
  }[];
}

export interface RagieGenerateRequest extends RagieRetrievalRequest {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface RagieGenerateResponse {
  content: string;
  sources: {
    content: string;
    score: number;
    metadata: DocumentMetadata;
  }[];
}

export interface ScoredChunk {
  content: string;
  score: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface RetrievalResponse {
  scoredChunks: ScoredChunk[];
}

export interface MessageRole {
  role: 'user' | 'assistant';
}

export interface UploadResponse {
  id: string;
  status: 'processing' | 'ready' | 'failed';
  metadata?: {
    scope?: string;
    [key: string]: any;
  };
}

export interface RagieError {
  detail: string;
  status: number;
} 
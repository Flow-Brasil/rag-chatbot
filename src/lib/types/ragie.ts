import type { Ragie } from 'ragie';

export interface RagieMetadata {
  [key: string]: string | number | boolean | string[];
}

export interface RagieDocument {
  id: string;
  status: string;
  metadata?: RagieMetadata;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RagieDocumentGet extends RagieDocument {
  chunks?: Array<{
    id: string;
    content: string;
    metadata?: RagieMetadata;
  }>;
}

export interface CreateDocumentRawParams {
  data: {
    content: string;
    metadata?: RagieMetadata;
  };
}

export interface PatchDocumentMetadataRequest {
  documentId: string;
  patchDocumentMetadataParams: {
    metadata: RagieMetadata;
  };
}

export interface RetrievalChunk {
  id: string;
  content: string;
  metadata?: RagieMetadata;
  score?: number;
}

export interface RetrievalResponse {
  results: RetrievalChunk[];
  documents?: RagieDocument[];
} 
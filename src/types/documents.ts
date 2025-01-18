export interface Document {
  id: string;
  name: string;
  metadata: Record<string, string[]>;
  created_at: string;
  status: string;
  chunk_count: number;
} 
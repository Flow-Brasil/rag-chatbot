export interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    [key: string]: any;
  };
  created_at: string;
} 
export interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  awaitingUpload?: boolean;
}

export interface PendingUpload {
  content: any;
  suggestedName: string;
  awaitingNameConfirmation: boolean;
  metadata?: Record<string, string>;
  awaitingMetadata?: boolean;
} 
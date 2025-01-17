'use client';

import { MetadataEditor } from "./MetadataEditor";
import { FileNameSelector } from "./FileNameSelector";

interface Message {
  role: "user" | "assistant";
  content: string;
  awaitingUpload?: boolean;
}

interface PendingUpload {
  content: any;
  suggestedName: string;
  awaitingNameConfirmation: boolean;
  metadata?: Record<string, string>;
  awaitingMetadata?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedCliente: string | null;
  pendingUpload: PendingUpload | null;
  onMetadataSelect: (key: string, value: string) => void;
  onMetadataRemove: (key: string) => void;
  onNameSelect: (name: string) => void;
  onConfirmName: (metadata: Record<string, string>) => Promise<void>;
}

export function ChatMessages({
  messages,
  selectedCliente,
  pendingUpload,
  onMetadataSelect,
  onMetadataRemove,
  onNameSelect,
  onConfirmName
}: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "assistant" ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "assistant"
                ? "bg-gray-100"
                : "bg-blue-500 text-white"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}

      {pendingUpload?.awaitingMetadata && (
        <div className="bg-gray-100 rounded-lg p-4">
          <MetadataEditor
            onMetadataSelect={onMetadataSelect}
            onMetadataRemove={onMetadataRemove}
            selectedMetadata={pendingUpload.metadata || {}}
          />
        </div>
      )}

      {pendingUpload?.awaitingNameConfirmation && (
        <div className="bg-gray-100 rounded-lg p-4">
          <FileNameSelector
            suggestedName={pendingUpload.suggestedName}
            onNameSelect={onNameSelect}
            onConfirm={() => {
              if (pendingUpload.metadata) {
                onConfirmName(pendingUpload.metadata);
              }
            }}
          />
        </div>
      )}
    </div>
  );
} 
'use client';

import type { Document } from "../../../../types/documents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Document[];
  isUploadMode: boolean;
  onDocumentSelect: (doc: Document) => void;
  onDeleteDocument?: (docId: string) => Promise<boolean>;
}

export function DocumentList({
  documents,
  selectedDocuments,
  isUploadMode,
  onDocumentSelect,
  onDeleteDocument,
}: DocumentListProps) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 ${
            selectedDocuments.some((selected) => selected.id === doc.id)
              ? "border-blue-500"
              : ""
          }`}
          onClick={() => onDocumentSelect(doc)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{doc.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
            {!isUploadMode && onDeleteDocument && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirmed = window.confirm(
                    "Tem certeza que deseja excluir este documento?"
                  );
                  if (confirmed) {
                    await onDeleteDocument(doc.id);
                  }
                }}
              >
                <Trash2Icon className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 
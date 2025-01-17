'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileIcon, Trash2Icon } from "lucide-react";
import type { Document } from "./types";

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Document[];
  isUploadMode: boolean;
  onDocumentSelect: (doc: Document) => void;
  onDeleteDocument: (docId: string) => Promise<boolean>;
}

export function DocumentList({
  documents,
  selectedDocuments,
  isUploadMode,
  onDocumentSelect,
  onDeleteDocument
}: DocumentListProps) {
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id}>
          <div
            className={`p-3 rounded cursor-pointer transition-colors ${
              selectedDocuments.some(d => d.id === doc.id)
                ? "bg-blue-100"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex items-start flex-1"
                onClick={() => !isUploadMode && onDocumentSelect(doc)}
              >
                <FileIcon className="w-4 h-4 mt-1 mr-2 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(doc.created_at)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingDoc(doc.id);
                }}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Excluir documento"
              >
                <Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-700" />
              </button>
            </div>
          </div>
          {deletingDoc === doc.id && (
            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 mb-2">
                Tem certeza que deseja excluir o documento "{doc.name}"?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeletingDoc(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const success = await onDeleteDocument(doc.id);
                    if (success) {
                      setDeletingDoc(null);
                    }
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
'use client';

import { FileIcon, XIcon } from "lucide-react";
import type { Document } from "./types";

interface SelectedDocumentsProps {
  documents: Document[];
  onRemove: (doc: Document) => void;
}

export function SelectedDocuments({
  documents,
  onRemove
}: SelectedDocumentsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded"
        >
          <FileIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">{doc.name}</span>
          <button
            onClick={() => onRemove(doc)}
            className="ml-2 hover:text-blue-900"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 
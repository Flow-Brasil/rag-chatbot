"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Document {
  id: string;
  name: string;
  metadata: {
    scope?: string;
    tipo?: string;
    autor?: string;
  };
}

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; metadata: Record<string, any> }) => Promise<void>;
  document: Document | null;
  saving: boolean;
}

export function EditDocumentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  document, 
  saving 
}: EditDocumentModalProps) {
  const [fileName, setFileName] = useState("");
  const [scope, setScope] = useState("");
  const [tipo, setTipo] = useState("");
  const [autor, setAutor] = useState("");

  useEffect(() => {
    if (document) {
      setFileName(document.name);
      setScope(document.metadata.scope || "");
      setTipo(document.metadata.tipo || "");
      setAutor(document.metadata.autor || "");
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    const updates = {
      name: fileName,
      metadata: {
        scope,
        tipo,
        autor,
      }
    };

    await onSave(document.id, updates);
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Editar Documento</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome do arquivo
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Escopo
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Ex: documentos, manuais, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo
            </label>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Ex: manual, relatório, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Autor
            </label>
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
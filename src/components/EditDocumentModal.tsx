"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen && !!document} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nome do arquivo</Label>
            <Input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              aria-label="Nome do arquivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Escopo</Label>
            <Input
              id="scope"
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Ex: documentos, manuais, etc"
              aria-label="Escopo do documento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Input
              id="tipo"
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: manual, relatório, etc"
              aria-label="Tipo do documento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autor">Autor</Label>
            <Input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              aria-label="Autor do documento"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
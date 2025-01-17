"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: Record<string, any>) => Promise<void>;
  uploading: boolean;
}

export function UploadModal({ isOpen, onClose, onUpload, uploading }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [scope, setScope] = useState("");
  const [tipo, setTipo] = useState("");
  const [autor, setAutor] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const metadata = {
      scope,
      tipo: tipo || selectedFile.type,
      autor,
      originalName: selectedFile.name,
    };

    // Criar um novo arquivo com o nome personalizado
    const newFile = new File([selectedFile], fileName, {
      type: selectedFile.type,
    });

    await onUpload(newFile, metadata);
    resetForm();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileName("");
    setScope("");
    setTipo("");
    setAutor("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-file-upload">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="modal-file-upload"
                aria-label="Selecionar arquivo para upload"
              />
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-auto py-2 justify-start font-normal"
                onClick={() => document.getElementById("modal-file-upload")?.click()}
              >
                {selectedFile ? selectedFile.name : "Selecionar arquivo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("modal-file-upload")?.click()}
                aria-label="Selecionar arquivo"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

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
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Enviando..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
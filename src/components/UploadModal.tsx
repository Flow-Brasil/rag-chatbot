"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Upload de Documento</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Arquivo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="modal-file-upload"
              />
              <label
                htmlFor="modal-file-upload"
                className="flex-1 cursor-pointer border rounded-md p-2 hover:bg-gray-50"
              >
                {selectedFile ? selectedFile.name : "Selecionar arquivo"}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("modal-file-upload")?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

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
          </div>
        </form>
      </Card>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    scope: "",
    tipo: "",
    autor: ""
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo");
      }

      router.push("/gerenciador");
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload de Documento</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Área de seleção de arquivo */}
          <div>
            <label className="block text-sm font-medium mb-2">Arquivo</label>
            <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-blue-400 bg-gray-50">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt,.json,.md"
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-blue-500"
              >
                {selectedFile ? (
                  <div className="text-center">
                    <FileIcon className="w-8 h-8 mb-2" />
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <>
                    <FileIcon className="w-8 h-8 mb-2" />
                    <p>Clique para selecionar um arquivo</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT, JSON ou MD</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Campos de metadados */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Escopo</label>
              <input
                type="text"
                value={metadata.scope}
                onChange={(e) => setMetadata(prev => ({ ...prev, scope: e.target.value }))}
                placeholder="Ex: documentos, manuais, etc"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <input
                type="text"
                value={metadata.tipo}
                onChange={(e) => setMetadata(prev => ({ ...prev, tipo: e.target.value }))}
                placeholder="Ex: manual, relatório, etc"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Autor</label>
              <input
                type="text"
                value={metadata.autor}
                onChange={(e) => setMetadata(prev => ({ ...prev, autor: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/gerenciador")}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
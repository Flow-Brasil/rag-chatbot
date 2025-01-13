"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon } from "lucide-react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface Cliente {
  name: string;
  documentCount: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [metadata, setMetadata] = useState({
    cliente: ""
  });

  // Buscar lista de clientes
  useEffect(() => {
    async function fetchClientes() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        
        // Agrupar documentos por cliente e contar
        const clientesMap = new Map<string, number>();
        data.documents.forEach((doc: any) => {
          const clienteName = doc.metadata?.cliente;
          if (clienteName) {
            clientesMap.set(clienteName, (clientesMap.get(clienteName) || 0) + 1);
          }
        });
        
        // Converter para array de clientes
        const clientesArray = Array.from(clientesMap.entries()).map(([name, count]) => ({
          name,
          documentCount: count
        }));
        
        setClientes(clientesArray);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    
    fetchClientes();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !metadata.cliente) return;

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

          {/* Campo de seleção de cliente com Autocomplete */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <Autocomplete
              allowsCustomValue
              placeholder="Selecione ou adicione um cliente"
              defaultItems={clientes}
              value={metadata.cliente}
              onInputChange={(value) => setMetadata(prev => ({ ...prev, cliente: value }))}
              className="w-full"
            >
              {(cliente) => (
                <AutocompleteItem key={cliente.name} value={cliente.name}>
                  {cliente.name} ({cliente.documentCount} doc{cliente.documentCount !== 1 ? 's' : ''})
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>

          {/* Botão de envio */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!selectedFile || !metadata.cliente || uploading}
              className="px-8"
            >
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, X } from "lucide-react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

interface Cliente {
  name: string;
  documentCount: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((acc, file) => acc + file.size, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !metadata.cliente) return;

    setUploading(true);
    try {
      // Upload cada arquivo sequencialmente
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("metadata", JSON.stringify(metadata));

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Erro ao fazer upload do arquivo ${file.name}`);
        }
      }

      router.push("/gerenciador");
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao fazer upload dos arquivos");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload de Documentos</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Área de seleção de arquivo */}
          <div>
            <label className="block text-sm font-medium mb-2">Arquivos</label>
            <div className="border-2 border-dashed rounded-lg p-6 transition-colors hover:border-blue-400 bg-gray-50">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt,.json,.md"
                className="hidden"
                id="file-upload"
                disabled={uploading}
                multiple
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-blue-500"
              >
                <FileIcon className="w-8 h-8 mb-2" />
                <p>Clique para selecionar arquivos</p>
                <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT, JSON ou MD</p>
              </label>
            </div>

            {/* Lista de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-500 mb-2">
                  {selectedFiles.length} arquivo(s) selecionado(s) - Total: {(getTotalSize() / 1024).toFixed(2)} KB
                </div>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campo de seleção de cliente com Autocomplete */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <Autocomplete
              allowsCustomValue
              placeholder="Digite para buscar ou adicionar um cliente"
              defaultItems={clientes}
              value={metadata.cliente}
              onInputChange={(value) => {
                setMetadata(prev => ({ ...prev, cliente: value }));
              }}
              className="w-full"
              endContent={
                metadata.cliente && !clientes.some(c => c.name === metadata.cliente) ? (
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    Novo Cliente
                  </div>
                ) : null
              }
            >
              {(cliente) => (
                <AutocompleteItem key={cliente.name} textValue={cliente.name}>
                  <div className="flex justify-between items-center">
                    <span>{cliente.name}</span>
                    <span className="text-sm text-gray-500">
                      {cliente.documentCount} doc{cliente.documentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            {metadata.cliente && !clientes.some(c => c.name === metadata.cliente) && (
              <p className="text-sm text-blue-600 mt-1">
                Será criado um novo cliente: {metadata.cliente}
              </p>
            )}
          </div>

          {/* Botão de envio */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || !metadata.cliente || uploading}
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
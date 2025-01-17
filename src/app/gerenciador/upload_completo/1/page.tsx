"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, X, XCircle } from "lucide-react";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import Link from "next/link";

interface Cliente {
  name: string;
  documentCount: number;
}

export default function UploadEtapa1Page() {
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

    try {
      // Armazenar metadados dos arquivos no uploadData
      sessionStorage.setItem('uploadData', JSON.stringify({
        files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
        metadata: metadata
      }));

      // Armazenar os arquivos reais no uploadFiles
      const filesData = await Promise.all(selectedFiles.map(async file => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          content: Array.from(new Uint8Array(arrayBuffer))
        };
      }));
      
      sessionStorage.setItem('uploadFiles', JSON.stringify(filesData));

      // Redirecionar para etapa 2
      router.push("/gerenciador/upload_completo/2");
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      alert("Erro ao processar os dados");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upload de Documentos</h1>
        <Button
          variant="outline"
          onClick={() => {
            // Limpar dados do upload anterior
            sessionStorage.removeItem('uploadData');
            // Recarregar a página
            window.location.reload();
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Recomeçar Upload
        </Button>
      </div>

      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Button variant="default" className="w-24">
          Etapa 1
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 2
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 3
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload - Etapa 1 (Básico)</h1>
        <p className="text-gray-600 mt-2">
          Upload básico de arquivos com seleção de cliente.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de seleção de cliente com IntelligentSelector */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <IntelligentSelector
              clientes={clientes}
              selectedCliente={metadata.cliente}
              onClientSelect={(value) => {
                setMetadata(prev => ({ ...prev, cliente: value || "" }));
                // Se um cliente foi selecionado e há arquivos, submeter o formulário
                if (value && selectedFiles.length > 0) {
                  const form = document.querySelector('form');
                  form?.requestSubmit();
                }
              }}
              onInputChange={(value) => {
                setMetadata(prev => ({ ...prev, cliente: value }));
              }}
            />
          </div>

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
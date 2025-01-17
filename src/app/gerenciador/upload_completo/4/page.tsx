"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface UploadData {
  files: Array<{name: string; type: string; size: number}>;
  metadata: {
    cliente: string;
    mainTool: string;
    fileAssociations: Record<string, string>;
    tools: Array<{name: string; files: string[]}>;
    [key: string]: any;
  };
}

export default function UploadEtapa4Page() {
  const router = useRouter();
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const savedData = sessionStorage.getItem('uploadData');
      const savedFiles = sessionStorage.getItem('uploadFiles');
      
      if (!savedData || !savedFiles) {
        router.push("/gerenciador/upload_completo/1");
        return;
      }

      try {
        const data = JSON.parse(savedData);
        const filesData = JSON.parse(savedFiles);
        
        // Reconstruir os objetos File
        const reconstructedFiles = filesData.map((fileData: any) => {
          const uint8Array = new Uint8Array(fileData.content);
          const blob = new Blob([uint8Array], { type: fileData.type });
          return new File([blob], fileData.name, {
            type: fileData.type,
            lastModified: fileData.lastModified
          });
        });

        setUploadData(data);
        setFiles(reconstructedFiles);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        router.push("/gerenciador/upload_completo/1");
      }
    };

    loadData();
  }, [router]);

  const handleSubmit = async () => {
    if (!uploadData || !files.length) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Adicionar todos os arquivos com suas respectivas ferramentas
      files.forEach(file => {
        const ferramenta = uploadData.metadata.fileAssociations[file.name];
        if (!ferramenta) return; // Pular arquivos sem associação
        
        formData.append("files", file);
        
        const metadata = {
          cliente: uploadData.metadata.cliente,
          Ferramenta: ferramenta,
          tipo: "Documento",
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        };
        
        formData.append("metadata", JSON.stringify(metadata));
      });

      console.log("Enviando dados para o Ragie:", {
        files: files.map(f => f.name),
        metadata: formData.getAll("metadata").map(m => JSON.parse(m as string))
      });

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao fazer upload: ${JSON.stringify(errorData)}`);
      }

      // Limpar dados do sessionStorage
      sessionStorage.removeItem('uploadData');
      sessionStorage.removeItem('uploadFiles');

      // Redirecionar para a página de processamento
      router.push("/gerenciador/upload_completo/5" as any);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload dos arquivos. Verifique se todos os campos obrigatórios foram preenchidos.");
    } finally {
      setLoading(false);
    }
  };

  if (!uploadData || files.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum arquivo para revisar</h1>
          <p className="text-gray-600 mb-4">Volte para a etapa 1 e selecione os arquivos para upload.</p>
          <Link href="/gerenciador/upload_completo/1">
            <Button>Voltar para Etapa 1</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filtrar apenas os arquivos da ferramenta principal
  const mainToolFiles = files.filter(file => 
    uploadData.metadata.fileAssociations[file.name] === uploadData.metadata.mainTool
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href="/gerenciador/upload_completo/1" className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Link href="/gerenciador/upload_completo/2" className="w-24">
          <Button variant="outline" className="w-full">Etapa 2</Button>
        </Link>
        <Link href="/gerenciador/upload_completo/3" className="w-24">
          <Button variant="outline" className="w-full">Etapa 3</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 4</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 5
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload - Etapa 4 (Revisão)</h1>
        <p className="text-gray-600 mt-2">
          Revise os arquivos e metadados antes de confirmar o upload.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Metadados comuns */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Metadados Comuns</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Cliente</span>
                <span className="text-sm">{uploadData.metadata.cliente}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Ferramenta Principal</span>
                <span className="text-sm">{uploadData.metadata.mainTool}</span>
              </div>
            </div>
          </div>

          {/* Arquivos agrupados por ferramenta */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Arquivos e Associações</h2>
            {uploadData.metadata.tools.map((tool) => {
              const toolFiles = files.filter(file => 
                uploadData.metadata.fileAssociations[file.name] === tool.name
              );

              return (
                <div key={tool.name} className="mb-4">
                  <div className={`p-4 rounded-lg ${tool.name === uploadData.metadata.mainTool ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <h3 className={`font-medium ${tool.name === uploadData.metadata.mainTool ? 'text-blue-700' : 'text-gray-700'}`}>
                      {tool.name}
                      {tool.name === uploadData.metadata.mainTool && (
                        <span className="ml-2 text-sm text-blue-600">(Principal)</span>
                      )}
                    </h3>
                    <span className={`text-sm ${tool.name === uploadData.metadata.mainTool ? 'text-blue-600' : 'text-gray-600'}`}>
                      {toolFiles.length} arquivo(s)
                    </span>
                    <div className="mt-3 space-y-2">
                      {toolFiles.map((file) => (
                        <div key={file.name} className="flex items-center gap-2 text-sm">
                          <FileIcon className="h-4 w-4 text-gray-500" />
                          <span>{file.name}</span>
                          <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Link href="/gerenciador/upload_completo/3">
            <Button variant="outline">Voltar</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar Upload'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 
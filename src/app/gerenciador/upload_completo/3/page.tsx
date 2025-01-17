"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    Ferramenta?: string;
    [key: string]: string | undefined;
  };
}

interface FileWithMetadata {
  name: string;
  size: number;
  type: string;
  metadata: {
    Ferramenta: string;
    [key: string]: string;
  };
}

interface UploadData {
  files: Array<{name: string; type: string; size: number}>;
  metadata: {
    cliente: string;
    fileAssociations: Record<string, string>;
    tools: Array<{name: string; files: string[]}>;
    [key: string]: any;
  };
}

export default function UploadEtapa3Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [associatedDocs, setAssociatedDocs] = useState<Document[]>([]);
  const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);

  useEffect(() => {
    // Recuperar dados do sessionStorage
    const storedData = sessionStorage.getItem('uploadData');
    const storedFiles = sessionStorage.getItem('uploadFiles');
    
    if (!storedData || !storedFiles) {
      router.push("/gerenciador/upload_completo/1");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData) as UploadData;
      const filesData = JSON.parse(storedFiles);
      
      // Reconstruir os arquivos
      const reconstructedFiles = filesData.map((fileData: any) => {
        return new File(
          [new Uint8Array(fileData.content)],
          fileData.name,
          {
            type: fileData.type,
            lastModified: fileData.lastModified
          }
        );
      });

      // Criar array de arquivos com metadados
      const processedFiles = reconstructedFiles.map((file: File) => {
        const toolName = parsedData.metadata.fileAssociations[file.name] || "";
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          metadata: {
            Ferramenta: toolName
          }
        };
      });

      setUploadData(parsedData);
      setFiles(reconstructedFiles);
      setFilesWithMetadata(processedFiles);

      // Buscar documentos associados se houver ferramenta
      if (parsedData.metadata.tools && parsedData.metadata.tools.length > 0) {
        fetchAssociatedDocs(parsedData.metadata.cliente);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      router.push("/gerenciador/upload_completo/1");
    }
  }, [router]);

  const fetchAssociatedDocs = async (cliente: string) => {
    try {
      const response = await fetch(`/api/documents?cliente=${encodeURIComponent(cliente)}`);
      if (!response.ok) throw new Error("Erro ao buscar documentos");
      const data = await response.json();
      setAssociatedDocs(data.documents || []);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    }
  };

  const handleSubmit = async () => {
    if (!uploadData || !files.length) return;

    try {
      setLoading(true);
      
      // Criar FormData com os arquivos e metadados
      const formData = new FormData();
      
      // Adicionar cada arquivo e seus metadados
      files.forEach((file) => {
        if (!file) return;
        
        formData.append("files", file);
        
        // Pegar a ferramenta associada ao arquivo
        const ferramenta = uploadData.metadata.fileAssociations[file.name];
        
        // Garantir que os metadados incluam cliente e ferramenta exatamente como mostrado no preview
        const metadata = {
          cliente: uploadData.metadata.cliente,
          Ferramenta: ferramenta,
          tipo: "Documento",
          // Adicionar outros metadados que possam ser necessários
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        };
        
        // Adicionar metadados no formato que o Ragie espera
        formData.append("metadata", JSON.stringify({
          ...metadata,
          // Garantir que os campos obrigatórios estejam presentes
          cliente: metadata.cliente || "",
          Ferramenta: metadata.Ferramenta || ""
        }));
      });

      console.log("Enviando dados para o Ragie:", {
        files: files.map(f => f.name),
        metadata: formData.getAll("metadata").map(m => JSON.parse(m as string))
      });

      // Enviar para o servidor usando o endpoint correto do Ragie
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
      router.push("/gerenciador/upload_completo/4");
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
        <Button variant="default" className="w-24">Etapa 3</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload - Etapa 3 (Revisão)</h1>
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
              {Object.entries({
                cliente: uploadData.metadata.cliente,
                Ferramenta: Object.values(uploadData.metadata.fileAssociations || {})[0] || ""
              }).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">{key}</span>
                  <span className="text-sm">{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arquivos agrupados por ferramenta */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Arquivos e Associações</h2>
            {Object.entries(
              files.reduce((acc, file) => {
                if (!file) return acc;
                
                const fileAssociations = uploadData?.metadata?.fileAssociations;
                if (!fileAssociations || typeof fileAssociations !== 'object') return acc;
                
                const ferramenta = fileAssociations[file.name];
                if (!ferramenta) return acc;
                
                if (!acc[ferramenta]) acc[ferramenta] = [];
                acc[ferramenta].push(file);
                return acc;
              }, {} as Record<string, File[]>)
            ).map(([ferramenta, arquivos]) => (
              <div key={ferramenta} className="mb-6">
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <h3 className="font-medium text-blue-700">{ferramenta}</h3>
                  <span className="text-sm text-blue-600">{arquivos.length} arquivo(s)</span>
                </div>
                <div className="space-y-2 pl-4">
                  {arquivos.map((file) => (
                    <div key={file.name} className="flex items-center gap-2 text-sm">
                      <FileIcon className="h-4 w-4 text-gray-500" />
                      <span>{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Link href="/gerenciador/upload_completo/2">
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
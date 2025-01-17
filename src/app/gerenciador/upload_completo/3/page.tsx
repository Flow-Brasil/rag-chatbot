"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileIcon, X } from "lucide-react";
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

interface UploadData {
  files: Array<{name: string; type: string; size: number}>;
  metadata: {
    cliente: string;
    Ferramenta?: string;
    [key: string]: string | undefined;
  };
}

export default function UploadEtapa3Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [associatedDocs, setAssociatedDocs] = useState<Document[]>([]);

  useEffect(() => {
    // Recuperar dados do sessionStorage
    const storedData = sessionStorage.getItem('uploadData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUploadData(parsedData);
      
      // Buscar documentos associados à ferramenta
      if (parsedData.metadata.Ferramenta) {
        fetchAssociatedDocs(parsedData.metadata.cliente, parsedData.metadata.Ferramenta);
      }
    }

    // Recuperar arquivos do sessionStorage
    const storedFiles = sessionStorage.getItem('uploadFiles');
    if (storedFiles) {
      const filesData = JSON.parse(storedFiles);
      // Converter os dados dos arquivos de volta para objetos File
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
      setFiles(reconstructedFiles);
    }
  }, []);

  const fetchAssociatedDocs = async (cliente: string, ferramenta: string) => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();
      
      // Filtrar documentos pelo cliente e ferramenta
      const docs = data.documents.filter((doc: Document) => 
        doc.metadata?.cliente === cliente && 
        doc.metadata?.Ferramenta === ferramenta
      );
      
      setAssociatedDocs(docs);
    } catch (error) {
      console.error("Erro ao carregar documentos associados:", error);
    }
  };

  const handleSubmit = async () => {
    if (!uploadData || files.length === 0) return;

    try {
      setLoading(true);
      
      // Preparar os dados para upload
      const formData = new FormData();
      
      // Adicionar cada arquivo com seu próprio metadata
      files.forEach((file, index) => {
        formData.append("files", file);
        
        // Encontrar os metadados específicos deste arquivo
        const fileMetadata = uploadData.filesWithMetadata?.find(
          (f: any) => f.name === file.name
        )?.metadata || uploadData.metadata;
        
        // Adicionar metadata para cada arquivo
        formData.append(
          `metadata_${index}`,
          JSON.stringify(fileMetadata)
        );
      });

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Erro ao fazer upload: ${JSON.stringify(error)}`);
      }

      // Limpar dados do storage
      sessionStorage.removeItem('uploadData');
      sessionStorage.removeItem('uploadFiles');
      
      // Redirecionar para etapa 4 (processamento)
      router.push("/gerenciador/upload_completo/4" as any);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert(err instanceof Error ? err.message : "Erro ao fazer upload dos arquivos");
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
          {/* Lista de arquivos */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Arquivos e Associações</h2>
            <div className="space-y-4">
              {uploadData.filesWithMetadata?.map((fileData: any, index: number) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileIcon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{fileData.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(files[index]?.size ? (files[index].size / 1024).toFixed(2) : '0')} KB)
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">Ferramenta associada:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {fileData.metadata.Ferramenta}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadados comuns */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Metadados Comuns</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(uploadData.metadata || {}).map(([key, value]) => (
                key !== 'fileAssociations' && (
                  <div key={key} className="bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium">{key}: </span>
                    <span className="text-sm">{value as string}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Documentos Associados */}
          {associatedDocs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Documentos Associados à Ferramenta</h2>
              <div className="space-y-2">
                {associatedDocs.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Link href="/gerenciador/upload_completo/2">
              <Button variant="outline">Voltar</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Confirmar Upload"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 
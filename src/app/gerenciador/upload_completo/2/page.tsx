"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";

interface UploadData {
  files: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  metadata: Record<string, string>;
}

export default function UploadEtapa2Page() {
  const router = useRouter();
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [existingMetadata, setExistingMetadata] = useState<Record<string, Set<string>>>({});
  const [metadata, setMetadata] = useState({
    Ferramenta: ""
  });

  // Carregar dados da etapa anterior
  useEffect(() => {
    const savedData = sessionStorage.getItem('uploadData');
    if (!savedData) {
      router.push("/gerenciador/upload_completo/1");
      return;
    }
    
    try {
      const parsedData = JSON.parse(savedData);
      setUploadData(parsedData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      router.push("/gerenciador/upload_completo/1");
    }
  }, [router]);

  // Buscar metadados existentes
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        
        // Extrair valores únicos de metadados
        const metadataMap: Record<string, Set<string>> = {};
        
        data.documents.forEach((doc: any) => {
          if (doc.metadata) {
            Object.entries(doc.metadata).forEach(([key, value]) => {
              if (typeof value === 'string') {
                if (!metadataMap[key]) {
                  metadataMap[key] = new Set();
                }
                metadataMap[key].add(value);
              }
            });
          }
        });
        
        setExistingMetadata(metadataMap);
      } catch (err) {
        console.error("Erro ao carregar metadados:", err);
      }
    }
    
    fetchMetadata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData) return;

    try {
      // Combinar metadados da etapa 1 com os da etapa 2
      const combinedMetadata = {
        ...uploadData.metadata,
        ...metadata
      };

      // Armazenar dados completos para a próxima etapa
      sessionStorage.setItem('uploadData', JSON.stringify({
        ...uploadData,
        metadata: combinedMetadata
      }));

      // Redirecionar para etapa 3
      router.push("/gerenciador/upload_completo/3" as any);
    } catch (err) {
      console.error("Erro ao processar dados:", err);
      alert("Erro ao processar os dados");
    }
  };

  if (!uploadData) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href="/gerenciador/upload_completo/1" className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 2</Button>
        <Link href="/gerenciador/upload_completo/3" className="w-24">
          <Button variant="outline" className="w-full">Etapa 3</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload - Etapa 2 (Metadados)</h1>
        <p className="text-gray-600 mt-2">
          Adicione metadados aos arquivos selecionados.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo dos arquivos selecionados */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Arquivos Selecionados</h2>
            <div className="space-y-2">
              {uploadData.files.map((file, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente (somente leitura) */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <div className="p-2 bg-gray-50 rounded">
              {uploadData.metadata['cliente']}
            </div>
          </div>

          {/* Campo de seleção de ferramenta */}
          <div>
            <label className="block text-sm font-medium mb-2">Ferramenta</label>
            <IntelligentSelector
              clientes={Array.from(existingMetadata['Ferramenta'] || []).map(name => ({ name, documentCount: 0 }))}
              selectedCliente={metadata.Ferramenta}
              onClientSelect={(value) => {
                setMetadata(prev => ({ ...prev, Ferramenta: value || "" }));
              }}
              onInputChange={(value) => {
                setMetadata(prev => ({ ...prev, Ferramenta: value }));
              }}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Link href="/gerenciador/upload_completo/1">
              <Button variant="outline">Voltar</Button>
            </Link>
            <Button type="submit">
              Próximo
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
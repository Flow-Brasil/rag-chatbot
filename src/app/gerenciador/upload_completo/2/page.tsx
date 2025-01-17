"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ToolList } from "@/components/selectors/ToolList";
import { ToolSelector } from "@/components/selectors/ToolSelector";
import { useTools } from "@/hooks/useTools";

interface UploadData {
  files: File[];
  metadata: {
    cliente: string;
    fileAssociations?: Record<string, string>;
    [key: string]: any;
  };
}

interface ExistingTool {
  name: string;
  files: string[];
}

export default function UploadEtapa2Page() {
  const router = useRouter();
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [clientName, setClientName] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);
  
  const {
    tools,
    availableFiles,
    addTool,
    toggleToolExpansion,
    addFileToTool,
    removeFileFromTool,
    selectAllAvailableFiles,
    removeAllFiles,
    updateToolSearchTerm,
    setInitialFiles,
    setTools
  } = useTools();

  // Carregar dados do upload
  useEffect(() => {
    if (dataInitialized) return;

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
        
        // Reconstruir o uploadData com os arquivos reconstruídos
        const reconstructedUploadData = {
          ...data,
          files: reconstructedFiles
        };
        
        // Definir arquivos disponíveis (que ainda não foram associados)
        const associatedFiles = new Set(
          Object.keys(data.metadata?.fileAssociations || {})
        );
        
        setInitialFiles(
          reconstructedFiles
            .map((f: File) => f.name)
            .filter((name: string) => !associatedFiles.has(name))
        );
        
        // Inicializar ferramentas com as associações existentes
        const existingTools = (data.metadata?.tools || []) as ExistingTool[];
        setTools(existingTools.map((tool) => ({
          name: tool.name,
          files: tool.files || [],
          isExpanded: false
        })));

        setUploadData(reconstructedUploadData);
        setClientName(data.metadata.cliente);
        setDataInitialized(true);
        
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        router.push("/gerenciador/upload_completo/1");
      }
    };

    loadData();
  }, [router, setInitialFiles, setTools, dataInitialized]);

  // Efeito separado para buscar ferramentas existentes
  useEffect(() => {
    if (!clientName || !dataInitialized) return;

    const fetchExistingTools = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents?cliente=${encodeURIComponent(clientName)}`);
        if (!response.ok) throw new Error("Erro ao buscar documentos");
        
        const data = await response.json();
        const uniqueTools = new Set<string>();
        
        // Extrair ferramentas únicas dos documentos
        data.documents.forEach((doc: any) => {
          if (doc.metadata?.['Ferramenta'] && doc.metadata['Ferramenta'].trim()) {
            uniqueTools.add(doc.metadata['Ferramenta']);
          }
        });
        
        // Converter ferramentas únicas em array de ToolAssociation
        const toolAssociations = Array.from(uniqueTools).map(name => ({
          name,
          files: [],
          isExpanded: false
        }));
        
        setTools(prev => {
          // Manter apenas as ferramentas que já têm arquivos associados
          const existingToolsWithFiles = prev.filter(tool => tool.files.length > 0);
          // Adicionar novas ferramentas que não existem ainda
          const newTools = toolAssociations.filter(
            newTool => !existingToolsWithFiles.some(existing => existing.name === newTool.name)
          );
          return [...existingToolsWithFiles, ...newTools];
        });
      } catch (error) {
        console.error("Erro ao buscar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingTools();
  }, [clientName, dataInitialized, setTools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData) return;

    // Criar objeto simplificado de associações
    const fileAssociations: Record<string, string> = {};
    tools.forEach(tool => {
      tool.files.forEach(fileName => {
        fileAssociations[fileName] = tool.name;
      });
    });

    // Criar objeto simplificado de ferramentas
    const simplifiedTools = tools.map(t => ({
      name: t.name,
      files: t.files
    }));

    // Atualizar uploadData com as associações simplificadas
    const updatedData = {
      ...uploadData,
      metadata: {
        ...uploadData.metadata,
        fileAssociations,
        tools: simplifiedTools
      }
    };

    try {
      // Salvar apenas os dados necessários no sessionStorage
      const storageData = {
        files: uploadData.files.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          lastModified: f.lastModified
        })),
        metadata: updatedData.metadata
      };
      
      sessionStorage.setItem('uploadData', JSON.stringify(storageData));
      
      // Processar arquivos binários separadamente
      const filesData = await Promise.all(uploadData.files.map(async file => {
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
      
      // Avançar para a próxima etapa
      router.push('/gerenciador/upload_completo/3');
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      alert("Erro ao processar os dados. Por favor, tente novamente.");
    }
  };

  if (!uploadData) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  const hasAssociations = tools.some(tool => tool.files.length > 0);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href="/gerenciador/upload_completo/1" className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 2</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 3
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Associar Documentos - Etapa 2</h1>
        <p className="text-gray-600 mt-2">
          Associe cada documento a uma ferramenta específica.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Lista de Ferramentas */}
          <ToolList
            tools={tools}
            availableFiles={availableFiles}
            onToggleExpand={toggleToolExpansion}
            onAddFile={addFileToTool}
            onRemoveFile={removeFileFromTool}
            onSelectAll={selectAllAvailableFiles}
            onRemoveAll={removeAllFiles}
            onUpdateSearch={updateToolSearchTerm}
            onRemoveFileCompletely={(fileName) => {
              // Remover o arquivo de todas as ferramentas
              setTools(prev => prev.map(tool => ({
                ...tool,
                files: tool.files.filter(f => f !== fileName)
              })));
              
              // Atualizar uploadData removendo o arquivo
              if (uploadData) {
                const updatedFiles = uploadData.files.filter(f => f.name !== fileName);
                const updatedUploadData = {
                  ...uploadData,
                  files: updatedFiles
                };
                setUploadData(updatedUploadData);
                sessionStorage.setItem('uploadData', JSON.stringify(updatedUploadData));
              }
            }}
          />

          {/* Seletor de Ferramentas */}
          <ToolSelector
            tools={tools}
            newToolName={newToolName}
            onToolNameChange={setNewToolName}
            onAddTool={addTool}
          />

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/gerenciador/upload_completo/1">
              <Button variant="outline">Voltar</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={loading || !hasAssociations}
              className="gap-2"
            >
              {loading ? "Carregando..." : "Continuar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 
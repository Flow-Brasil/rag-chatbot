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
    tools?: Array<{name: string; files: string[]}>;
    mainTool?: string;
    [key: string]: any;
  };
}

export default function UploadEtapa2_2Page() {
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
        router.push("/gerenciador/upload_completo/1" as any);
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
        
        setUploadData(reconstructedUploadData);
        setClientName(data.metadata.cliente);
        setDataInitialized(true);
        
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        router.push("/gerenciador/upload_completo/1" as any);
      }
    };

    loadData();
  }, [router, setInitialFiles, setTools, dataInitialized]);

  // Efeito para buscar ferramentas existentes
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
        const toolAssociations = Array.from(uniqueTools)
          // Filtrar a ferramenta principal que já foi selecionada
          .filter(name => name !== uploadData?.metadata.mainTool)
          .map(name => ({
            name,
            files: [],
            isExpanded: false
          }));
        
        setTools(toolAssociations);
      } catch (error) {
        console.error("Erro ao buscar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingTools();
  }, [clientName, dataInitialized, setTools, uploadData?.metadata.mainTool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData || tools.length === 0) return;

    // Pegar a ferramenta selecionada
    const selectedTool = tools[0];
    if (!selectedTool || !selectedTool.name || !selectedTool.files.length) {
      alert("Por favor, selecione uma ferramenta e associe arquivos a ela.");
      return;
    }
    
    // Criar objeto simplificado de associações
    const fileAssociations: Record<string, string> = {};
    selectedTool.files.forEach(fileName => {
      fileAssociations[fileName] = selectedTool.name;
    });

    // Atualizar uploadData com as associações
    const updatedData = {
      ...uploadData,
      metadata: {
        ...uploadData.metadata,
        fileAssociations: {
          ...uploadData.metadata.fileAssociations,
          ...fileAssociations
        },
        tools: [
          ...(uploadData.metadata.tools || []),
          {
            name: selectedTool.name,
            files: selectedTool.files
          }
        ]
      }
    };

    try {
      // Salvar dados atualizados
      sessionStorage.setItem('uploadData', JSON.stringify(updatedData));
      
      // Se ainda há arquivos não associados, ir para a próxima ferramenta
      const unassociatedFiles = uploadData.files.filter(file => 
        !Object.keys(updatedData.metadata.fileAssociations || {}).includes(file.name)
      );

      if (unassociatedFiles.length > 0) {
        router.push('/gerenciador/upload_completo/2/3' as any);
      } else {
        router.push('/gerenciador/upload_completo/3' as any);
      }
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      alert("Erro ao processar os dados. Por favor, tente novamente.");
    }
  };

  if (!uploadData) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Navegação entre etapas */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Link href={"/gerenciador/upload_completo/1" as any} className="w-24">
          <Button variant="outline" className="w-full">Etapa 1</Button>
        </Link>
        <Link href={"/gerenciador/upload_completo/2/1" as any} className="w-24">
          <Button variant="outline" className="w-full">Etapa 2.1</Button>
        </Link>
        <Button variant="default" className="w-24">Etapa 2.2</Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 3
        </Button>
        <Button variant="outline" className="w-24" disabled>
          Etapa 4
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Selecionar Segunda Ferramenta - Etapa 2.2</h1>
        <p className="text-gray-600 mt-2">
          Selecione ou adicione uma ferramenta adicional para os arquivos restantes.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Seletor de Ferramentas */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Segunda Ferramenta</h2>
            <ToolSelector
              tools={tools}
              newToolName={newToolName}
              onToolNameChange={setNewToolName}
              onAddTool={addTool}
            />
          </div>

          {/* Lista de Arquivos */}
          {tools.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Associar Arquivos</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Selecione os arquivos que deseja associar à segunda ferramenta. 
                  Os arquivos não selecionados poderão ser associados a outras ferramentas na próxima etapa.
                </p>
                <ToolList
                  tools={tools}
                  availableFiles={availableFiles}
                  onToggleExpand={toggleToolExpansion}
                  onAddFile={addFileToTool}
                  onRemoveFile={removeFileFromTool}
                  onSelectAll={selectAllAvailableFiles}
                  onRemoveAll={removeAllFiles}
                  onUpdateSearch={updateToolSearchTerm}
                  onRemoveFileCompletely={(fileName: string) => {
                    // Remover o arquivo de todas as ferramentas
                    setTools(prev => prev.map(tool => ({
                      ...tool,
                      files: tool.files.filter(f => f !== fileName)
                    })));
                  }}
                />
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href={"/gerenciador/upload_completo/2/1" as any}>
              <Button variant="outline">Voltar</Button>
            </Link>
            <Link href={"/gerenciador/upload_completo/3" as any}>
              <Button variant="outline">Pular para Revisão</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={loading || tools.length === 0}
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
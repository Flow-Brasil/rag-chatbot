"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { ChevronDown, ChevronUp, FileText, Plus, X } from "lucide-react";

interface UploadData {
  files: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  metadata: Record<string, string>;
}

interface FileAssociation {
  fileName: string;
  tools: string[];
}

interface ToolAssociation {
  name: string;
  files: string[];
  isExpanded?: boolean;
}

export default function UploadEtapa2Page() {
  const router = useRouter();
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<ToolAssociation[]>([]);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [newToolName, setNewToolName] = useState("");

  // Carregar dados do upload
  useEffect(() => {
    const savedData = sessionStorage.getItem('uploadData');
    if (!savedData) {
      router.push("/gerenciador/upload_completo/1");
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setUploadData(data);
      setAvailableFiles(data.files.map((f: any) => f.name));
      
      // Buscar ferramentas existentes
      fetchExistingTools();
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      router.push("/gerenciador/upload_completo/1");
    }
  }, [router]);

  // Função para buscar ferramentas existentes
  const fetchExistingTools = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();
      
      // Extrair ferramentas únicas dos documentos
      const toolsSet = new Set<string>();
      data.documents.forEach((doc: any) => {
        if (doc.metadata?.Ferramenta) {
          toolsSet.add(doc.metadata.Ferramenta);
        }
      });
      
      // Converter para o formato de ToolAssociation
      const existingTools = Array.from(toolsSet).map(name => ({
        name,
        files: [],
        isExpanded: false
      }));
      
      setTools(existingTools);
    } catch (err) {
      console.error("Erro ao carregar ferramentas:", err);
      // Em caso de erro, usar algumas ferramentas padrão
      const defaultTools = ["BDE"].map(name => ({
        name,
        files: [],
        isExpanded: false
      }));
      setTools(defaultTools);
    }
  };

  const toggleToolExpansion = (toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => 
      i === toolIndex ? { ...tool, isExpanded: !tool.isExpanded } : tool
    ));
  };

  const addFileToTool = (fileName: string, toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => {
      if (i === toolIndex) {
        return { ...tool, files: [...tool.files, fileName] };
      }
      return tool;
    }));
    setAvailableFiles(prev => prev.filter(f => f !== fileName));
  };

  const removeFileFromTool = (fileName: string, toolIndex: number) => {
    setTools(prev => prev.map((tool, i) => {
      if (i === toolIndex) {
        return { ...tool, files: tool.files.filter(f => f !== fileName) };
      }
      return tool;
    }));
    setAvailableFiles(prev => [...prev, fileName]);
  };

  const addNewTool = () => {
    if (!newToolName.trim()) return;
    setTools(prev => [...prev, { name: newToolName, files: [], isExpanded: true }]);
    setNewToolName("");
  };

  const handleSubmit = async () => {
    if (!uploadData) return;

    try {
      setLoading(true);

      // Preparar metadados com as associações
      const updatedMetadata = {
        ...uploadData.metadata,
        fileAssociations: tools.reduce((acc, tool) => {
          tool.files.forEach(fileName => {
            acc[fileName] = tool.name;
          });
          return acc;
        }, {} as Record<string, string>)
      };

      // Preparar arquivos com metadados
      const filesWithMetadata = uploadData.files.map(file => ({
        ...file,
        metadata: {
          cliente: uploadData.metadata['cliente'],
          tipo: "documento",
          Ferramenta: updatedMetadata.fileAssociations[file.name] || ""
        }
      }));

      // Atualizar uploadData com as associações
      sessionStorage.setItem('uploadData', JSON.stringify({
        ...uploadData,
        metadata: updatedMetadata,
        filesWithMetadata
      }));

      // Redirecionar para etapa 3
      router.push("/gerenciador/upload_completo/3");
    } catch (err) {
      console.error("Erro ao processar associações:", err);
      alert("Erro ao processar as associações");
    } finally {
      setLoading(false);
    }
  };

  if (!uploadData) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  const hasAssociations = tools.some(tool => tool.files.length > 0);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
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
          <div className="space-y-4">
            {tools.map((tool, toolIndex) => (
              <div key={tool.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleToolExpansion(toolIndex)}
                      className="p-1"
                    >
                      {tool.isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <h3 className="font-medium">{tool.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {tool.files.length} arquivos
                    </span>
                  </div>
                </div>

                {tool.isExpanded && (
                  <div className="mt-4 space-y-4">
                    {/* Arquivos Associados */}
                    {tool.files.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Arquivos associados
                        </h4>
                        <div className="space-y-2">
                          {tool.files.map(fileName => (
                            <div
                              key={fileName}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{fileName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFileFromTool(fileName, toolIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Arquivos Disponíveis */}
                    {availableFiles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Arquivos disponíveis
                        </h4>
                        <div className="space-y-2">
                          {availableFiles.map(fileName => (
                            <div
                              key={fileName}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{fileName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addFileToTool(fileName, toolIndex)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Adicionar Nova Ferramenta */}
          <div className="flex gap-2">
            <IntelligentSelector
              clientes={[]}
              selectedCliente={newToolName}
              onClientSelect={(value) => setNewToolName(value || "")}
              onInputChange={setNewToolName}
              placeholder="Digite o nome da nova ferramenta..."
            />
            <Button onClick={addNewTool} disabled={!newToolName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

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
              {loading ? "Processando..." : "Continuar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 
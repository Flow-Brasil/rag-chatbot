"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, UsersIcon, UploadIcon, CalendarIcon, FilterIcon, XCircle, FileText, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox, Select, SelectItem } from "@nextui-org/react";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { MetadataEditor } from "@/components/selectors/MetadataEditor";
import type { Cliente } from "@/lib/api/clientes";

// Função para formatar data de forma consistente
function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

interface MetadataFilters {
  [key: string]: string | undefined;
}

interface Document {
  id: string;
  name: string;
  status: string;
  metadata?: {
    tipo?: string;
    cliente?: string;
    [key: string]: string | undefined;
  };
  created_at: string;
}

// Função para verificar se um documento é um filtro
function isFilterDocument(doc: Document): boolean {
  // Verifica se o tipo no metadata é "filtro"
  if (doc.metadata?.['tipo']?.toLowerCase() === 'filtro') {
    return true;
  }
  
  // Verificações secundárias (fallback)
  const isFilterByName = doc.name.toLowerCase().includes('filtro') || 
                        doc.name.toLowerCase().includes('filter');
  const isFilterByScope = doc.metadata?.['scope']?.toLowerCase()?.includes('filtro') || 
                         doc.metadata?.['scope']?.toLowerCase()?.includes('filter') || false;
  
  return isFilterByName || Boolean(isFilterByScope);
}

export default function GerenciadorPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [clientes, setClientes] = useState<{ name: string; documentCount: number }[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para filtros de metadados
  const [metadataFilters, setMetadataFilters] = useState<Record<string, string>>({});
  const [existingMetadata, setExistingMetadata] = useState<{[key: string]: Set<string>}>({});

  // Função para atualizar filtros garantindo que undefined não seja atribuído
  const updateMetadataFilter = (key: string, value: string | undefined) => {
    const newFilters = { ...metadataFilters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setMetadataFilters(newFilters);
  };

  // Atualizar filtros
  const handleFilterClick = (doc: Document) => {
    updateMetadataFilter('tipo', doc.metadata?.['tipo']);
  };

  // Botões de filtro
  const handleShowAllDocuments = () => {
    const newFilters = { ...metadataFilters };
    if (isFilterActive('tipo', 'documento')) {
      delete newFilters['tipo'];
    } else {
      newFilters['tipo'] = 'documento';
      // Remover filtro de filtros se estiver ativo
      if (newFilters['tipo'] === 'filtro') {
        delete newFilters['tipo'];
      }
    }
    setMetadataFilters(newFilters);
  };

  const handleShowAllFilters = () => {
    const newFilters = { ...metadataFilters };
    if (isFilterActive('tipo', 'filtro')) {
      delete newFilters['tipo'];
    } else {
      newFilters['tipo'] = 'filtro';
      // Remover filtro de documentos se estiver ativo
      if (newFilters['tipo'] === 'documento') {
        delete newFilters['tipo'];
      }
    }
    setMetadataFilters(newFilters);
  };

  const handleShowByTool = () => {
    const newFilters = { ...metadataFilters };
    if (isFilterActive('hasFerramentas', 'true')) {
      delete newFilters['hasFerramentas'];
    } else {
      newFilters['hasFerramentas'] = 'true';
    }
    setMetadataFilters(newFilters);
  };

  // Função para carregar clientes e metadados
  const fetchData = useCallback(async () => {
    try {
      setLoadingClientes(true);
      
      // Buscar documentos para extrair clientes e metadados
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();
      
      // Agrupar documentos por cliente e contar
      const clientesMap = new Map<string, number>();
      const metadataMap: {[key: string]: Set<string>} = {};
      
      data.documents.forEach((doc: any) => {
        // Processar cliente
        const clienteName = doc.metadata?.cliente;
        if (clienteName) {
          clientesMap.set(clienteName, (clientesMap.get(clienteName) || 0) + 1);
          // Adicionar cliente ao metadataMap
          if (!metadataMap['cliente']) {
            metadataMap['cliente'] = new Set();
          }
          metadataMap['cliente'].add(clienteName);
        }
        
        // Processar outros metadados
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
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar lista de clientes");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar documentos e dados ao montar o componente
  useEffect(() => {
    Promise.all([
      fetchDocuments(),
      fetchData()
    ]).catch(err => {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados");
    });
  }, [fetchData]);

  // Recarregar documentos quando os filtros mudarem
  useEffect(() => {
    fetchDocuments();
  }, [metadataFilters]);

  // Recarregar dados quando a página receber foco
  useEffect(() => {
    function onFocus() {
      Promise.all([
        fetchDocuments(),
        fetchData()
      ]).catch(err => {
        console.error("Erro ao recarregar dados:", err);
      });
    }

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  async function fetchDocuments() {
    try {
      if (!loading) setReloading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar documentos");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/content`);
      if (!response.ok) throw new Error("Erro ao baixar arquivo");

      const data = await response.json();
      const content = data.content;

      // Criar blob e fazer download
      const blob = new Blob([content], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar:", err);
      alert("Erro ao baixar arquivo");
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar documento");
      }

      await fetchDocuments();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar documento");
    }
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedDocs.map(docId =>
          fetch(`/api/documents/${docId}`, {
            method: "DELETE"
          })
        )
      );
      await fetchDocuments();
      setSelectedDocs([]);
    } catch (err) {
      console.error("Erro ao deletar documentos:", err);
      alert("Erro ao deletar documentos");
    }
  };

  // Separar documentos em selecionados e não selecionados
  const selectedDocuments = documents.filter(doc => selectedDocs.includes(doc.id));
  const nonSelectedDocuments = documents.filter(doc => !selectedDocs.includes(doc.id));

  // Aplicar filtros apenas nos documentos não selecionados
  const filteredNonSelectedDocuments = nonSelectedDocuments.filter(doc => {
    // Se não há filtros ativos, mostrar todos
    if (Object.keys(metadataFilters).length === 0) return true;

    // Verificar cada filtro
    return Object.entries(metadataFilters).every(([key, value]) => {
      if (!value) return true;

      // Filtro de documentos
      if (key === 'tipo' && value === 'documento') {
        return doc.metadata?.['tipo'] !== 'filtro';
      }

      // Filtro de filtros
      if (key === 'tipo' && value === 'filtro') {
        return doc.metadata?.['tipo'] === 'filtro';
      }

      // Filtro de ferramentas
      if (key === 'hasFerramentas') {
        return doc.metadata?.['Ferramenta'] !== undefined && 
               doc.metadata?.['Ferramenta'] !== '';
      }

      // Outros filtros de metadados
      return doc.metadata?.[key] === value;
    });
  });

  // Combinar documentos selecionados com documentos filtrados
  const filteredDocuments = [...selectedDocuments, ...filteredNonSelectedDocuments];

  // Contadores para os botões (não mudam com a seleção)
  const totalDocuments = documents.filter(doc => doc.metadata?.['tipo'] !== 'filtro').length;
  const totalFilters = documents.filter(doc => doc.metadata?.['tipo'] === 'filtro').length;
  const totalWithTools = documents.filter(doc => 
    doc.metadata?.['Ferramenta'] !== undefined && 
    doc.metadata?.['Ferramenta'] !== ''
  ).length;

  // Função para verificar se um filtro está ativo
  const isFilterActive = (filterType: string, value: string) => {
    return metadataFilters[filterType] === value;
  };

  if (loading) {
    return <div className="container mx-auto p-4">Carregando documentos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciador de Documentos</h1>
        <div className="flex gap-2">
          {selectedDocs.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar Selecionados ({selectedDocs.length})
            </Button>
          )}
          <Button
            onClick={() => router.push("/gerenciador/upload" as any)}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Área de Filtros - Agora sempre visível */}
      <div className="bg-white rounded-lg p-4 border space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {Object.keys(metadataFilters).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMetadataFilters({})}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
        <MetadataEditor
          metadata={metadataFilters}
          onChange={setMetadataFilters}
          existingMetadata={existingMetadata}
        />
      </div>

      {/* Estatísticas e Filtros Rápidos */}
      <div className="flex gap-8 mb-6">
        <Button
          variant="outline"
          onClick={handleShowAllDocuments}
          className={`flex-1 h-auto py-4 ${
            metadataFilters['tipo'] === 'documento' ? 'border-blue-600 bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-blue-600">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-600">Total de Documentos</h3>
              <p className="text-2xl font-bold">{totalDocuments}</p>
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={handleShowAllFilters}
          className={`flex-1 h-auto py-4 ${
            metadataFilters['tipo'] === 'filtro' ? 'border-purple-600 bg-purple-50' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-purple-600">
              <Filter className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-600">Total de Filtros</h3>
              <p className="text-2xl font-bold">{totalFilters}</p>
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={handleShowByTool}
          className={`flex-1 h-auto py-4 ${
            metadataFilters['hasFerramentas'] ? 'border-green-600 bg-green-50' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-green-600">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-600">Ferramenta</h3>
              <p className="text-2xl font-bold">{totalWithTools}</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-8 p-4">
                <Checkbox
                  isSelected={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onValueChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cliente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ferramenta</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr 
                key={doc.id} 
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  selectedDocs.includes(doc.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="w-8 p-4">
                  <Checkbox
                    isSelected={selectedDocs.includes(doc.id)}
                    onValueChange={() => handleSelectDoc(doc.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {doc.metadata?.tipo === 'filtro' ? (
                      <Filter className="w-4 h-4 text-purple-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm font-medium">{doc.name || ''}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{doc.metadata?.['cliente'] || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{formatDate(doc.created_at || new Date())}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.metadata?.['tipo'] === 'filtro' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {doc.metadata?.['tipo'] === 'filtro' ? 'Filtro' : 'Documento'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{doc.metadata?.['Ferramenta'] || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensagem quando não há documentos */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum documento encontrado
          {Object.keys(metadataFilters).length > 0 && " com os filtros selecionados"}
        </div>
      )}
    </div>
  );
} 
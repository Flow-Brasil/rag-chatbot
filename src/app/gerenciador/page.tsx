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
import { metadataService } from "@/lib/services/metadata";
import { MetadataClusters } from "@/components/metadata/MetadataClusters";
import type { Document } from "../../types/documents";

// Função para formatar data de forma consistente
function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

type MetadataFilters = Record<string, string>;

// Função para verificar se um documento é um filtro
function isFilterDocument(doc: Document): boolean {
  const tipoValues = doc.metadata['tipo'] || [];
  const scopeValues = doc.metadata['scope'] || [];

  // Verifica se o tipo no metadata é "filtro"
  if (tipoValues.some(value => value.toLowerCase() === 'filtro')) {
    return true;
  }
  
  // Verificações secundárias (fallback)
  const isFilterByName = doc.name.toLowerCase().includes('filtro') || 
                        doc.name.toLowerCase().includes('filter');
  const isFilterByScope = scopeValues.some(value => 
    value.toLowerCase().includes('filtro') || 
    value.toLowerCase().includes('filter')
  );
  
  return isFilterByName || isFilterByScope;
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
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para filtros de metadados
  const [metadataFilters, setMetadataFilters] = useState<MetadataFilters>({});
  const [existingMetadata, setExistingMetadata] = useState<Record<string, string[]>>({});

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
      
      // Extrair metadados usando o serviço
      const metadataMap = metadataService.extractMetadataValues(data.documents);
      setExistingMetadata(Object.fromEntries(metadataMap));
      
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
  const filteredNonSelectedDocuments = metadataService.filterDocuments(
    nonSelectedDocuments, 
    metadataFilters
  );

  // Combinar documentos selecionados com documentos filtrados sem limite
  const filteredDocuments = [...selectedDocuments, ...filteredNonSelectedDocuments];

  // Contadores para os botões (não mudam com a seleção)
  const totalDocuments = documents.filter(doc => {
    const tipoValues = doc.metadata['tipo'] || [];
    return !tipoValues.some(value => value === 'filtro');
  }).length;

  const totalFilters = documents.filter(doc => {
    const tipoValues = doc.metadata['tipo'] || [];
    return tipoValues.some(value => value === 'filtro');
  }).length;

  const totalWithTools = documents.filter(doc => {
    const ferramentaValues = doc.metadata['Ferramenta'] || [];
    return ferramentaValues.length > 0;
  }).length;

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
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/gerenciador/upload")}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Área de Filtros */}
      {showFilters && (
        <Card className="p-4">
          <MetadataClusters
            documents={documents}
            onFilterChange={(key, value) => {
              const newFilters = { ...metadataFilters };
              if (value) {
                newFilters[key] = value;
              } else {
                delete newFilters[key];
              }
              setMetadataFilters(newFilters);
            }}
            activeFilters={metadataFilters}
          />
        </Card>
      )}

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(doc.created_at)}
                </p>
                {/* Metadados */}
                <div className="mt-2 space-y-1">
                  {doc.metadata && Object.entries(doc.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs text-gray-600">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc.id, doc.name)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
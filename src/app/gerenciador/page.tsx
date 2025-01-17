"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, UsersIcon, UploadIcon, CalendarIcon, FilterIcon, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox, Select, SelectItem } from "@nextui-org/react";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { MetadataEditor } from "@/components/selectors/MetadataEditor";
import type { Cliente } from "@/lib/api/clientes";

// Função para formatar data de forma consistente
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

interface Document {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
  metadata: {
    scope?: string;
    tipo?: string;
    cliente?: string;
    [key: string]: string | undefined;
  };
  created_at: string;
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
  const [metadataFilters, setMetadataFilters] = useState<{ [key: string]: string }>({});
  const [existingMetadata, setExistingMetadata] = useState<{[key: string]: Set<string>}>({});

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

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    // Se não houver metadata no documento, não passa no filtro
    if (!doc.metadata) return false;

    // Se não houver filtros ativos, mostrar todos os documentos
    if (Object.keys(metadataFilters).length === 0) return true;

    // Agrupar filtros por chave (ex: todos os valores de "cliente" juntos)
    const filterGroups = new Map<string, Set<string>>();
    
    Object.entries(metadataFilters).forEach(([key, value]) => {
      if (!value) return; // Ignorar valores vazios
      
      const baseKey = key.split('_')[0]; // Remove sufixo numérico
      if (!filterGroups.has(baseKey)) {
        filterGroups.set(baseKey, new Set<string>());
      }
      const group = filterGroups.get(baseKey);
      if (group && typeof value === 'string') {
        group.add(value);
      }
    });

    // Se não há grupos de filtros, mostrar o documento
    if (filterGroups.size === 0) return true;

    // Verificar cada grupo de filtros
    for (const [key, values] of Array.from(filterGroups.entries())) {
      // Se não há valores para verificar nesta chave, continua para o próximo grupo
      if (values.size === 0) continue;

      // Verificar se o documento tem um valor válido para esta chave
      const docValue = doc.metadata[key];
      if (!docValue || typeof docValue !== 'string') return false;

      // Se o valor do documento não está entre os valores filtrados, não passa no filtro
      if (!values.has(docValue)) return false;
    }

    // Se passou por todos os filtros, mostra o documento
    return true;
  });

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

      {/* Lista de Documentos */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Documentos</h2>
          <div className="flex items-center gap-2">
            {reloading && (
              <span className="text-sm text-gray-500">Atualizando...</span>
            )}
            {selectedDocs.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Selecionados ({selectedDocs.length})
              </Button>
            )}
          </div>
        </div>

        {/* Cabeçalho da Lista */}
        <div className="flex items-center gap-4 p-2 bg-gray-50 rounded">
          <Checkbox
            isSelected={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
            isIndeterminate={selectedDocs.length > 0 && selectedDocs.length < filteredDocuments.length}
            onValueChange={handleSelectAll}
          />
          <div className="flex-1 grid grid-cols-5 gap-4">
            <span className="font-medium">Nome</span>
            <span className="font-medium">Cliente</span>
            <span className="font-medium">Status</span>
            <span className="font-medium">Data</span>
            <span className="font-medium">Ações</span>
          </div>
        </div>

        {/* Lista de Documentos */}
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded">
            <Checkbox
              isSelected={selectedDocs.includes(doc.id)}
              onValueChange={() => handleSelectDoc(doc.id)}
            />
            <div className="flex-1 grid grid-cols-5 gap-4">
              <span className="truncate">{doc.name}</span>
              <span className="truncate">{doc.metadata?.cliente || "-"}</span>
              <span>{doc.status}</span>
              <span>{doc.created_at ? formatDate(doc.created_at) : "-"}</span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(doc.id, doc.name)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Mensagem quando não há documentos */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum documento encontrado
            {Object.keys(metadataFilters).length > 0 && " com os filtros selecionados"}
          </div>
        )}
      </div>
    </div>
  );
} 
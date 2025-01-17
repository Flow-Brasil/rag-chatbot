"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, UsersIcon, UploadIcon, CalendarIcon, FilterIcon } from "lucide-react";
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
    [key: string]: any;
  };
  created_at: string;
}

export default function GerenciadorPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [clientes, setClientes] = useState<{ name: string; documentCount: number }[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para filtros de metadados
  const [metadataFilters, setMetadataFilters] = useState<{ [key: string]: string }>({});

  // Função para carregar clientes
  const fetchClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Erro ao carregar clientes");
      const data = await response.json();
      setClientes(data.clientes || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setClientes([]);
      setError("Erro ao carregar lista de clientes");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar documentos e clientes ao montar o componente
  useEffect(() => {
    Promise.all([
      fetchDocuments(),
      fetchClientes()
    ]).catch(err => {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados");
    });
  }, [fetchClientes]);

  async function fetchDocuments() {
    try {
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

  // Função para filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    // Filtro por cliente
    if (selectedClient && (!doc.metadata?.cliente || doc.metadata.cliente !== selectedClient)) {
      return false;
    }

    // Filtro por metadados
    for (const [key, value] of Object.entries(metadataFilters)) {
      if (!doc.metadata || doc.metadata[key] !== value) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return <div className="container mx-auto p-4">Carregando documentos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciador de Documentos</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          <Button
            onClick={() => router.push("/gerenciador/upload")}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="space-y-4">
          {/* Seletor de Cliente */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <IntelligentSelector
              clientes={clientes}
              selectedCliente={selectedClient}
              onClientSelect={setSelectedClient}
              onInputChange={setInputValue}
              isLoading={loadingClientes}
              placeholder="Selecione um cliente para filtrar"
            />
          </div>

          {/* Área de Filtros de Metadados */}
          {showFilters && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Filtros de Metadados</label>
              <MetadataEditor
                metadata={metadataFilters}
                onChange={setMetadataFilters}
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
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
            {Object.keys(metadataFilters).length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setMetadataFilters({})}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista de Documentos */}
      <div className="space-y-4">
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
              <span>{formatDate(doc.created_at)}</span>
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
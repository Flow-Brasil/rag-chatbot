"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, UsersIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@nextui-org/react";
import { ClientSelector } from "../chat/clientes/_components/ClientSelector";

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
  const [clientes, setClientes] = useState<{ id: string; name: string; documentCount: number }[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    fetchDocuments();
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      setLoadingClientes(true);
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Erro ao carregar clientes");
      const data = await response.json();
      const clientesWithIds = (data.clientes || []).map((cliente: any) => ({
        ...cliente,
        id: cliente.name
      }));
      setClientes(clientesWithIds);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }

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

  const filteredDocuments = documents.filter(doc => 
    !selectedClient || doc.metadata?.cliente === selectedClient
  );

  if (loading) {
    return <div className="container mx-auto p-4">Carregando documentos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold">Gerenciador de Documentos</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-[300px]">
            <ClientSelector
              clientes={clientes}
              selectedCliente={selectedClient}
              inputValue={inputValue}
              onClientSelect={(clientName) => setSelectedClient(clientName)}
              onInputChange={setInputValue}
              onCreateNewClient={(clientName) => {
                router.push(`/gerenciador/upload?cliente=${encodeURIComponent(clientName)}`);
              }}
              isLoading={loadingClientes}
            />
          </div>
          
          {filteredDocuments.length > 0 && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedDocs.length === filteredDocuments.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
              
              {selectedDocs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Deletar Selecionados ({selectedDocs.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <Checkbox
                  isSelected={selectedDocs.includes(doc.id)}
                  onValueChange={() => handleSelectDoc(doc.id)}
                />
                <div>
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="text-sm text-gray-600">
                    Criado em: {formatDate(doc.created_at)}
                  </p>
                  {doc.metadata?.scope && (
                    <p className="text-sm text-gray-600">
                      Escopo: {doc.metadata.scope}
                    </p>
                  )}
                  {doc.metadata?.tipo && (
                    <p className="text-sm text-gray-600">
                      Tipo: {doc.metadata.tipo}
                    </p>
                  )}
                  {doc.metadata?.cliente && (
                    <p className="text-sm text-gray-600">
                      Cliente: {doc.metadata.cliente}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(doc.id, doc.name)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
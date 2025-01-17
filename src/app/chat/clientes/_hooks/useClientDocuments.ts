'use client';

import { useState, useEffect, useCallback } from 'react';

interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    [key: string]: any;
  };
  created_at: string;
}

interface Cliente {
  name: string;
  documentCount: number;
}

export function useClientDocuments(selectedCliente: string | null) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar lista de clientes
  useEffect(() => {
    async function loadClientes() {
      try {
        const response = await fetch("/api/documents");
        if (response.ok) {
          const data = await response.json();
          // Extrair clientes únicos dos documentos e contar documentos
          const clientesMap = new Map<string, number>();
          data.documents?.forEach((doc: Document) => {
            if (doc.metadata?.cliente) {
              clientesMap.set(doc.metadata.cliente, (clientesMap.get(doc.metadata.cliente) || 0) + 1);
            }
          });
          
          // Converter para array de clientes com contagem
          const clientesArray = Array.from(clientesMap.entries()).map(([name, count]) => ({
            name,
            documentCount: count
          }));
          
          setClientes(clientesArray);
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    loadClientes();
  }, []);

  // Carregar documentos do cliente selecionado
  const loadClienteDocuments = useCallback(async () => {
    if (!selectedCliente) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        const docs = data.documents?.filter(
          (doc: Document) => doc.metadata?.cliente === selectedCliente
        ) || [];
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCliente]);

  useEffect(() => {
    loadClienteDocuments();
  }, [selectedCliente, loadClienteDocuments]);

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocuments(prev => {
      // Se já está selecionado, remove
      if (prev.some(d => d.id === doc.id)) {
        return prev.filter(d => d.id !== doc.id);
      }
      // Se não, adiciona
      return [...prev, doc];
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir documento");
      }

      // Atualiza a lista de documentos
      await loadClienteDocuments();

      // Remove o documento da seleção se estiver selecionado
      setSelectedDocuments(prev => prev.filter(doc => doc.id !== docId));

      return true;
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      return false;
    }
  };

  return {
    documents,
    selectedDocuments,
    clientes,
    loading,
    handleDocumentSelect,
    handleDeleteDocument,
    setSelectedDocuments,
    loadClienteDocuments
  };
} 
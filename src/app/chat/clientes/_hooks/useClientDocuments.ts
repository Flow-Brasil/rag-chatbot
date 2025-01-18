'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Document } from "@/types/documents";
import { metadataService } from "@/lib/services/metadata";

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
          // Extrair metadados usando o serviço
          const metadata = metadataService.extractMetadataValues(data.documents);
          const clientesSet = metadata['cliente'] || [];
          
          // Contar documentos por cliente
          const clientesArray = clientesSet.map(name => ({
            name,
            documentCount: data.documents.filter(
              (doc: Document) => doc.metadata['cliente']?.includes(name)
            ).length
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
        // Filtrar documentos pelo cliente selecionado usando o serviço
        const docs = metadataService.filterDocuments(
          data.documents,
          { cliente: selectedCliente }
        );
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
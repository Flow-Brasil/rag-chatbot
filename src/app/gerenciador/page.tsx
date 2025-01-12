"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Edit } from "lucide-react";
import { UploadModal } from "@/components/UploadModal";
import { EditDocumentModal } from "@/components/EditDocumentModal";

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
    autor?: string;
  };
  created_at: string;
}

export default function GerenciadorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const handleUpload = async (file: File, metadata: Record<string, any>) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo");
      }

      await fetchDocuments();
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (id: string, updates: { name: string; metadata: Record<string, any> }) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar documento");
      }

      await fetchDocuments();
      setIsEditModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      console.error("Erro ao editar:", err);
      alert("Erro ao atualizar documento");
    } finally {
      setSaving(false);
    }
  };

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

  const openEditModal = (document: Document) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Carregando documentos...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gerenciador de Arquivos</h1>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-600">Status: {doc.status}</p>
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
                {doc.metadata?.autor && (
                  <p className="text-sm text-gray-600">
                    Autor: {doc.metadata.autor}
                  </p>
                )}
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
                onClick={() => openEditModal(doc)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
              >
                <Edit className="w-4 h-4" />
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

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />

      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDocument(null);
        }}
        onSave={handleEdit}
        document={selectedDocument}
        saving={saving}
      />
    </div>
  );
} 
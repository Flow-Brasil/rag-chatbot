"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Document {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
  metadata: {
    scope?: string;
  };
}

export function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) {
      return;
    }

    setDeleting(documentId);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar documento");
      }

      // Atualiza a lista após deletar
      await fetchDocuments();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar documento");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div>Carregando documentos...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">{doc.name}</h3>
              {doc.metadata?.scope && (
                <div>
                  <p className="text-sm text-gray-600">Escopo: {doc.metadata.scope}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => handleDelete(doc.id)}
              disabled={deleting === doc.id}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            onClick={() => router.push(`/chat/${doc.id}`)}
            className="w-full"
          >
            Conversar sobre este documento
          </Button>
        </Card>
      ))}
    </div>
  );
} 
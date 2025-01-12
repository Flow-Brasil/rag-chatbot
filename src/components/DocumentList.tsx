"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
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

    fetchDocuments();
  }, []);

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
          <h3 className="font-semibold">{doc.name}</h3>
          <p>Status: {doc.status}</p>
          <p>Chunks: {doc.chunk_count}</p>
          {doc.metadata?.scope && (
            <div>
              <p>Escopo: {doc.metadata.scope}</p>
            </div>
          )}
          <Button 
            onClick={() => router.push(`/chat/${doc.id}`)}
            className="w-full mt-4"
          >
            Conversar sobre este documento
          </Button>
        </Card>
      ))}
    </div>
  );
} 
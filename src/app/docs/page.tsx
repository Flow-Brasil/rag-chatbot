"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Falha ao carregar documentos");
        const data = await response.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("Erro ao carregar documentos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Carregando documentos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Documentos Disponíveis</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4">
            <h2 className="mb-2 text-xl font-semibold">{doc.name}</h2>
            <div className="mb-4 text-sm text-gray-600">
              <p>ID: {doc.id}</p>
              <p>Status: {doc.status}</p>
              <p>Chunks: {doc.chunk_count}</p>
              {doc.metadata?.scope && <p>Escopo: {doc.metadata.scope}</p>}
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
    </div>
  );
} 
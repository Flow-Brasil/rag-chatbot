"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatClientesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    // Carregar contagem de documentos de clientes
    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas documentos que têm metadata.cliente
          const clientesDocs = data.documents?.filter((doc: any) => doc.metadata?.cliente) || [];
          setDocumentCount(clientesDocs.length);
        }
      } catch (error) {
        console.error("Erro ao carregar documentos:", error);
      }
    }
    loadDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages
        })
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagem");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/chat")}
          className="mr-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Chat de Clientes</h1>
      </div>

      <Card className="p-4 mb-4">
        <p className="text-sm text-gray-600">
          Base de conhecimento: {documentCount} documento{documentCount !== 1 ? 's' : ''} de cliente{documentCount !== 1 ? 's' : ''} disponíve{documentCount !== 1 ? 'is' : 'l'}
        </p>
      </Card>

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-center p-4">
            <p>Gerando resposta...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 p-2 border rounded-lg"
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          Enviar
        </Button>
      </form>
    </div>
  );
} 
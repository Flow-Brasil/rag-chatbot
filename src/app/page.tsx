"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">RAG Chatbot</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        Um chatbot inteligente que usa RAG (Retrieval Augmented Generation) para responder perguntas baseadas em documentos.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={() => router.push("/chat")}
          className="text-lg px-8 py-6"
        >
          Ver Documentos
        </Button>
        <Button 
          onClick={() => router.push("/chat/geral")}
          className="text-lg px-8 py-6"
          variant="outline"
        >
          Chat Geral
        </Button>
        <Button 
          onClick={() => router.push("/chat/clientes")}
          className="text-lg px-8 py-6"
          variant="outline"
        >
          Chat Clientes
        </Button>
        <Button 
          onClick={() => router.push("/gerenciador")}
          className="text-lg px-8 py-6"
          variant="secondary"
        >
          Gerenciador de Arquivos
        </Button>
      </div>
    </main>
  );
} 
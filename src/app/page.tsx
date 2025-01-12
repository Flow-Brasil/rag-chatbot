"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">RAG Chatbot</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        Um chatbot inteligente que usa RAG (Retrieval Augmented Generation) para responder perguntas baseadas em documentos.
      </p>
      <Button 
        onClick={() => router.push("/documentos")}
        className="text-lg px-8 py-6"
      >
        Ver Documentos
      </Button>
    </main>
  );
} 
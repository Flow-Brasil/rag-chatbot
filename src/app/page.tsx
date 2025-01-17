"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Settings, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">RAG Chatbot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chat Geral */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Chat Geral</h2>
            </div>
            <p className="text-gray-600">
              Converse com o chatbot sobre todos os documentos disponíveis.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/chat/geral" }}>Acessar Chat Geral</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Chat por Cliente */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Chat por Cliente</h2>
            </div>
            <p className="text-gray-600">
              Consulte documentos específicos de cada cliente.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/chat/clientes" }}>Acessar Chat por Cliente</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Simples */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Upload Simples</h2>
            </div>
            <p className="text-gray-600">
              Faça upload de documentos de forma rápida e simples.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/gerenciador/upload" }}>Fazer Upload</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Customizado */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Upload Customizado</h2>
            </div>
            <p className="text-gray-600">
              Envie documentos com conteúdo personalizado para o chat.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/chat/clientes/upload_customizado" }}>Upload Customizado</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Upload Completo */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Upload Completo</h2>
            </div>
            <p className="text-gray-600">
              Interface avançada para upload com metadados e múltiplos arquivos.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/gerenciador/upload_completo" }}>Upload Completo</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Gerenciador de Documentos */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Gerenciador</h2>
            </div>
            <p className="text-gray-600">
              Gerencie todos os documentos e metadados do sistema.
            </p>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link href={{ pathname: "/gerenciador" }}>Acessar Gerenciador</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
} 
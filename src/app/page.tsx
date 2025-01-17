"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Settings, Upload, Filter } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          <code className="font-mono font-bold">Ragie</code>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Card de Chat */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Chat</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Converse com seus documentos de forma inteligente.
          </p>
          <Link href="/chat">
            <Button className="w-full">Acessar Chat</Button>
          </Link>
        </Card>

        {/* Card de Documentos */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Documentos</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Gerencie seus documentos e metadados.
          </p>
          <Link href="/gerenciador">
            <Button className="w-full">Gerenciar Documentos</Button>
          </Link>
        </Card>

        {/* Card de Upload */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Upload</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Faça upload de documentos com metadados personalizados.
          </p>
          <Link href="/gerenciador/upload_completo/1">
            <Button className="w-full">Fazer Upload</Button>
          </Link>
        </Card>

        {/* Card de Filtros */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Filter className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Filtros</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Crie e gerencie filtros para seus documentos.
          </p>
          <Link href="/gerir_filtros_doc/1">
            <Button className="w-full">Gerenciar Filtros</Button>
          </Link>
        </Card>

        {/* Card de Configurações */}
        <Card className="p-6 hover:shadow-lg transition-shadow col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Configurações</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Configure as opções do sistema.
          </p>
          <Link href="/configuracoes">
            <Button className="w-full">Acessar Configurações</Button>
          </Link>
        </Card>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
      </div>
    </main>
  );
} 
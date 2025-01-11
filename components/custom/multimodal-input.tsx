"use client";

import { useState, useRef } from "react";
import { ChevronDown, Search, FileSearch, Code, Bot, Database, Upload } from "lucide-react";
import { Button, Tooltip } from "@nextui-org/react";

interface Props {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export function MultimodalInput({ input, setInput, handleSubmit, isLoading }: Props) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({ scope: 'documents' }));
    formData.append('mode', 'fast');

    try {
      const response = await fetch('https://api.ragie.ai/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_RAGIE_API_KEY}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload: ${response.statusText}`);
      }

      const data = await response.json();
      setInput(`✅ Documento "${file.name}" enviado com sucesso!\nID: ${data.document_id}\n\nAguarde alguns segundos e use /docs para verificar o status do processamento.`);
    } catch (error: any) {
      setInput(`❌ Erro ao fazer upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommand = (command: string) => {
    setInput(command + " ");
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Tooltip content={showToolbar ? "Ocultar comandos" : "Mostrar comandos"}>
            <Button
              isIconOnly
              variant="light"
              onClick={() => setShowToolbar(!showToolbar)}
              className="text-default-500"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showToolbar ? 'rotate-180' : ''}`} />
            </Button>
          </Tooltip>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent outline-none"
          />

          <Button 
            isIconOnly 
            type="submit"
            isLoading={isLoading}
            variant="light"
            className="text-default-500"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>

        {showToolbar && (
          <div className="flex gap-2 px-10">
            <Tooltip content="Buscar na documentação da API">
              <Button
                isIconOnly
                variant="light"
                onClick={() => handleCommand("@apirag")}
                className="text-default-500"
              >
                <Search className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Buscar nos documentos">
              <Button
                isIconOnly
                variant="light"
                onClick={() => handleCommand("@ragdoc")}
                className="text-default-500"
              >
                <FileSearch className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Listar documentos">
              <Button
                isIconOnly
                variant="light"
                onClick={() => handleCommand("/docs")}
                className="text-default-500"
              >
                <Database className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Fazer upload de documento">
              <Button
                isIconOnly
                variant="light"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                className="text-default-500"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
            />
          </div>
        )}
      </form>
    </div>
  );
}

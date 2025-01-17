"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, UploadIcon, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { Input } from "@/components/ui/input";
import { useChat } from "../_hooks/useChat";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PendingUpload {
  content: any;
  suggestedName: string;
  awaitingNameConfirmation: boolean;
}

interface DocumentContent {
  titulo?: string;
  title?: string;
  nome?: string;
  name?: string;
  conteudo?: string;
  content?: string;
  texto?: string;
  text?: string;
}

export default function UploadCustomizadoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteFromUrl = searchParams.get("cliente");

  const [clientes, setClientes] = useState<{ name: string; documentCount: number }[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(clienteFromUrl);
  const [inputValue, setInputValue] = useState("");
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(true);

  // Inicializar o hook useChat com mensagem inicial
  const {
    messages,
    input,
    loading,
    setInput,
    handleSubmit,
    setMessages
  } = useChat({
    selectedCliente,
    selectedDocuments: [],
    isUploadMode: true,
    onProcessDocument: async (content) => {
      if (pendingUpload?.awaitingNameConfirmation) {
        await processUpload(content, pendingUpload.suggestedName);
      } else {
        await validateWithAgent(content);
      }
    }
  });

  // Carregar lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true);
        const response = await fetch("/api/clientes");
        if (!response.ok) throw new Error("Erro ao carregar clientes");
        const data = await response.json();
        setClientes(data.clientes || []);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
        setClientes([]);
      } finally {
        setLoadingClientes(false);
      }
    };

    fetchClientes();
  }, []);

  // Inicializar mensagens quando um cliente é selecionado
  useEffect(() => {
    if (selectedCliente) {
      setMessages([{
        role: "assistant",
        content: `Modo de upload ativado para o cliente ${selectedCliente}.\n\nVocê pode enviar o conteúdo do documento em dois formatos:\n\n1. JSON estruturado:\n{\n  "titulo": "Nome do Documento",\n  "conteudo": "Texto do documento aqui"\n}\n\n2. Texto simples:\nO sistema tentará extrair automaticamente o título e o conteúdo do texto.`
      }]);
    }
  }, [selectedCliente, setMessages]);

  // Função para validar o formato do documento
  const validateDocumentFormat = (content: string): { isValid: boolean; error?: string; data?: DocumentContent } => {
    try {
      // Tenta parsear como JSON
      const jsonContent = JSON.parse(content);
      
      // Verifica se tem os campos necessários
      const title = jsonContent.titulo || jsonContent.title || jsonContent.nome || jsonContent.name;
      const text = jsonContent.conteudo || jsonContent.content || jsonContent.texto || jsonContent.text;

      if (!title && !text) {
        return {
          isValid: false,
          error: "O documento deve conter pelo menos um título ou conteúdo. Campos aceitos: titulo/title/nome/name para título, conteudo/content/texto/text para conteúdo."
        };
      }

      return {
        isValid: true,
        data: {
          titulo: title || "Documento sem título",
          conteudo: text || ""
        }
      };
    } catch {
      // Se não for JSON, trata como texto simples
      if (!content.trim()) {
        return {
          isValid: false,
          error: "O conteúdo do documento não pode estar vazio."
        };
      }

      // Extrai as primeiras palavras como título
      const lines = content.split('\n');
      const firstLine = lines[0].trim();
      const title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;

      return {
        isValid: true,
        data: {
          titulo: title,
          conteudo: content
        }
      };
    }
  };

  // Função para validar o documento com o agente
  const validateWithAgent = async (content: string): Promise<boolean> => {
    try {
      // Primeiro valida o formato
      const validation = validateDocumentFormat(content);
      if (!validation.isValid) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `❌ ${validation.error}`
        }]);
        return false;
      }

      // Envia para o agente validar
      const response = await fetch("/api/documents/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: validation.data,
          cliente: selectedCliente
        })
      });

      const data = await response.json();
      
      // Adiciona a resposta do agente ao chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message
      }]);

      if (data.success) {
        // Se o documento é válido, configura o upload pendente
        setPendingUpload({
          content: data.data.content,
          suggestedName: data.data.suggested_name || `${validation.data?.titulo}.json`,
          awaitingNameConfirmation: true
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao validar documento:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Erro ao validar o documento. Por favor, tente novamente."
      }]);
      return false;
    }
  };

  const processUpload = async (content: any, fileName: string) => {
    try {
      // Criar um Blob com o conteúdo JSON
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });
      
      // Criar FormData para upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ cliente: selectedCliente }));

      // Fazer upload do documento
      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Erro ao fazer upload do documento");
      }

      // Adicionar mensagem de sucesso
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ Documento "${fileName}" foi enviado com sucesso!\n\nO documento já está disponível na lista de documentos do cliente.`
      }]);

      // Limpar estado de upload pendente
      setPendingUpload(null);
      
      // Redirecionar para a página de chat após o upload
      router.push(`/chat/clientes?cliente=${encodeURIComponent(selectedCliente!)}`);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Erro ao fazer upload do documento. Por favor, tente novamente."
      }]);
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Upload Customizado</h1>
      </div>

      {/* Cliente Selector */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-[300px]">
          <IntelligentSelector
            clientes={clientes}
            selectedCliente={selectedCliente}
            onClientSelect={(clientName) => {
              setSelectedCliente(clientName);
            }}
            onInputChange={setInputValue}
            onCreateNewClient={(clientName) => {
              router.push(`/gerenciador/upload?cliente=${encodeURIComponent(clientName)}`);
            }}
            isLoading={loadingClientes}
            placeholder="Digite para buscar ou adicionar um cliente"
          />
        </div>
      </div>

      {/* Instruções */}
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você pode enviar o conteúdo em formato JSON estruturado ou texto simples.
          O sistema tentará extrair automaticamente o título e o conteúdo do documento.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Card className="p-4 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "assistant"
                        ? "bg-gray-100"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                    <p>Processando...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !selectedCliente
                  ? "Selecione um cliente primeiro..."
                  : "Cole o conteúdo do documento aqui..."
              }
              disabled={!selectedCliente}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || !selectedCliente}
            >
              <UploadIcon className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
} 
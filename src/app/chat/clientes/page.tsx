"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { Checkbox } from "@nextui-org/react";
import { Input } from "@/components/ui/input";
import { useChat } from "./_hooks/useChat";
import type { Cliente } from "@/lib/api/clientes";

interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    [key: string]: any;
  };
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<{ name: string; documentCount: number }[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [clienteDocuments, setClienteDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
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
    selectedDocuments
  });

  // Função para carregar clientes
  const fetchClientes = useCallback(async () => {
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
  }, []);

  // Efeito para inicializar mensagens após carregar clientes
  useEffect(() => {
    if (!loadingClientes) {
      if (clientes.length === 0) {
        setMessages([{
          role: "assistant",
          content: "Não há clientes cadastrados ainda. Você pode criar um novo cliente digitando o nome desejado."
        }]);
      } else {
        setMessages([{
          role: "assistant",
          content: "👋 Bem-vindo! Selecione um cliente para começar."
        }]);
      }
    }
  }, [loadingClientes, clientes.length, setMessages]);

  // Carregar lista de clientes ao montar o componente
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Carregar documentos do cliente selecionado
  const loadClienteDocuments = useCallback(async () => {
    if (!selectedCliente) {
      setClienteDocuments([]);
      return;
    }

    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Erro ao carregar documentos");
      const data = await response.json();
      const docs = data.documents?.filter(
        (doc: Document) => doc.metadata?.cliente === selectedCliente
      ) || [];
      setClienteDocuments(docs);

      // Feedback baseado no número de documentos
      setMessages([{
        role: "assistant",
        content: docs.length === 0
          ? `O cliente ${selectedCliente} ainda não possui documentos. Use o botão "Upload Customizado" para adicionar documentos.`
          : `Encontrei ${docs.length} documento${docs.length > 1 ? 's' : ''} para ${selectedCliente}. Selecione os documentos que deseja consultar.`
      }]);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      setClienteDocuments([]);
      setMessages([{
        role: "assistant",
        content: "❌ Erro ao carregar documentos. Por favor, tente novamente mais tarde."
      }]);
    }
  }, [selectedCliente, setMessages]);

  useEffect(() => {
    loadClienteDocuments();
  }, [selectedCliente, loadClienteDocuments]);

  const handleDocumentSelect = (doc: Document) => {
    const newSelection = selectedDocuments.some(d => d.id === doc.id)
      ? selectedDocuments.filter(d => d.id !== doc.id)
      : [...selectedDocuments, doc];
    
    setSelectedDocuments(newSelection);

    // Feedback sobre a seleção
    if (newSelection.length > 0) {
      setMessages(prev => [
        ...prev.filter(m => m.role !== "assistant" || !m.content.includes("selecionado")),
        {
          role: "assistant",
          content: `${newSelection.length} documento${newSelection.length > 1 ? 's' : ''} selecionado${newSelection.length > 1 ? 's' : ''}. Você pode fazer perguntas sobre ${newSelection.length > 1 ? 'eles' : 'ele'} agora.`
        }
      ]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="p-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Chat por Cliente</h1>
      </div>

      {/* Cliente Selector */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-[300px]">
          <IntelligentSelector
            clientes={clientes}
            selectedCliente={selectedCliente}
            onClientSelect={(clientName) => {
              setSelectedCliente(clientName);
              setSelectedDocuments([]);
              setMessages([{
                role: "assistant",
                content: `Cliente ${clientName} selecionado. Aguarde enquanto carrego os documentos...`
              }]);
            }}
            onInputChange={setInputValue}
            onCreateNewClient={(clientName) => {
              router.push(`/gerenciador/upload?cliente=${encodeURIComponent(clientName)}`);
            }}
            isLoading={loadingClientes}
            placeholder="Digite para buscar ou adicionar um cliente"
          />
        </div>
        {selectedCliente && (
          <Button
            variant="outline"
            onClick={() => router.push(`/chat/clientes/upload_customizado?cliente=${encodeURIComponent(selectedCliente)}`)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Customizado
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[350px_1fr] gap-4 min-h-0">
        {/* Documents List */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Documentos do Cliente</h2>
            <span className="text-sm text-gray-500">
              {selectedDocuments.length} selecionado{selectedDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {clienteDocuments.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  {loadingClientes 
                    ? "Carregando..."
                    : selectedCliente 
                      ? "Nenhum documento encontrado para este cliente"
                      : "Selecione um cliente para ver seus documentos"}
                </div>
              ) : (
                clienteDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-2 rounded-lg flex items-start gap-2 hover:bg-gray-50 transition-colors ${
                      selectedDocuments.some(d => d.id === doc.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Checkbox
                      isSelected={selectedDocuments.some(d => d.id === doc.id)}
                      onValueChange={() => handleDocumentSelect(doc)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="p-4 flex flex-col">
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
                    <p>Digitando...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                !selectedCliente
                  ? "Selecione um cliente primeiro..."
                  : selectedDocuments.length === 0
                  ? "Selecione documentos para iniciar o chat..."
                  : "Digite sua mensagem..."
              }
              disabled={!selectedCliente || selectedDocuments.length === 0}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || !selectedCliente || selectedDocuments.length === 0}
            >
              <MessageSquareIcon className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
} 
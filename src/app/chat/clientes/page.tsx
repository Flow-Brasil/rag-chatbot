"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileIcon, XIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface PendingUpload {
  content: any;
  suggestedName: string;
  awaitingNameConfirmation: boolean;
}

export default function ChatClientesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [clienteDocuments, setClienteDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

  const loadClienteDocuments = useCallback(async () => {
    if (!selectedCliente) {
      setClienteDocuments([]);
      return;
    }

    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        const docs = data.documents?.filter(
          (doc: Document) => doc.metadata?.cliente === selectedCliente
        ) || [];
        setClienteDocuments(docs);
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  }, [selectedCliente]);

  // Carregar lista de clientes
  useEffect(() => {
    async function loadClientes() {
      try {
        const response = await fetch("/api/documents");
        if (response.ok) {
          const data = await response.json();
          // Extrair clientes únicos dos documentos
          const clientesSet = new Set<string>();
          data.documents?.forEach((doc: Document) => {
            if (doc.metadata?.cliente) {
              clientesSet.add(doc.metadata.cliente);
            }
          });
          setClientes(Array.from(clientesSet));
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }
    loadClientes();
  }, []);

  // Carregar documentos do cliente selecionado
  useEffect(() => {
    loadClienteDocuments();
  }, [selectedCliente, loadClienteDocuments]);

  // Função para validar o JSON com o agente
  const validateWithAgent = async (jsonContent: string): Promise<boolean> => {
    try {
      // Tenta extrair um JSON válido do texto ou envia o texto como está
      let contentToSend = jsonContent;
      try {
        // Se for um JSON válido, mantém como está
        JSON.parse(jsonContent);
      } catch {
        // Se não for um JSON válido, envia o texto puro para o agente tentar corrigir
        contentToSend = jsonContent;
      }

      const response = await fetch("http://localhost:10000/api/documents/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToSend,
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
        // Se o JSON é válido ou foi corrigido, configura o upload pendente
        setPendingUpload({
          content: data.data.content,
          suggestedName: data.data.suggested_name,
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

  // Iniciar modo de upload
  const startUploadMode = () => {
    if (!selectedCliente) {
      alert("Por favor, selecione um cliente primeiro");
      return;
    }
    setIsUploadMode(true);
    setMessages([{
      role: "assistant",
      content: `Modo de upload ativado para o cliente ${selectedCliente}.\n\nPor favor, envie o conteúdo do documento. Você pode enviar:\n\n1. Um JSON no formato:\n{\n  "titulo": "Nome do Documento",\n  "conteudo": "Texto do documento aqui"\n}\n\n2. Ou qualquer outro formato de JSON que contenha campos como title, content, text, etc. O agente tentará extrair e formatar automaticamente.`
    }]);
  };

  const handleDocumentSelect = (doc: Document) => {
    if (selectedDocuments.some(d => d.id === doc.id)) {
      setSelectedDocuments(selectedDocuments.filter(d => d.id !== doc.id));
    } else {
      setSelectedDocuments([...selectedDocuments, doc]);
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

      // Recarregar documentos do cliente
      await loadClienteDocuments();
      
      // Limpar estado de upload pendente
      setPendingUpload(null);
      
      // Desativar modo de upload
      setIsUploadMode(false);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Erro ao fazer upload do documento. Por favor, tente novamente."
      }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (isUploadMode) {
        if (pendingUpload?.awaitingNameConfirmation) {
          // Se estiver aguardando confirmação do nome
          if (input.toLowerCase() === 'confirmar') {
            // Usuário confirmou o nome sugerido
            await processUpload(pendingUpload.content, pendingUpload.suggestedName);
          } else {
            // Usuário forneceu um novo nome
            const newFileName = input.endsWith('.json') ? input : `${input}.json`;
            await processUpload(pendingUpload.content, newFileName);
          }
        } else {
          // Primeira etapa: validar JSON com o agente
          await validateWithAgent(input);
        }
      } else {
        // Modo chat normal
        if (selectedDocuments.length === 0) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "Por favor, selecione pelo menos um documento para iniciar o chat."
          }]);
          return;
        }

        const response = await fetch("/api/chat/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            history: messages,
            documentIds: selectedDocuments.map(doc => doc.id)
          })
        });

        if (!response.ok) throw new Error("Erro ao enviar mensagem");
        
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Erro:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/chat")}
          className="mr-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          Chat com {selectedCliente || "Cliente"}
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Coluna da esquerda - Lista de documentos do cliente */}
        <div className="col-span-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Documentos do Cliente</h2>
            
            {/* Seletor de Cliente */}
            <select
              className="w-full p-2 mb-4 border rounded"
              value={selectedCliente || ""}
              onChange={(e) => {
                setSelectedCliente(e.target.value || null);
                setIsUploadMode(false);
                setMessages([]);
              }}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente} value={cliente}>
                  {cliente}
                </option>
              ))}
            </select>

            {/* Botão de Upload pelo Chat */}
            {selectedCliente && (
              <Button
                onClick={startUploadMode}
                className="w-full mb-4"
                variant={isUploadMode ? "secondary" : "outline"}
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload pelo Chat
              </Button>
            )}

            {/* Lista de Documentos */}
            <div className="space-y-2">
              {clienteDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedDocuments.some(d => d.id === doc.id)
                      ? "bg-blue-100"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => !isUploadMode && handleDocumentSelect(doc)}
                >
                  <div className="flex items-start">
                    <FileIcon className="w-4 h-4 mt-1 mr-2 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(doc.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna da direita - Chat e documentos selecionados */}
        <div className="col-span-8">
          {/* Documentos Selecionados */}
          {!isUploadMode && (
            <Card className="p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Documentos Selecionados</h2>
                {selectedDocuments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocuments([])}
                  >
                    Limpar seleção
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded"
                  >
                    <FileIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{doc.name}</span>
                    <button
                      onClick={() => handleDocumentSelect(doc)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Área do Chat */}
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
                <pre className="whitespace-pre-wrap">{msg.content}</pre>
              </div>
            ))}
            {loading && (
              <div className="text-center p-4">
                <p>Gerando resposta...</p>
              </div>
            )}
          </div>

          {/* Input do Chat */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isUploadMode
                  ? pendingUpload?.awaitingNameConfirmation
                    ? 'Digite "confirmar" ou forneça um novo nome...'
                    : "Cole o conteúdo JSON aqui..."
                  : selectedDocuments.length > 0 
                    ? "Digite sua pergunta..." 
                    : "Selecione pelo menos um documento para começar"
              }
              className="flex-1 p-2 border rounded-lg"
              disabled={loading || (!isUploadMode && selectedDocuments.length === 0)}
            />
            <Button 
              type="submit" 
              disabled={loading || (!isUploadMode && selectedDocuments.length === 0)}
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 
"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, UploadIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IntelligentSelector } from "@/components/selectors/IntelligentSelector";
import { useChat } from "../_hooks/useChat";

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

interface Document {
  id: string;
  name: string;
  metadata?: {
    cliente?: string;
  };
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

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

  // Carregar lista de documentos
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedCliente) {
        setDocuments([]);
        setLoadingDocuments(false);
        return;
      }

      try {
        setLoadingDocuments(true);
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Erro ao carregar documentos");
        const data = await response.json();
        
        // Filtrar documentos pelo cliente selecionado
        const clientDocs = data.documents?.filter((doc: Document) => 
          doc?.metadata?.cliente === selectedCliente
        ) || [];
        
        setDocuments(clientDocs);
      } catch (err) {
        console.error("Erro ao carregar documentos:", err);
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [selectedCliente]);

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
    // Se estiver vazio
    if (!content.trim()) {
      return {
        isValid: false,
        error: "O conteúdo do documento não pode estar vazio."
      };
    }

    try {
      // Tenta parsear como JSON
      const jsonContent = JSON.parse(content);
      
      // Procura por campos que podem ser o título
      const title = jsonContent.titulo || jsonContent.title || jsonContent.nome || jsonContent.name;
      const text = jsonContent.conteudo || jsonContent.content || jsonContent.texto || jsonContent.text;

      // Se não tem título nem texto, tenta extrair de campos aninhados
      if (!title && !text) {
        // Tenta encontrar em objetos aninhados
        const findInObject = (obj: any, keys: string[]): string | null => {
          for (const key of keys) {
            if (obj[key]) return obj[key];
            // Procura em subobjetos
            for (const prop in obj) {
              if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                const found = findInObject(obj[prop], [key]);
                if (found) return found;
              }
            }
          }
          return null;
        };

        const titleFromNested = findInObject(jsonContent, ['titulo', 'title', 'nome', 'name', 'assunto', 'subject']);
        const textFromNested = findInObject(jsonContent, ['conteudo', 'content', 'texto', 'text', 'body', 'mensagem', 'message']);

        if (!titleFromNested && !textFromNested) {
          return {
            isValid: false,
            error: "O documento deve conter pelo menos um título ou conteúdo. Campos aceitos: titulo/title/nome/name para título, conteudo/content/texto/text para conteúdo."
          };
        }

        return {
          isValid: true,
          data: {
            titulo: titleFromNested || "Documento sem título",
            conteudo: textFromNested || JSON.stringify(jsonContent, null, 2)
          }
        };
      }

      return {
        isValid: true,
        data: {
          titulo: title || "Documento sem título",
          conteudo: text || JSON.stringify(jsonContent, null, 2)
        }
      };
    } catch {
      // Se não for JSON, trata como texto simples
      const lines = content.trim().split('\n');
      const firstLine = lines[0].trim();
      const remainingLines = lines.slice(1).join('\n').trim();
      
      // Extrai título da primeira linha
      const title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
      
      // Se tiver mais linhas, usa como conteúdo, senão usa primeira linha
      const text = remainingLines || firstLine;

      // Cria um objeto JSON com o conteúdo formatado
      const formattedContent = {
        titulo: title,
        conteudo: text
      };

      return {
        isValid: true,
        data: formattedContent
      };
    }
  };

  // Função para validar o documento com o agente
  const validateWithAgent = async (content: string): Promise<boolean> => {
    const currentCliente = selectedCliente;
    if (typeof currentCliente !== 'string' || !currentCliente) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Por favor, selecione um cliente antes de enviar o documento."
      }]);
      return false;
    }

    try {
      // Primeiro valida o formato
      const validation = validateDocumentFormat(content);
      if (!validation.isValid || !validation.data) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `❌ ${validation.error || "Erro ao processar o documento"}`
        }]);
        return false;
      }

      // Garante que o conteúdo seja um JSON válido
      let jsonContent: any;
      try {
        // Se já for um JSON, usa direto
        jsonContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        // Se não for JSON, usa o objeto já validado
        jsonContent = validation.data;
      }

      // Verifica se o conteúdo é válido
      if (!jsonContent || typeof jsonContent !== 'object') {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "❌ O conteúdo do documento não é válido."
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
          content: jsonContent,
          cliente: currentCliente
        })
      });

      if (!response.ok) {
        throw new Error("Erro na validação do documento");
      }

      const data = await response.json();
      
      // Adiciona a resposta do agente ao chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message
      }]);

      if (data.success && validation.data) {
        // Se o documento é válido, configura o upload pendente
        setPendingUpload({
          content: jsonContent,
          suggestedName: data.data?.suggested_name || `${validation.data.titulo}.json`,
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
      if (!selectedCliente) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "❌ Por favor, selecione um cliente antes de fazer upload."
        }]);
        return;
      }

      // Garante que o conteúdo seja um objeto JSON válido
      const jsonContent = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Criar um Blob com o conteúdo JSON
      const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
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

      const uploadResult = await uploadResponse.json();

      // Adicionar mensagem de sucesso
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ Documento "${fileName}" foi enviado com sucesso!\n\nO documento já está disponível na lista.`
      }]);

      // Limpar estado de upload pendente
      setPendingUpload(null);

      // Atualizar a lista de documentos
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Erro ao atualizar lista de documentos");
      const data = await response.json();
      
      // Filtrar documentos pelo cliente selecionado
      const clientDocs = data.documents?.filter((doc: Document) => 
        doc?.metadata?.cliente === selectedCliente
      ) || [];
      
      setDocuments(clientDocs);

    } catch (error) {
      console.error("Erro no upload:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Erro ao fazer upload do documento. Por favor, tente novamente."
      }]);
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="flex h-[calc(100vh-2rem)] gap-4">
        {/* Coluna Lateral - Lista de Documentos */}
        <div className="w-80 flex flex-col gap-4">
          {/* Cliente Selector */}
          <Card className="p-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Cliente</label>
              <IntelligentSelector
                clientes={clientes}
                selectedCliente={selectedCliente}
                onClientSelect={(clientName) => {
                  setSelectedCliente(clientName);
                  if (clientName) {
                    setMessages([{
                      role: "assistant",
                      content: `Cliente ${clientName} selecionado. Você pode enviar o conteúdo do documento agora.`
                    }]);
                  }
                }}
                onInputChange={setInputValue}
                onCreateNewClient={(clientName) => {
                  setSelectedCliente(clientName);
                  setMessages([{
                    role: "assistant",
                    content: `Novo cliente "${clientName}" será criado. Você pode enviar o conteúdo do documento agora.`
                  }]);
                }}
                isLoading={loadingClientes}
                placeholder="Digite para buscar ou criar um cliente"
              />
            </div>
          </Card>

          {/* Lista de Documentos */}
          <Card className="flex-1 p-4">
            <h2 className="text-lg font-semibold mb-4">Documentos do Cliente</h2>
            <div className="h-[calc(100vh-15rem)] overflow-y-auto">
              {loadingDocuments ? (
                <div className="text-center py-4 text-gray-500">
                  Carregando documentos...
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {selectedCliente 
                    ? "Nenhum documento encontrado para este cliente" 
                    : "Selecione um cliente para ver seus documentos"}
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/chat/${doc.id}`)}
                    >
                      <p className="font-medium truncate">{doc.name}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Área Principal - Upload e Chat */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Instruções */}
          <Card className="p-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Instruções de Upload</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Você pode enviar o conteúdo em dois formatos:</p>
                <div className="pl-4">
                  <p>1. <span className="font-medium">JSON estruturado</span>:</p>
                  <pre className="bg-gray-50 p-2 rounded text-xs mt-1">
{`{
  "titulo": "Nome do Documento",
  "conteudo": "Texto do documento aqui"
}`}
                  </pre>
                </div>
                <div className="pl-4 mt-2">
                  <p>2. <span className="font-medium">Texto simples</span>:</p>
                  <p className="text-xs">O sistema extrairá automaticamente o título e o conteúdo.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Chat e Upload */}
          <Card className="flex-1 p-4 flex flex-col">
            {/* Chat Messages */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      !selectedCliente
                        ? "Selecione um cliente primeiro..."
                        : "Cole o conteúdo do documento aqui..."
                    }
                    disabled={!selectedCliente}
                    className="w-full h-[150px] p-3 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {input && (
                    <div className="mt-2 text-xs text-gray-500">
                      {(() => {
                        if (!input.trim()) return null;
                        try {
                          const parsed = JSON.parse(input);
                          const hasRequiredFields = parsed && (
                            (parsed.titulo || parsed.title || parsed.nome || parsed.name) ||
                            (parsed.conteudo || parsed.content || parsed.texto || parsed.text)
                          );
                          return hasRequiredFields 
                            ? "✅ JSON válido com campos necessários" 
                            : "⚠️ JSON válido mas faltam campos necessários";
                        } catch {
                          return "📝 Texto simples detectado";
                        }
                      })()}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={!input.trim() || !selectedCliente || loading}
                  className="h-[150px] px-6 flex flex-col items-center justify-center gap-2"
                >
                  <UploadIcon className="w-6 h-6" />
                  {loading ? "Processando..." : "Enviar"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 
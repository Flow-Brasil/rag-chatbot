'use client';

import { useState, useCallback } from "react";

interface Document {
  id: string;
  name: string;
  metadata: {
    cliente?: string;
    [key: string]: any;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseChatProps {
  selectedCliente: string | null;
  selectedDocuments: Document[];
  isUploadMode?: boolean;
  onProcessDocument?: (content: any) => Promise<void>;
}

export function useChat({
  selectedCliente,
  selectedDocuments,
  isUploadMode = false,
  onProcessDocument
}: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !selectedCliente) return;

    // Adiciona a mensagem do usuário ao chat
    const userMessage: Message = {
      role: "user",
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Se estiver no modo de upload, processa o documento
    if (isUploadMode && onProcessDocument) {
      setLoading(true);
      try {
        await onProcessDocument(input);
      } catch (error) {
        console.error("Erro ao processar documento:", error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "❌ Erro ao processar o documento. Por favor, tente novamente."
        }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Modo chat normal
    if (selectedDocuments.length === 0) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Por favor, selecione pelo menos um documento para consulta."
      }]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/chat/geral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages,
          metadata: {
            client: selectedCliente,
            documentIds: selectedDocuments.map(doc => doc.id),
            documentCount: selectedDocuments.length
          }
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response || "Não encontrei informações relevantes nos documentos selecionados."
      }]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "❌ Erro ao processar sua mensagem. Por favor, tente novamente."
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, selectedCliente, selectedDocuments, isUploadMode, onProcessDocument, messages]);

  return {
    messages,
    input,
    loading,
    setInput,
    handleSubmit,
    setMessages
  };
} 
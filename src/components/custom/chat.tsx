"use client";

import { useEffect, useRef, useState } from "react";
import { type Message } from "@/lib/types/message";
import { Message as MessageComponent } from "./message";
import { MultimodalInput } from "./multimodal-input";
import { useCustomChat } from "@/hooks/useCustomChat";
import { Loader2 } from "lucide-react";
import { ErrorMessage } from "./error-message";

interface ChatProps {
  id?: string;
  initialMessages?: Message[];
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    stop,
    setMessages,
    error
  } = useCustomChat({ id, initialMessages });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      setLastError(error);
      // Limpa o erro após 5 segundos
      const timer = setTimeout(() => setLastError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleRestore = () => {
    // Limpa as mensagens
    setMessages([]);
    // Limpa o input
    setInput("");
    // Limpa o histórico do localStorage
    if (id) {
      const history = localStorage.getItem("chatHistory");
      if (history) {
        try {
          const parsedHistory = JSON.parse(history);
          delete parsedHistory[id];
          localStorage.setItem("chatHistory", JSON.stringify(parsedHistory));
        } catch (error) {
          console.error("Erro ao limpar histórico:", error);
          setLastError("Erro ao limpar histórico do chat");
        }
      }
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {lastError && (
          <div className="mb-4">
            <ErrorMessage error={lastError} />
          </div>
        )}
        {messages.map((message) => (
          <MessageComponent key={message.id} {...message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Digitando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MultimodalInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        onRestore={handleRestore}
      />
    </div>
  );
}

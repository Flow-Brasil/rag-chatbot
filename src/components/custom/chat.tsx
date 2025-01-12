"use client";

import { useEffect, useRef } from "react";
import { Message as AIMessage } from "ai";
import { Message } from "./message";
import { MultimodalInput } from "./multimodal-input";
import { useCustomChat } from "@/hooks/useCustomChat";
import { Loader2 } from "lucide-react";

interface ChatProps {
  id?: string;
  initialMessages?: AIMessage[];
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
    setMessages
  } = useCustomChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        }
      }
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message key={message.id} {...message} />
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

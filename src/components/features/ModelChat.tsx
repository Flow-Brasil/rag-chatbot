"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Card, Spinner } from "@nextui-org/react";
import { useModelChat } from "@/hooks/useModelChat";
import { ModelType } from "@/lib/types/llm";
import { MultimodalInput } from "../../../components/custom/multimodal-input";

interface ModelChatProps {
  defaultModel?: ModelType;
}

export function ModelChat({ 
  defaultModel = "gemini"
}: ModelChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usar a chave do .env por padrão
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  const {
    messages,
    isLoading,
    error,
    sendMessage,
  } = useModelChat({
    modelType: defaultModel,
    apiKey,
    onError: (error) => console.error("Chat Error:", error)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); // Scroll quando mensagens ou estado de loading mudar

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Card className="mx-auto max-w-3xl rounded-b-none shadow-lg bg-white">
        {/* Área de mensagens com scroll invisível */}
        <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-lg ${
                  m.role === "user" 
                    ? "bg-blue-50 ml-auto text-gray-800" 
                    : "bg-white"
                } max-w-[85%] shadow-sm animate-in fade-in-0 slide-in-from-bottom-5`}
              >
                <p className="text-sm">{m.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center p-2 animate-in fade-in-0">
                <Spinner size="sm" />
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-in fade-in-0 slide-in-from-top-5">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Elemento de referência para o scroll */}
          </div>
        </div>

        {/* Input fixo na parte inferior */}
        <div className="border-t bg-white p-4">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
} 
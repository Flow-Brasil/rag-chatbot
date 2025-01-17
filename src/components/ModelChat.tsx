"use client";

import { useState, useCallback } from 'react';
import { useModelChat } from '@/app/chat/geral/_hooks/useModelChat';
import { useRagieCommands } from '@/app/chat/upload_customizado/_hooks/useRagieCommands';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModelChatProps {
  modelType?: string;
}

export default function ModelChat({ modelType = 'gemini' }: ModelChatProps) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, clearMessages, isLoading } = useModelChat(modelType);
  const { processCommand, isProcessing } = useRagieCommands();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isProcessing) return;

    const currentInput = input.trim();
    setInput('');

    try {
      await sendMessage(currentInput);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      await sendMessage(error instanceof Error ? error.message : 'Erro ao enviar mensagem', {
        role: 'assistant',
        error: true
      });
    }
  }, [input, isLoading, isProcessing, sendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={cn(
              "p-4",
              message.role === 'user' 
                ? 'ml-auto max-w-[80%] bg-primary/10' 
                : message.error 
                  ? 'mr-auto max-w-[80%] bg-destructive/10 text-destructive'
                  : 'mr-auto max-w-[80%] bg-muted'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </Card>
        ))}
        {(isLoading || isProcessing) && (
          <Card className="bg-muted p-4 mr-auto max-w-[80%]">
            <p>Processando...</p>
          </Card>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={isLoading || isProcessing}
            aria-label="Mensagem"
          />
          <Button
            type="submit"
            disabled={isLoading || isProcessing || !input.trim()}
            variant="default"
          >
            Enviar
          </Button>
          <Button
            type="button"
            onClick={clearMessages}
            disabled={isLoading || isProcessing}
            variant="secondary"
          >
            Limpar
          </Button>
        </div>
      </form>
    </div>
  );
} 
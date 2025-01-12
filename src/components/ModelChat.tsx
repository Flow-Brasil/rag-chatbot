import { useState, useCallback } from 'react';
import { useModelChat } from '@/hooks/useModelChat';
import { useRagieCommands } from '@/hooks/useRagieCommands';

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : message.error 
                  ? 'bg-red-50 border border-red-200 mr-auto max-w-[80%] text-red-700'
                  : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {(isLoading || isProcessing) && (
          <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <p>Processando...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded-lg"
            disabled={isLoading || isProcessing}
          />
          <button
            type="submit"
            disabled={isLoading || isProcessing || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={clearMessages}
            disabled={isLoading || isProcessing}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50"
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
} 
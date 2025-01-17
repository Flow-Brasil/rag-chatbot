"use client";

import { type Message } from "@/lib/types/message";
import { useChat } from "ai/react";
import { useCallback, useState, useEffect } from "react";
import { useModelSelection } from "./useModelSelection";
import { createRagieClient } from "@/lib/ragie-client";

interface UseCustomChatProps {
  initialMessages?: Message[];
  id?: string;
}

export function useCustomChat({ initialMessages = [], id }: UseCustomChatProps = {}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: chatSubmit,
    setInput,
    isLoading,
    stop,
    setMessages
  } = useChat({
    initialMessages,
    ...(id ? { id } : {}),
    api: '/api/chat'
  });

  const [error, setError] = useState<string | null>(null);
  const { selectedModel, getModelOptions } = useModelSelection();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [ragieClient, setRagieClient] = useState<any>(null);

  // Inicializa o cliente Ragie
  useEffect(() => {
    const apiKey = process.env['NEXT_PUBLIC_RAGIE_API_KEY'];
    if (apiKey) {
      try {
        const client = createRagieClient(apiKey);
        setRagieClient(client);
      } catch (error) {
        console.error('❌ Erro ao inicializar cliente Ragie:', error);
      }
    }
  }, []);

  // Conecta ao WebSocket do monitor
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channelName = Math.random().toString(36).substring(2);
    const ws = new WebSocket(`ws://localhost:10000/ws?channel=${channelName}`);
    
    ws.onopen = () => {
      console.log('🔌 Conectado ao monitor de chat');
      document.body.setAttribute('data-channel-name', channelName);
    };
    
    ws.onerror = (error) => {
      console.error('❌ Erro na conexão com o monitor:', error);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
      document.body.removeAttribute('data-channel-name');
    };
  }, []);

  // Função para enviar logs para o monitor
  const sendLog = useCallback((data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, [socket]);

  // Função para detectar comandos Ragie
  const detectRagieCommand = (input: string) => {
    const commands = {
      list: /^\/list/i,
      search: /^\/search\s+(.+)/i,
      get: /^\/get\s+(\S+)/i,
      delete: /^\/delete\s+(\S+)/i,
    };

    for (const [command, regex] of Object.entries(commands)) {
      const match = input.match(regex);
      if (match) {
        return {
          command,
          params: match[1]
        };
      }
    }

    return null;
  };

  // Função para executar comandos Ragie
  const executeRagieCommand = async (command: string, params?: string) => {
    if (!ragieClient) {
      throw new Error('Cliente Ragie não inicializado');
    }

    switch (command) {
      case 'list':
        const docs = await ragieClient.listDocuments();
        return docs.length > 0
          ? `📚 Documentos encontrados:\n${docs.map((doc: any) => 
              `- ${doc.metadata?.scope || 'Sem escopo'} (${doc.id})`
            ).join('\n')}`
          : '📭 Nenhum documento encontrado';

      case 'search':
        if (!params) throw new Error('Termo de busca não fornecido');
        const results = await ragieClient.searchDocuments(params);
        const chunks = results.scoredChunks || [];
        return chunks.length > 0
          ? `🔍 Resultados encontrados:\n${chunks.map((chunk: any) =>
              `- ${chunk.documentName} (score: ${chunk.score})\n  ${chunk.text.substring(0, 200)}...`
            ).join('\n\n')}`
          : '🔍 Nenhum resultado encontrado';

      case 'get':
        if (!params) throw new Error('ID do documento não fornecido');
        const doc = await ragieClient.getDocument(params);
        return `📄 Documento encontrado:\nID: ${doc.id}\nStatus: ${doc.status}\nMetadata: ${JSON.stringify(doc.metadata, null, 2)}`;

      case 'delete':
        if (!params) throw new Error('ID do documento não fornecido');
        await ragieClient.deleteDocument(params);
        return '🗑️ Documento deletado com sucesso';

      default:
        throw new Error('Comando não reconhecido');
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<Element>) => {
      e.preventDefault();
      setError(null);

      if (!input.trim()) {
        setError("Por favor, digite uma mensagem");
        return;
      }

      try {
        // Log da mensagem do usuário
        sendLog({
          role: 'user',
          content: input,
          timestamp: new Date().toISOString()
        });

        // Verifica se é um comando Ragie
        const command = detectRagieCommand(input);
        if (command) {
          try {
            const response = await executeRagieCommand(command.command, command.params);
            
            // Adiciona as mensagens ao chat
            setMessages([
              ...messages,
              { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
              { role: 'assistant', content: response, id: `assistant-${Date.now()}` } as Message
            ]);
            setInput('');
            return;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao executar comando';
            setMessages([
              ...messages,
              { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
              { 
                role: 'assistant', 
                content: `❌ **Erro no comando**\n${errorMessage}`, 
                id: `assistant-${Date.now()}`,
                error: true
              } as Message
            ]);
            setInput('');
            return;
          }
        }

        // Processa mensagens normais
        const modelOptions = getModelOptions();
        await chatSubmit(e as React.FormEvent<HTMLFormElement>, {
          data: modelOptions
        });
      } catch (error) {
        console.error("Error sending message:", error);
        // Log do erro
        sendLog({
          role: 'error',
          content: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        });
        
        setMessages([
          ...messages,
          { role: 'user', content: input, id: `user-${Date.now()}` } as Message,
          { 
            role: 'assistant', 
            content: error instanceof Error 
              ? `❌ **Erro ao enviar mensagem**\n${error.message}`
              : '❌ **Erro ao enviar mensagem**\nPor favor, tente novamente.',
            id: `assistant-${Date.now()}`,
            error: true
          } as Message
        ]);
        setInput('');
      }
    },
    [chatSubmit, input, messages, getModelOptions, setMessages, setInput, sendLog, ragieClient]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
    stop,
    setMessages,
    error
  };
} 
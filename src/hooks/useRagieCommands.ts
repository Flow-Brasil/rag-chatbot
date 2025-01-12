import { useState, useCallback } from 'react';
import { createRagieClient } from '@/lib/ragie-client';
import { RetrievalResponse, ScoredChunk } from '@/lib/types/ragie';

export function useRagieCommands() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processCommand = useCallback(async (command: string): Promise<string | null> => {
    setIsProcessing(true);
    try {
      console.log('🤖 Processando comando:', command);
      
      const apiKey = process.env.NEXT_PUBLIC_RAGIE_API_KEY;
      if (!apiKey) {
        console.error('❌ API key não configurada');
        throw new Error('API key do Ragie não configurada');
      }

      console.log('🔑 Usando API key:', apiKey.substring(0, 8) + '...');
      const client = createRagieClient(apiKey);

      if (command === '/docs') {
        console.log('📚 Listando documentos...');
        const documents = await client.listDocuments();
        console.log('📝 Documentos encontrados:', documents);

        if (!documents || documents.length === 0) {
          return "Nenhum documento encontrado.";
        }

        return `Documentos disponíveis:\n\n${documents.map(doc => 
          `- ${doc.name} (${doc.id})`
        ).join('\n')}`;
      }

      if (command === '/upload') {
        return `Para fazer upload de um documento, use um dos comandos:
1. /upload-file [escopo] - Para enviar um arquivo
2. /upload-raw [escopo] [conteúdo] - Para enviar texto diretamente

O escopo é opcional e ajuda a organizar seus documentos.`;
      }

      if (command.startsWith('/search')) {
        const parts = command.split(' ');
        if (parts.length < 3) {
          return "Uso: /search [escopo] [consulta]\nExemplo: /search manuais como fazer backup";
        }

        const scope = parts[1];
        const query = parts.slice(2).join(' ');

        console.log('🔍 Realizando busca:', { scope, query });
        const results: RetrievalResponse = await client.searchDocuments(query, { scope });
        console.log('📝 Resultados encontrados:', results);

        if (!results || !results.scoredChunks || results.scoredChunks.length === 0) {
          return "Nenhum resultado encontrado para sua busca.";
        }

        return `Resultados da busca:\n\n${results.scoredChunks.map((chunk: ScoredChunk, index: number) => 
          `${index + 1}. ${chunk.content} (Score: ${chunk.score})`
        ).join('\n\n')}`;
      }

      if (command.startsWith('/upload-raw')) {
        const parts = command.split(' ');
        if (parts.length < 3) {
          return "Uso: /upload-raw [escopo] [conteúdo]\nExemplo: /upload-raw manuais Este é o conteúdo do documento";
        }

        const scope = parts[1];
        const content = parts.slice(2).join(' ');

        console.log('📝 Enviando conteúdo:', { scope, content });
        const response = await client.uploadRawDocument(content, { scope });
        console.log('✅ Documento criado:', response);

        return `Documento criado com sucesso!\nID: ${response.id}`;
      }

      return `Comando não reconhecido. Comandos disponíveis:
- /docs - Lista todos os documentos
- /upload - Instruções para upload de documentos
- /search [escopo] [consulta] - Busca nos documentos
- /upload-raw [escopo] [conteúdo] - Envia texto como documento`;

    } catch (error) {
      console.error('❌ Erro ao processar comando:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        command
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return `Erro ao processar comando: ${errorMessage}`;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processCommand, isProcessing };
} 
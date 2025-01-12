import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRagieClient } from '@/lib/ragie-client';
import { Ragie } from 'ragie';
import type { RagieDocument } from '@/lib/types/ragie';

// Configurações de runtime e cache
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
}

interface RequestData {
  message: string;
  messages?: any[];
  data?: any;
}

// Função para validar e retornar chave de API
function validateApiKey(key: string | undefined, name: string): string {
  if (!key || key.length < 10) {
    throw new Error(`API key ${name} não configurada ou inválida`);
  }
  return key;
}

// Função para tratar erros da API Ragie
function handleRagieError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Erro de conexão com a API Ragie. Verifique sua conexão com a internet e tente novamente.';
    }
    if (error.message.includes('401')) {
      return 'API key do Ragie inválida ou expirada. Verifique suas configurações.';
    }
    if (error.message.includes('429')) {
      return 'Limite de requisições excedido. Aguarde um momento e tente novamente.';
    }
    if (error.message.includes('5')) {
      return 'Erro interno do servidor Ragie. Tente novamente em alguns instantes.';
    }
    return error.message;
  }
  return 'Erro desconhecido ao processar solicitação';
}

// Função para buscar documentos relevantes
async function searchRelevantDocuments(query: string, client: Ragie) {
  try {
    const response = await client.retrievals.retrieve({
      query,
      filter: {}
    });

    const chunks = response?.scoredChunks || [];
    if (chunks.length === 0) return null;

    // Filtra apenas os chunks mais relevantes (score > 0.7)
    const relevantChunks = chunks
      .filter(chunk => chunk.score > 0.7)
      .slice(0, 3); // Limita a 3 chunks mais relevantes

    if (!relevantChunks.length) return null;

    return relevantChunks.map(chunk => chunk.text).join('\n\n');
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return null;
  }
}

// Função para detectar intenção do usuário
async function detectUserIntent(message: string): Promise<{
  intent: 'list_docs' | 'upload_help' | 'search' | 'general';
  scope?: string;
  query?: string;
}> {
  const lowercaseMsg = message.toLowerCase();
  
  // Detecta intenção de listar documentos
  if (lowercaseMsg.includes('documentos disponíveis') || 
      lowercaseMsg.includes('listar documentos') ||
      lowercaseMsg.includes('quais documentos') ||
      lowercaseMsg.includes('mostrar documentos')) {
    return { intent: 'list_docs' };
  }

  // Detecta intenção de ajuda com upload
  if (lowercaseMsg.includes('como fazer upload') || 
      lowercaseMsg.includes('como enviar') ||
      lowercaseMsg.includes('subir arquivo') ||
      lowercaseMsg.includes('enviar documento') ||
      lowercaseMsg.includes('adicionar arquivo')) {
    return { intent: 'upload_help' };
  }

  // Detecta intenção de busca
  if (lowercaseMsg.includes('procure') || 
      lowercaseMsg.includes('busque') ||
      lowercaseMsg.includes('encontre') ||
      lowercaseMsg.includes('pesquise') ||
      lowercaseMsg.includes('procurar por') ||
      lowercaseMsg.includes('buscar')) {
    return { 
      intent: 'search',
      query: message
    };
  }

  // Intenção geral - busca semântica
  return { 
    intent: 'general',
    query: message
  };
}

export async function POST(req: NextRequest) {
  try {
    const requestData: RequestData = await req.json();
    const { message, messages = [], data } = requestData;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      );
    }

    try {
      const [geminiApiKey, ragieApiKey] = [
        validateApiKey(process.env['NEXT_PUBLIC_GEMINI_API_KEY'], 'Gemini'),
        validateApiKey(process.env['NEXT_PUBLIC_RAGIE_API_KEY'], 'Ragie')
      ];

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const client = createRagieClient(ragieApiKey);

      // Detecta intenção do usuário
      const userIntent = await detectUserIntent(message);

      let relevantDocs = null;
      let additionalContext = '';

      switch (userIntent.intent) {
        case 'list_docs':
          const documents = await client.documents.list({});
          const firstPage = await documents.next();
          const docs = firstPage ? [firstPage] : [];
          additionalContext = docs.length > 0
            ? `Documentos disponíveis:\n${docs.map((doc: any) => {
                const metadata = doc.metadata || {};
                return `- ${metadata.scope || 'Sem escopo'} (${doc.id})`;
              }).join('\n')}`
            : 'Não há documentos disponíveis no momento.';
          break;

        case 'upload_help':
          additionalContext = `Instruções para upload:
1. Você pode enviar arquivos PDF, DOCX, TXT, JSON ou MD
2. Cada documento pode ter um escopo para melhor organização
3. O conteúdo será processado e indexado automaticamente
4. Após o upload, o documento ficará disponível para consulta`;
          break;

        case 'search':
        case 'general':
          relevantDocs = await searchRelevantDocuments(userIntent.query || message, client);
          break;
      }

      // Prompt aprimorado com contexto
      const systemPrompt = `Você é um assistente amigável em português do Brasil que ajuda a responder perguntas com base em documentos.
Seja claro e direto nas respostas. Use as informações disponíveis para dar respostas precisas e úteis.
${additionalContext ? '\nContexto adicional:\n' + additionalContext : ''}
${relevantDocs ? '\nInformações relevantes dos documentos:\n' + relevantDocs : ''}`;
      
      // Manter apenas as últimas 3 mensagens para contexto mais limpo
      const relevantMessages = messages.slice(-3);

      const prompt = [
        systemPrompt,
        ...relevantMessages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`),
        `Human: ${message}`
      ].join('\n');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Adiciona nota sobre documentos encontrados
      const finalResponse = relevantDocs 
        ? `${text}\n\n_Resposta baseada em documentos encontrados na base de conhecimento._`
        : text;

      return NextResponse.json({ response: finalResponse });

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = handleRagieError(error);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
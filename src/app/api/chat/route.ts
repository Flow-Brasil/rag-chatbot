import { NextRequest, NextResponse } from 'next/server';
import { createRagieClient } from '@/lib/ragie-client';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  messages: Message[];
  data?: {
    documentId?: string;
    scope?: string;
  };
}

// Headers de segurança e CORS
const baseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
};

// Função para validar e retornar chave de API
function validateApiKey(key: string | undefined, name: string): string {
  if (!key || key.length < 10) {
    throw new Error(`API key ${name} não configurada ou inválida`);
  }
  return key;
}

export async function POST(req: NextRequest) {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204, 
        headers: baseHeaders 
      });
    }

    // Validar Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser application/json' },
        { status: 415, headers: baseHeaders }
      );
    }

    const requestData: RequestData = await req.json();
    const { message, messages = [], data } = requestData;

    // Validação mais detalhada
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400, headers: baseHeaders }
      );
    }

    // Se a mensagem começar com '/', é um comando do Ragie
    if (message.startsWith('/')) {
      try {
        const ragieApiKey = validateApiKey(process.env['NEXT_PUBLIC_RAGIE_API_KEY'], 'Ragie');
        const client = createRagieClient(ragieApiKey);

        // Processa o comando diretamente aqui em vez de enviar para o modelo
        if (message === '/docs') {
          const documents = await client.listDocuments();
          return NextResponse.json({
            response: documents.length > 0
              ? `Documentos disponíveis:\n\n${documents.map(doc => 
                  `- ${doc.metadata['scope'] || 'Sem escopo'} (${doc.id})`
                ).join('\n')}`
              : 'Nenhum documento encontrado.'
          }, { headers: baseHeaders });
        }

        if (message === '/upload') {
          return NextResponse.json({
            response: `Para fazer upload de um documento, você pode:

1. Enviar um arquivo:
   Anexe um arquivo e use o comando: /upload-file [escopo]
   Exemplo: /upload-file meu-escopo

2. Enviar conteúdo raw:
   Use o comando: /upload-raw [escopo] [conteúdo]
   Exemplo: /upload-raw meu-escopo "Meu conteúdo aqui"

Tipos de arquivo suportados:
- PDF
- DOCX
- TXT
- JSON
- MD (Markdown)`
          }, { headers: baseHeaders });
        }

        if (message.startsWith('/search')) {
          const match = message.match(/^\/search\s+([^\s]+)\s+(.+)$/);
          if (!match) {
            return NextResponse.json({
              response: 'Formato inválido. Use: /search [escopo] [consulta]'
            }, { headers: baseHeaders });
          }

          const [, scope = '', query = ''] = match;
          if (!scope || !query) {
            return NextResponse.json({
              response: 'Escopo e consulta são obrigatórios'
            }, { headers: baseHeaders });
          }

          const results = await client.searchDocuments(query, { scope });

          return NextResponse.json({
            response: results.scoredChunks?.length
              ? `Resultados da busca:\n\n${results.scoredChunks.map(chunk => 
                  `[Score: ${chunk.score}] ${chunk.content}`
                ).join('\n\n')}`
              : 'Nenhum resultado encontrado.'
          }, { headers: baseHeaders });
        }

        if (message.startsWith('/upload-raw')) {
          const match = message.match(/^\/upload-raw\s+([^\s]+)\s+(.+)$/);
          if (!match) {
            return NextResponse.json({
              response: 'Formato inválido. Use: /upload-raw [escopo] [conteúdo]'
            }, { headers: baseHeaders });
          }

          const [, scope = '', content = ''] = match;
          if (!scope || !content) {
            return NextResponse.json({
              response: 'Escopo e conteúdo são obrigatórios'
            }, { headers: baseHeaders });
          }

          await client.uploadRawDocument(content, { scope });

          return NextResponse.json({
            response: `Documento adicionado com sucesso ao escopo: ${scope}`
          }, { headers: baseHeaders });
        }

        return NextResponse.json({
          response: `Comando não reconhecido. Comandos disponíveis:
- /docs - Lista todos os documentos
- /upload - Instruções para upload de documentos
- /search [escopo] [consulta] - Busca nos documentos
- /upload-raw [escopo] [conteúdo] - Envia texto como documento`
        }, { headers: baseHeaders });
      } catch (error) {
        console.error('Erro ao processar comando Ragie:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Erro ao processar comando' },
          { status: 500, headers: baseHeaders }
        );
      }
    }

    // Usa o modelo Gemini
    try {
      const geminiApiKey = validateApiKey(process.env['NEXT_PUBLIC_GEMINI_API_KEY'], 'Gemini');
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Prompt simples e direto
      const systemPrompt = "Você é um assistente amigável em português do Brasil. Seja claro e direto nas respostas.";
      
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

      return NextResponse.json({ response: text }, { headers: baseHeaders });
    } catch (error) {
      console.error('Erro ao gerar resposta com Gemini:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao gerar resposta' },
        { status: 500, headers: baseHeaders }
      );
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500, headers: baseHeaders }
    );
  }
} 
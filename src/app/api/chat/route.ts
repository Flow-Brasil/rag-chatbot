import { NextResponse } from 'next/server';
import { createRagieClient } from '@/lib/ragie-client';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant';
}

interface RequestData {
  message: string;
  modelType: string;
  apiKey: string;
  messages: Message[];
  data?: {
    documentId?: string;
    scope?: string;
  };
}

export async function POST(req: Request) {
  try {
    // Log para debug
    const body = await req.text();
    console.log('Corpo da requisição:', body);

    const requestData: RequestData = JSON.parse(body);
    const { message, modelType, messages = [], data } = requestData;
    const ragieApiKey = process.env.NEXT_PUBLIC_RAGIE_API_KEY || '';
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    // Validação mais detalhada
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      );
    }

    // Se a mensagem começar com '/', é um comando do Ragie
    if (message.startsWith('/')) {
      if (!ragieApiKey) {
        return NextResponse.json(
          { error: 'API key do Ragie não configurada' },
          { status: 400 }
        );
      }

      const client = createRagieClient(ragieApiKey);

      try {
        // Processa o comando diretamente aqui em vez de enviar para o modelo
        if (message === '/docs') {
          const documents = await client.listDocuments();
          return NextResponse.json({
            response: documents.length > 0
              ? `Documentos disponíveis:\n\n${documents.map(doc => 
                  `- ${doc.metadata.scope || 'Sem escopo'} (${doc.id})`
                ).join('\n')}`
              : 'Nenhum documento encontrado.'
          });
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
          });
        }

        if (message.startsWith('/search')) {
          const match = message.match(/^\/search\s+([^\s]+)\s+(.+)$/);
          if (!match) {
            return NextResponse.json({
              response: 'Formato inválido. Use: /search [escopo] [consulta]'
            });
          }

          const [, scope, query] = match;
          const results = await client.searchDocuments(query, { scope });

          return NextResponse.json({
            response: results.scoredChunks?.length
              ? `Resultados da busca:\n\n${results.scoredChunks.map(chunk => 
                  `[Score: ${chunk.score}] ${chunk.content}`
                ).join('\n\n')}`
              : 'Nenhum resultado encontrado.'
          });
        }

        return NextResponse.json({
          response: 'Comando não reconhecido. Comandos disponíveis: /docs, /upload, /search'
        });
      } catch (error) {
        console.error('Erro ao processar comando Ragie:', error);
        return NextResponse.json(
          { error: 'Erro ao processar comando' },
          { status: 500 }
        );
      }
    }

    // Se não for comando, usa o modelo Gemini
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'API key do Gemini não configurada' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      // Preparar o histórico de mensagens para o modelo
      const systemPrompt = "Você é um assistente em português do Brasil. Sempre responda em português do Brasil de forma clara e natural. Mantenha um tom profissional mas amigável.";
      const prompt = [
        systemPrompt,
        ...messages.map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`),
        `Human: ${message}`
      ].join('\n');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ response: text });
    } catch (error) {
      console.error('Erro ao gerar resposta com Gemini:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar resposta' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
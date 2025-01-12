import { NextResponse } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchDocuments, listDocuments } from '../ragie';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Message {
  role: string;
  content: string;
}

interface RequestData {
  messages: Message[];
  data?: {
    documentId?: string;
    scope?: string;
  };
}

export async function POST(req: Request) {
  try {
    const requestData: RequestData = await req.json();
    const { messages, data } = requestData;
    const lastMessage = messages[messages.length - 1];

    // Processamento dos comandos Ragie
    let contextText = "";
    
    if (lastMessage.content.trim() === "/docs") {
      try {
        const response = await fetch('https://api.ragie.ai/documents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ao listar documentos: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        throw new Error(`Erro ao listar documentos: ${error.message}`);
      }
    }
    else {
      try {
        const response = await searchDocuments(lastMessage.content, data?.documentId);
        
        contextText = "\n\n🔍 **Resultados da Busca**\n\n" + 
          response.scored_chunks
            .map((chunk: any) => chunk.text)
            .join("\n\n");
      } catch (error: any) {
        console.error('Erro ao buscar contexto do documento:', error);
      }
    }

    // Prepara o prompt do sistema
    const systemPrompt = `Você é um assistente prestativo e amigável especializado em documentação e APIs. 
Suas respostas devem ser claras, precisas e em português do Brasil.

Comandos especiais disponíveis:
- /docs: Lista todos os documentos disponíveis

Ao responder consultas:
1. Organize as informações de forma clara usando markdown
2. Destaque pontos importantes e exemplos de código
3. Sugira comandos ou ações relevantes baseadas no contexto
4. Para documentos, indique o status e se já estão disponíveis para busca

${contextText}`;

    // Prepara a mensagem para o modelo
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7
      }
    });

    const result = await chat.sendMessage(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Retorna a resposta como stream
    return new StreamingTextResponse(new ReadableStream({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      }
    }));

  } catch (error: any) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function json(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.content === '/docs') {
      let contextText = '';
      try {
        const response = await listDocuments();
        
        if (!response.documents || response.documents.length === 0) {
          contextText = "📚 **Nenhum documento encontrado**\n\n" +
            "Para adicionar documentos, use a rota POST https://api.ragie.ai/documents\n" +
            "Consulte a documentação para mais detalhes sobre upload de arquivos.";
        } else {
          contextText = "📚 **Documentos Disponíveis**\n\n" +
            response.documents.map(doc => (
              `### ${doc.name}\n` +
              `- ID: \`${doc.id}\`\n` +
              `- Status: ${doc.status === 'ready' ? '✅' : '⏳'} ${doc.status}\n` +
              `- Chunks: ${doc.chunk_count}\n` +
              `- Escopo: ${doc.metadata.scope || 'default'}\n`
            )).join('\n') +
            "\n\n> Para buscar em um documento específico, inclua o ID do documento na sua pergunta.";
        }

        return new StreamingTextResponse(new ReadableStream({
          start(controller) {
            controller.enqueue(contextText);
            controller.close();
          }
        }));
      } catch (error) {
        console.error('Erro ao listar documentos:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao listar documentos' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const searchResults = await searchDocuments(lastMessage.content);
    const content = searchResults.scored_chunks
      .map(chunk => chunk.text)
      .join('\n\n');

    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
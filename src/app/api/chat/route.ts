import { NextResponse } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { messages } = requestData;
    const lastMessage = messages[messages.length - 1];

    // Configurar o modelo Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Preparar o histórico de mensagens para o modelo
    const prompt = messages
      .map((m: Message) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Gerar resposta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Retornar resposta
    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' }
    });

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

    // Configurar o modelo Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Preparar o histórico de mensagens para o modelo
    const prompt = messages
      .map((m: Message) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Gerar resposta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

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
import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const RAGIE_API_KEY = process.env["NEXT_PUBLIC_RAGIE_API_KEY"];
const RAGIE_API_URL = "https://api.ragie.ai";
const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não configurada");
}

const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
  apiKey: GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, documentId, history } = await request.json();

    console.log("Buscando conteúdo do documento:", documentId);

    // 1. Primeiro, buscar o conteúdo do documento no Ragie
    const documentResponse = await fetch(`${RAGIE_API_URL}/documents/${documentId}/content`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RAGIE_API_KEY}`
      }
    });

    if (!documentResponse.ok) {
      console.error("Erro na resposta do Ragie:", await documentResponse.text());
      throw new Error("Erro ao buscar conteúdo do documento");
    }

    const documentData = await documentResponse.json();
    let documentContent = "";
    
    try {
      // Tenta fazer parse do conteúdo se for JSON
      const parsedContent = JSON.parse(documentData.content);
      documentContent = JSON.stringify(parsedContent, null, 2);
    } catch {
      // Se não for JSON, usa o conteúdo como está
      documentContent = documentData.content;
    }

    console.log("Conteúdo do documento recuperado, gerando resposta...");

    // 2. Criar mensagens para o chat
    const messages = [
      new SystemMessage(
        `Você é um assistente prestativo que responde perguntas baseando-se apenas no conteúdo do documento fornecido.
         Seja claro e direto nas respostas. Se a informação não estiver disponível no documento, indique isso claramente.
         
         Contexto do documento:
         ${documentContent}`
      ),
      ...history.map((msg: any) => 
        new HumanMessage(msg.content)
      ),
      new HumanMessage(message)
    ];

    // 3. Gerar resposta usando LangChain + Gemini
    const response = await model.invoke(messages);
    console.log("Resposta gerada com sucesso!");

    return NextResponse.json({ response: response.content });
  } catch (error) {
    console.error("Erro no processamento:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
} 
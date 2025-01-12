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
    const { message, history } = await request.json();

    console.log("Buscando todos os documentos...");

    // 1. Primeiro, buscar a lista de documentos
    const documentsResponse = await fetch(`${RAGIE_API_URL}/documents`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RAGIE_API_KEY}`
      }
    });

    if (!documentsResponse.ok) {
      throw new Error("Erro ao buscar lista de documentos");
    }

    const documentsData = await documentsResponse.json();
    const documents = documentsData.documents || [];

    console.log(`Encontrados ${documents.length} documentos`);

    // 2. Buscar o conteúdo de cada documento
    const contents = await Promise.all(
      documents.map(async (doc: any) => {
        const contentResponse = await fetch(`${RAGIE_API_URL}/documents/${doc.id}/content`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RAGIE_API_KEY}`
          }
        });

        if (!contentResponse.ok) {
          console.warn(`Erro ao buscar conteúdo do documento ${doc.id}`);
          return null;
        }

        const contentData = await contentResponse.json();
        try {
          // Tenta fazer parse do conteúdo se for JSON
          const parsedContent = JSON.parse(contentData.content);
          return {
            name: doc.name,
            content: JSON.stringify(parsedContent, null, 2)
          };
        } catch {
          // Se não for JSON, usa o conteúdo como está
          return {
            name: doc.name,
            content: contentData.content
          };
        }
      })
    );

    // Filtra documentos que falharam ao buscar
    const validContents = contents.filter(c => c !== null);

    console.log("Conteúdo dos documentos recuperado, gerando resposta...");

    // 3. Criar mensagens para o chat
    const messages = [
      new SystemMessage(
        `Você é um assistente prestativo que responde perguntas baseando-se no conteúdo dos documentos fornecidos.
         Seja claro e direto nas respostas. Se a informação não estiver disponível nos documentos, indique isso claramente.
         
         Documentos disponíveis:
         ${validContents.map(doc => `
         --- ${doc.name} ---
         ${doc.content}
         `).join('\n\n')}`
      ),
      ...history.map((msg: any) => 
        new HumanMessage(msg.content)
      ),
      new HumanMessage(message)
    ];

    // 4. Gerar resposta usando LangChain + Gemini
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
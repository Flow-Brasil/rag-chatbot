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
    const { message, history, documentIds } = await request.json();

    if (!documentIds || documentIds.length === 0) {
      throw new Error("Nenhum documento selecionado");
    }

    console.log("Buscando documentos selecionados...");

    // 2. Buscar o conteúdo de cada documento
    const contents = await Promise.all(
      documentIds.map(async (documentId: string) => {
        const contentResponse = await fetch(`${RAGIE_API_URL}/documents/${documentId}/content`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RAGIE_API_KEY}`
          }
        });

        if (!contentResponse.ok) {
          console.warn(`Erro ao buscar conteúdo do documento ${documentId}`);
          return null;
        }

        // Buscar informações do documento
        const documentResponse = await fetch(`${RAGIE_API_URL}/documents/${documentId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RAGIE_API_KEY}`
          }
        });

        if (!documentResponse.ok) {
          console.warn(`Erro ao buscar informações do documento ${documentId}`);
          return null;
        }

        const documentInfo = await documentResponse.json();
        const contentData = await contentResponse.json();

        try {
          // Tenta fazer parse do conteúdo se for JSON
          const parsedContent = JSON.parse(contentData.content);
          return {
            name: documentInfo.name,
            cliente: documentInfo.metadata?.cliente,
            content: JSON.stringify(parsedContent, null, 2)
          };
        } catch {
          // Se não for JSON, usa o conteúdo como está
          return {
            name: documentInfo.name,
            cliente: documentInfo.metadata?.cliente,
            content: contentData.content
          };
        }
      })
    );

    // Filtra documentos que falharam ao buscar
    const validContents = contents.filter(c => c !== null);

    if (validContents.length === 0) {
      throw new Error("Não foi possível recuperar o conteúdo dos documentos selecionados");
    }

    console.log("Conteúdo dos documentos recuperado, gerando resposta...");

    // 3. Criar mensagens para o chat
    const messages = [
      new SystemMessage(
        `Você é um assistente prestativo que responde perguntas baseando-se no conteúdo dos documentos fornecidos.
         Seja claro e direto nas respostas. Se a informação não estiver disponível nos documentos, indique isso claramente.
         
         Documentos disponíveis:
         ${validContents.map(doc => `
         --- ${doc.name} (Cliente: ${doc.cliente}) ---
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
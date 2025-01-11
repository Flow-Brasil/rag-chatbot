import { StreamingTextResponse } from "ai";
import { createGroqModel } from "@/ai";
import { createGeminiModel } from "@/ai/gemini";
import { RagieClient } from "@/lib/api/ragie";

const SYSTEM_PROMPT = `Você é um assistente prestativo e amigável. Suas respostas devem ser claras, precisas e em português do Brasil. Mantenha um tom profissional mas acolhedor.`;

// Initialize Ragie client
const ragieClient = new RagieClient({
  apiKey: process.env.RAGIE_API_KEY!,
  baseUrl: 'https://api.ragie.ai'
});

interface RequestData {
  messages: any[];
  data?: {
    model?: string;
    geminiKey?: string;
    groqKey?: string;
  };
  documentId?: string;
}

export async function POST(req: Request) {
  try {
    const requestData: RequestData = await req.json();
    const { messages, data, documentId } = requestData;
    const lastMessage = messages[messages.length - 1];

    // Busca contexto relevante da Ragie API
    const { scored_chunks: context } = await ragieClient.getContext({
      query: lastMessage.content,
      rerank: true,
      filter: documentId ? { document_id: documentId } : undefined
    });

    // Formata o contexto para o prompt
    const contextText = context.length > 0
      ? "\n\nContexto relevante:\n" + context.map(chunk => chunk.text).join("\n")
      : "";

    // Prepara o prompt com o contexto
    const prompt = `${SYSTEM_PROMPT}${contextText}\n\nUsuário: ${lastMessage.content}\n\nAssistente:`;

    // Obtém o último input do usuário
    const lastUserMessage = messages.findLast((m: any) => m.role === "user");
    if (!lastUserMessage) {
      throw new Error("Nenhuma mensagem do usuário encontrada");
    }

    // Valida as chaves de API
    if (data?.model === 'gemini' && (!data?.geminiKey || data?.geminiKey.length < 10)) {
      throw new Error("Chave API Gemini inválida ou não fornecida");
    }
    if (data?.model === 'groq' && (!data?.groqKey || !data?.groqKey.startsWith('gsk_'))) {
      throw new Error("Chave API Groq inválida ou não fornecida");
    }

    // Seleciona o modelo apropriado
    let selectedModel;
    try {
      if (data?.model === 'gemini') {
        if (!data?.geminiKey) throw new Error("Chave API Gemini não fornecida");
        selectedModel = createGeminiModel(data?.geminiKey);
      } else {
        if (!data?.groqKey) throw new Error("Chave API Groq não fornecida");
        selectedModel = createGroqModel(data?.groqKey);
      }
    } catch (error: any) {
      throw new Error(`Erro ao inicializar modelo ${data?.model}: ${error.message}`);
    }

    // Gera a resposta
    const response = await selectedModel.invoke([{
      role: "system",
      content: prompt
    }, ...messages]);

    // Garante que a resposta é um ReadableStream
    if (response && response instanceof ReadableStream) {
      return new StreamingTextResponse(response);
    } else if (response && typeof response === 'object' && 'body' in response) {
      const stream = (response as Response).body;
      if (!stream) {
        throw new Error("Resposta sem corpo");
      }
      return new StreamingTextResponse(stream);
    } else {
      throw new Error("Resposta inválida do modelo");
    }

  } catch (error) {
    console.error("Erro na rota de chat:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Função auxiliar para salvar o chat
async function saveChat(data: { id: string; messages: any[] }) {
  // Implementação futura da persistência do chat
  return Promise.resolve();
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await saveChat({ id, messages: [] });
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Erro ao deletar chat:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao deletar o chat" }),
      { status: 500 }
    );
  }
}

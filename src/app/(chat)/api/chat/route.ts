import { StreamingTextResponse } from "ai";
import { createGroqModel } from "@/ai";

const SYSTEM_PROMPT = `Você é um assistente prestativo e amigável. Suas respostas devem ser claras, precisas e em português do Brasil. Mantenha um tom profissional mas acolhedor.

Ao responder consultas:
1. Organize as informações de forma clara usando markdown
2. Destaque pontos importantes e exemplos de código
3. Sugira comandos ou ações relevantes baseadas no contexto`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Cria o modelo GROQ com streaming
    const groq = createGroqModel(process.env.GROQ_API_KEY!);

    // Adiciona o system prompt
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Gera a resposta usando streaming
    const stream = await groq.invoke(messagesWithSystem);
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

import { Message } from "ai";
import { Groq } from "groq-sdk";
import { StreamingTextResponse } from "ai";

const SYSTEM_PROMPT = `Você é um assistente virtual prestativo e amigável. Por favor, responda sempre em português do Brasil, mantendo um tom profissional mas acolhedor. Seja claro e direto em suas respostas.`;

export function createGroqModel(apiKey: string) {
  return {
    async invoke(messages: Message[]) {
      try {
        const groq = new Groq({
          apiKey: apiKey,
        });

        // Encontra a mensagem do sistema, se existir
        const systemMessage = messages.find((m: Message) => m.role === 'system');
        const prompt = systemMessage?.content || SYSTEM_PROMPT;

        // Filtra e converte as mensagens para o formato do Groq
        const chatMessages = messages
          .filter((m: Message) => m.role === 'user' || m.role === 'assistant')
          .map((m: Message) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }));

        // Se não houver mensagens do usuário, retorna erro
        if (!chatMessages.some(m => m.role === 'user')) {
          throw new Error('Pelo menos uma mensagem do usuário é necessária');
        }

        // Cria a requisição para o Groq
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: prompt },
            ...chatMessages,
          ],
          model: 'mixtral-8x7b-32768',
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        });

        // Transforma o stream do Groq em um ReadableStream de texto
        const stream = new ReadableStream({
          async start(controller) {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            controller.close();
          },
        });

        return stream;

      } catch (error) {
        console.error('Erro no modelo Groq:', error);
        throw error;
      }
    },
  };
}

export { createGeminiModel } from "./gemini";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "ai";

const SYSTEM_PROMPT = `Você é um assistente profissional e amigável, focado em fornecer respostas precisas e úteis em português do Brasil. Mantenha um tom formal, mas acolhedor.`;

export function createGeminiModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  return {
    async invoke(messages: Message[]) {
      try {
        // Encontra a mensagem do sistema e filtra as mensagens de usuário/assistente
        const systemMessage = messages.find(m => m.role === "system")?.content || SYSTEM_PROMPT;
        const chatMessages = messages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: m.content,
          }));

        // Verifica se há pelo menos uma mensagem do usuário
        if (!chatMessages.some(m => m.role === "user")) {
          throw new Error("Pelo menos uma mensagem do usuário é necessária");
        }

        // Inicia o chat com o histórico vazio
        const chat = model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        // Adiciona o contexto do sistema se existir
        if (systemMessage) {
          await chat.sendMessage(systemMessage);
        }

        // Processa as mensagens em ordem
        for (let i = 0; i < chatMessages.length - 1; i++) {
          await chat.sendMessage(chatMessages[i].parts);
        }

        // Envia a última mensagem e obtém a resposta
        const lastMessage = chatMessages[chatMessages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts);
        const response = await result.response;
        const text = response.text();

        // Cria um ReadableStream com a resposta
        return new ReadableStream({
          async start(controller) {
            controller.enqueue(new TextEncoder().encode(text));
            controller.close();
          },
        });
      } catch (error) {
        console.error("Erro no modelo Gemini:", error);
        throw error;
      }
    },
  };
} 
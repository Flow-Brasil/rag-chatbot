import { groq } from "@ai-sdk/groq";
import { Message } from "ai";

const SYSTEM_PROMPT = `Você é um assistente profissional e amigável, focado em fornecer respostas precisas e úteis em português do Brasil. Mantenha um tom formal, mas acolhedor.`;

export function createGroqModel(apiKey: string) {
  const groqClient = groq.init({
    apiKey,
    model: "mixtral-8x7b-32768",
  });

  return {
    async invoke(messages: Message[]) {
      try {
        const systemMessage = messages.find(m => m.role === "system")?.content || SYSTEM_PROMPT;
        const chatMessages = messages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role,
            content: m.content,
          }));

        const response = await groqClient.chat.completions.create({
          messages: [
            { role: "system", content: systemMessage },
            ...chatMessages,
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        });

        return response;
      } catch (error) {
        console.error("Error in GROQ model:", error);
        throw error;
      }
    }
  };
} 
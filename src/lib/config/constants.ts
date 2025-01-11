export const APP_CONFIG = {
  name: "RAG Chatbot",
  description: "Um chatbot inteligente com suporte a múltiplos modelos LLM",
  version: "1.0.0",
  author: {
    name: "Flow",
    url: "https://github.com/flow",
  },
};

export const LLM_CONFIG = {
  groq: {
    model: "mixtral-8x7b-32768",
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "Você é um assistente útil e amigável.",
  },
  gemini: {
    model: "gemini-pro",
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "Você é um assistente útil e amigável.",
  },
};

export const UI_CONFIG = {
  theme: {
    light: {
      primary: "#006FEE",
      background: "#ffffff",
    },
    dark: {
      primary: "#006FEE",
      background: "#000000",
    },
  },
  animation: {
    duration: 0.2,
    ease: [0.32, 0.72, 0, 1],
  },
}; 
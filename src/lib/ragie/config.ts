// Configuração da API do Ragie
export const RAGIE_API_URL = process.env["RAGIE_API_URL"] || "http://localhost:8000";
export const RAGIE_API_KEY = process.env["RAGIE_API_KEY"] || "";

if (!RAGIE_API_KEY) {
  console.warn("⚠️ RAGIE_API_KEY não encontrada nas variáveis de ambiente");
} 
import { NextResponse } from "next/server";

const RAGIE_API_KEY = process.env["NEXT_PUBLIC_RAGIE_API_KEY"];
const RAGIE_API_URL = "https://api.ragie.ai";

export async function GET() {
  console.log("Iniciando busca de documentos");
  console.log("API Key:", RAGIE_API_KEY ? "Configurada" : "Não configurada");
  
  try {
    const response = await fetch(`${RAGIE_API_URL}/documents`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RAGIE_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error("Erro na resposta da API:", response.status, response.statusText);
      throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Documentos recebidos:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documentos" },
      { status: 500 }
    );
  }
} 
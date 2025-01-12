import { NextResponse } from "next/server";

const RAGIE_API_KEY = process.env["NEXT_PUBLIC_RAGIE_API_KEY"];
const RAGIE_API_URL = "https://api.ragie.ai";

export async function GET(
  request: Request,
  context: { params: { documentId: string } }
) {
  const { documentId } = context.params;
  
  try {
    const response = await fetch(`${RAGIE_API_URL}/documents/${documentId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RAGIE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { documentId: string } }
) {
  const { documentId } = context.params;
  
  try {
    const response = await fetch(`${RAGIE_API_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RAGIE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ragie API error: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Erro ao deletar documento" },
      { status: 500 }
    );
  }
} 
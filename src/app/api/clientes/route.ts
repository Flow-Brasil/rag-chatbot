import { NextResponse } from "next/server";
import { listClientes } from "@/lib/api/clientes";

export async function GET() {
  try {
    const clientes = await listClientes();
    return NextResponse.json({ clientes });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
} 
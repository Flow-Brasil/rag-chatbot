import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const metadataStr = formData.get("metadata") as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo fornecido" },
        { status: 400 }
      );
    }

    // Upload de múltiplos arquivos em paralelo
    const uploadPromises = files.map(file => 
      ragieClient.uploadDocument(file, metadata)
    );

    const documents = await Promise.all(uploadPromises);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Erro ao fazer upload dos documentos:", error);
    return NextResponse.json(
      { error: "Falha ao fazer upload dos documentos" },
      { status: 500 }
    );
  }
} 
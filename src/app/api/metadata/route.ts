import { NextResponse } from 'next/server';
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/lib/api/documents";

// Metadados padrão do sistema
const DEFAULT_METADATA = {
  document_type: ["PDF", "MD", "DOCX", "TXT", "JSON"],
  document_source: ["api", "upload", "import"],
};

export async function GET() {
  try {
    // Buscar todos os documentos
    const documents = await listDocuments();

    // Extrair e agrupar metadados
    const metadata: { [key: string]: Set<string> } = {
      // Inicializar com os valores padrão
      document_type: new Set(DEFAULT_METADATA.document_type),
      document_source: new Set(DEFAULT_METADATA.document_source),
    };

    // Adicionar metadados dos documentos
    documents.forEach((doc: Document) => {
      if (doc.metadata) {
        Object.entries(doc.metadata).forEach(([key, value]) => {
          // Ignorar campos específicos
          if (key === 'cliente' || 
              key === 'document_id' || 
              key === 'document_uploaded_at' || 
              key === 'document_name' || 
              !value) return;

          if (!metadata[key]) metadata[key] = new Set();
          metadata[key].add(value);
        });
      }
    });

    // Converter Sets para arrays e ordenar valores
    const formattedMetadata: { [key: string]: string[] } = {};
    Object.entries(metadata).forEach(([key, values]) => {
      formattedMetadata[key] = Array.from(values).sort();
    });

    return NextResponse.json({
      metadata: formattedMetadata
    });
  } catch (error) {
    console.error("Erro ao buscar metadados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar metadados" },
      { status: 500 }
    );
  }
} 
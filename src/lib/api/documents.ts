import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Document {
  id: string;
  name: string;
  status: string;
  chunk_count: number;
  metadata: { [key: string]: string } | null;
  created_at: Date;
}

export async function listDocuments(): Promise<Document[]> {
  try {
    const documents = await prisma.document.findMany();
    return documents.map(doc => ({
      ...doc,
      metadata: doc.metadata as { [key: string]: string } | null
    }));
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    return [];
  }
} 
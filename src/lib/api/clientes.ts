import { ragieClient } from "../ragie";

export interface Cliente {
  name: string;
  documentCount: number;
}

export async function listClientes(): Promise<Cliente[]> {
  try {
    // Buscar todos os documentos
    const documents = await ragieClient.listDocuments();
    
    // Agrupar documentos por cliente e contar
    const clientesMap = new Map<string, number>();
    documents.forEach((doc: any) => {
      const clienteName = doc.metadata?.cliente;
      if (clienteName && typeof clienteName === 'string') {
        clientesMap.set(clienteName, (clientesMap.get(clienteName) || 0) + 1);
      }
    });
    
    // Converter para array de clientes e ordenar por nome
    const clientes = Array.from(clientesMap.entries())
      .map(([name, count]) => ({
        name,
        documentCount: count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return clientes;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }
} 
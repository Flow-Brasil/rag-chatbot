import { NextRequest, NextResponse } from "next/server";
import { ragieClient } from "@/lib/ragie";

// Interface para o filtro
interface Filter {
  id?: string;
  nome: string;
  descricao: string;
  cliente: string;
  regras: {
    campo: string;
    operador: string;
    valor: string;
  }[];
}

// Interface para metadados do documento
interface FilterMetadata extends Record<string, string> {
  tipo: "filtro";
  cliente: string;
  ultima_modificacao: string;
}

// GET - Lista todos os filtros de um cliente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cliente = searchParams.get("cliente");

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não especificado" },
        { status: 400 }
      );
    }

    // Busca documentos do tipo filtro para o cliente
    const documents = await ragieClient.listDocuments();
    const filters = documents.filter(doc => {
      const metadata = doc.metadata as Record<string, string>;
      return metadata && 
             metadata["tipo"] === "filtro" && 
             metadata["cliente"] === cliente;
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error("Erro ao listar filtros:", error);
    return NextResponse.json(
      { error: "Falha ao listar filtros" },
      { status: 500 }
    );
  }
}

// POST - Cria um novo filtro
export async function POST(request: NextRequest) {
  try {
    const filter: Filter = await request.json();

    if (!filter.cliente || !filter.nome || !filter.regras) {
      return NextResponse.json(
        { error: "Dados do filtro incompletos" },
        { status: 400 }
      );
    }

    // Prepara o documento para salvar
    const metadata: FilterMetadata = {
      tipo: "filtro",
      cliente: filter.cliente,
      ultima_modificacao: new Date().toISOString()
    };

    // Converte para Blob para upload
    const blob = new Blob([JSON.stringify(filter)], {
      type: "application/json"
    });
    const file = new File([blob], `${filter.nome}.json`, {
      type: "application/json"
    });

    // Faz upload do filtro como documento
    const document = await ragieClient.uploadDocument(file, metadata);

    return NextResponse.json({ filter: document });
  } catch (error) {
    console.error("Erro ao criar filtro:", error);
    return NextResponse.json(
      { error: "Falha ao criar filtro" },
      { status: 500 }
    );
  }
}

// PATCH - Atualiza um filtro existente
export async function PATCH(request: NextRequest) {
  try {
    const filter: Filter = await request.json();

    if (!filter.id) {
      return NextResponse.json(
        { error: "ID do filtro não especificado" },
        { status: 400 }
      );
    }

    // Atualiza o documento existente
    const metadata: FilterMetadata = {
      tipo: "filtro",
      cliente: filter.cliente,
      ultima_modificacao: new Date().toISOString()
    };

    const document = await ragieClient.updateDocument(filter.id, {
      name: filter.nome,
      metadata
    });

    return NextResponse.json({ filter: document });
  } catch (error) {
    console.error("Erro ao atualizar filtro:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar filtro" },
      { status: 500 }
    );
  }
}

// DELETE - Remove um filtro
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get("id");

    if (!filterId) {
      return NextResponse.json(
        { error: "ID do filtro não especificado" },
        { status: 400 }
      );
    }

    await ragieClient.deleteDocument(filterId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar filtro:", error);
    return NextResponse.json(
      { error: "Falha ao deletar filtro" },
      { status: 500 }
    );
  }
} 
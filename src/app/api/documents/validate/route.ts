import { NextRequest, NextResponse } from "next/server";

function validateDocument(content: any, cliente: string) {
  try {
    // Garante que temos um objeto JSON válido
    const jsonContent = typeof content === 'string' ? JSON.parse(content) : content;

    // Verifica se é um objeto
    if (!jsonContent || typeof jsonContent !== 'object') {
      return {
        success: false,
        message: "O conteúdo deve ser um objeto JSON válido"
      };
    }

    // Procura por campos que podem ser o título e conteúdo
    const title = jsonContent.titulo || jsonContent.title || jsonContent.nome || jsonContent.name;
    const text = jsonContent.conteudo || jsonContent.content || jsonContent.texto || jsonContent.text;

    // Se não tem título nem texto, tenta encontrar em campos aninhados
    if (!title && !text) {
      // Função para procurar em objetos aninhados
      const findInObject = (obj: any, keys: string[]): string | null => {
        for (const key of keys) {
          if (obj[key]) return obj[key];
          // Procura em subobjetos
          for (const prop in obj) {
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
              const found = findInObject(obj[prop], [key]);
              if (found) return found;
            }
          }
        }
        return null;
      };

      const titleFromNested = findInObject(jsonContent, ['titulo', 'title', 'nome', 'name', 'assunto', 'subject']);
      const textFromNested = findInObject(jsonContent, ['conteudo', 'content', 'texto', 'text', 'body', 'mensagem', 'message']);

      if (!titleFromNested && !textFromNested) {
        return {
          success: false,
          message: "O documento deve conter pelo menos um título ou conteúdo"
        };
      }

      // Formata o documento
      const formattedContent = {
        titulo: titleFromNested || "Documento sem título",
        conteudo: textFromNested || JSON.stringify(jsonContent, null, 2)
      };

      return {
        success: true,
        data: {
          content: formattedContent,
          suggested_name: `${formattedContent.titulo}.json`
        },
        message: "✅ Documento validado com sucesso"
      };
    }

    // Se encontrou título ou texto diretamente
    const formattedContent = {
      titulo: title || "Documento sem título",
      conteudo: text || JSON.stringify(jsonContent, null, 2)
    };

    return {
      success: true,
      data: {
        content: formattedContent,
        suggested_name: `${formattedContent.titulo}.json`
      },
      message: "✅ Documento validado com sucesso"
    };

  } catch (error) {
    return {
      success: false,
      message: "Erro ao validar o documento: " + (error instanceof Error ? error.message : String(error))
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, cliente } = await request.json();
    const result = validateDocument(content, cliente);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao validar documento:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Falha ao validar o documento"
      },
      { status: 500 }
    );
  }
} 
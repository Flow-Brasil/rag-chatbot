import { NextResponse } from 'next/server';

const RAGIE_API_KEY = process.env.RAGIE_API_KEY;

interface Message {
  role: string;
  content: string;
}

interface RequestData {
  messages: Message[];
  data?: {
    documentId?: string;
    scope?: string;
  };
}

async function searchRagie(query: string, filter?: { scope?: string, documentId?: string }) {
  const response = await fetch('https://api.ragie.ai/retrievals', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      rerank: true,
      filter: {
        ...(filter?.scope && { scope: filter.scope }),
        ...(filter?.documentId && { document_id: filter.documentId })
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na busca: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(req: Request) {
  try {
    const requestData: RequestData = await req.json();
    const { messages, data } = requestData;
    const lastMessage = messages[messages.length - 1];

    // Processamento dos comandos Ragie
    let contextText = "";
    
    if (lastMessage.content.includes("@apirag")) {
      try {
        const query = lastMessage.content.replace("@apirag", "").trim();
        const response = await searchRagie(query, { scope: "api-docs" });
        
        contextText = "\n\n📚 **Informações da API Ragie**\n\n" + 
          response.scored_chunks
            .map((chunk: any) => `### Trecho (Score: ${chunk.score.toFixed(2)})\n${chunk.text}`)
            .join("\n\n");
            
      } catch (error: any) {
        throw new Error(`Erro ao acessar API Ragie: ${error.message}`);
      }
    } 
    else if (lastMessage.content.includes("@ragdoc")) {
      try {
        const query = lastMessage.content.replace("@ragdoc", "").trim();
        const response = await searchRagie(query, { scope: "documents" });
        
        contextText = "\n\n🔍 **Documentos Encontrados**\n\n" + 
          response.scored_chunks
            .map((chunk: any) => `### ${chunk.document_name || 'Documento'} (Score: ${chunk.score.toFixed(2)})\n${chunk.text}`)
            .join("\n\n");
            
      } catch (error: any) {
        throw new Error(`Erro ao buscar documentos: ${error.message}`);
      }
    }
    else if (lastMessage.content.trim() === "/docs") {
      try {
        const response = await fetch('https://api.ragie.ai/documents', {
          headers: {
            'Authorization': `Bearer ${RAGIE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`Erro ao listar documentos: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.documents || data.documents.length === 0) {
          contextText = "\n\nℹ️ **Nenhum documento encontrado**\n\nUse o botão de upload para adicionar documentos.";
        } else {
          const documentList = data.documents
            .map((doc: any) => {
              const status = {
                'pending': '⏳ Aguardando',
                'partitioning': '📄 Dividindo',
                'partitioned': '✂️ Dividido',
                'refined': '🔍 Refinado',
                'chunked': '📝 Em chunks',
                'indexed': '📑 Indexado',
                'summary_indexed': '📋 Sumário pronto',
                'ready': '✅ Pronto',
                'failed': '❌ Falhou'
              }[doc.status] || doc.status;

              return `### ${doc.name}\n- ID: \`${doc.id}\`\n- Status: ${status}\n- Chunks: ${doc.chunk_count || 'N/A'}\n- Escopo: ${doc.metadata?.scope || 'N/A'}`;
            })
            .join("\n\n");

          contextText = `\n\n📚 **Documentos Disponíveis**\n\n${documentList}`;
        }
      } catch (error: any) {
        throw new Error(`Erro ao listar documentos: ${error.message}`);
      }
    }
    else if (data?.documentId) {
      try {
        const response = await searchRagie(lastMessage.content, { documentId: data.documentId });
        contextText = "\n\n📄 **Contexto do Documento**\n\n" + 
          response.scored_chunks
            .map((chunk: any) => chunk.text)
            .join("\n\n");
      } catch (error: any) {
        console.error('Erro ao buscar contexto do documento:', error);
      }
    }

    // Prepara o prompt do sistema
    const systemPrompt = `Você é um assistente prestativo e amigável especializado em documentação e APIs. 
Suas respostas devem ser claras, precisas e em português do Brasil.

Comandos especiais disponíveis:
- @apirag [pergunta]: Busca informações sobre a API Ragie
- @ragdoc [pergunta]: Busca em documentos específicos
- /docs: Lista todos os documentos disponíveis

Ao responder consultas:
1. Organize as informações de forma clara usando markdown
2. Destaque pontos importantes e exemplos de código
3. Sugira comandos ou ações relevantes baseadas no contexto
4. Para documentos, indique o status e se já estão disponíveis para busca

${contextText}`;

    // Prepara a mensagem para o modelo
    const modelMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Retorna a resposta
    return NextResponse.json({ messages: modelMessages });
    
  } catch (error: any) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
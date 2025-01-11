import { NextResponse } from 'next/server';

const RAGIE_API_KEY = 'tnt_46Qnib7kZaD_Ifcd9HQUauLIooSdXSRwIvfvMU04gsKhlbHxPg51YvA';

export async function GET(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    // Se a ação for 'content', busca o conteúdo do documento
    if (action === 'content') {
      console.log('📝 Buscando conteúdo do documento:', documentId);
      
      // Primeiro, verifica se o documento existe e está pronto
      const docResponse = await fetch(`https://api.ragie.ai/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RAGIE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!docResponse.ok) {
        const errorData = await docResponse.json().catch(() => ({ detail: docResponse.statusText }));
        console.error('❌ Erro ao verificar documento:', {
          status: docResponse.status,
          statusText: docResponse.statusText,
          error: JSON.stringify(errorData, null, 2)
        });
        return NextResponse.json(
          { detail: errorData.detail || `Erro ${docResponse.status}: ${docResponse.statusText}` },
          { status: docResponse.status }
        );
      }

      const docData = await docResponse.json();
      console.log('📄 Documento encontrado:', JSON.stringify(docData, null, 2));

      if (docData.status !== 'ready') {
        return NextResponse.json(
          { detail: `Documento ainda não está pronto. Status atual: ${docData.status}` },
          { status: 400 }
        );
      }

      // Agora busca o conteúdo usando /retrievals com uma query vazia
      const response = await fetch(`https://api.ragie.ai/retrievals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAGIE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: " ",  // Espaço em branco para forçar retorno de todos os chunks
          filter: {
            document_id: documentId
          },
          rerank: false,  // Não precisa reordenar pois queremos todo o conteúdo
          limit: 1000    // Limite alto para pegar todo o conteúdo
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        console.error('❌ Erro ao buscar conteúdo:', {
          status: response.status,
          statusText: response.statusText,
          error: JSON.stringify(errorData, null, 2)
        });
        return NextResponse.json(
          { detail: errorData.detail || `Erro ${response.status}: ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('✅ Conteúdo recuperado:', JSON.stringify(data, null, 2));
      
      // Retorna os dados com informações adicionais do documento
      return NextResponse.json({
        ...data,
        document: {
          id: docData.id,
          name: docData.name,
          status: docData.status,
          metadata: docData.metadata
        }
      });
    }
    
    // Caso contrário, busca os metadados do documento
    const response = await fetch(`https://api.ragie.ai/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no proxy da API:', error);
    return NextResponse.json(
      { error: 'Erro ao acessar documento' }, 
      { status: 500 }
    );
  }
} 
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/chat/route';

// Mock do Gemini
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: () => "Resposta simulada do Gemini"
          }
        })
      })
    })
  }))
}));

// Mock das funções da API do Ragie
const mockSearchDocuments = jest.fn();
jest.mock('@/app/api/ragie', () => ({
  searchDocuments: mockSearchDocuments,
  listDocuments: jest.fn()
}));

describe('Processamento de Documentação do Ragie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve processar documentação da API corretamente', async () => {
    const mockResponse = {
      scored_chunks: [
        {
          text: `Para começar a usar a API do Ragie:

1. Crie um documento usando o endpoint /documents:
   curl -X POST https://api.ragie.ai/documents \\
     -H "Authorization: Bearer $RAGIE_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"name": "meu-documento.txt", "content": "conteúdo do documento"}'

2. Aguarde o documento ficar pronto (status: ready)
3. Use o ID retornado para fazer buscas`
        }
      ]
    };

    // Mock da resposta da API
    mockSearchDocuments.mockResolvedValue(mockResponse);

    // Cria uma requisição buscando documentação
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ 
          role: 'user', 
          content: 'Como criar um documento na API do Ragie?' 
        }]
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const responseText = await response.text();
    expect(responseText).toContain('Para começar a usar a API do Ragie');
    expect(responseText).toContain('curl -X POST https://api.ragie.ai/documents');
    expect(responseText).toContain('RAGIE_API_KEY');
  });

  it('deve lidar com documentação não encontrada', async () => {
    // Mock de resposta vazia da API
    mockSearchDocuments.mockResolvedValue({ scored_chunks: [] });

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ 
          role: 'user', 
          content: 'Como fazer algo que não existe na documentação?' 
        }]
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const responseText = await response.text();
    expect(responseText).toContain('Resposta simulada do Gemini');
  });

  it('deve lidar com erros da API ao buscar documentação', async () => {
    // Mock de erro da API
    mockSearchDocuments.mockRejectedValue(new Error('Internal Server Error'));

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ 
          role: 'user', 
          content: 'Como usar a API?' 
        }]
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(200); // Ainda retorna 200 pois o erro na busca não é fatal
  });
}); 
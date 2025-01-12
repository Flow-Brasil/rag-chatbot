import { describe, it, expect, jest } from '@jest/globals';
import { listDocuments, searchDocuments } from '@/app/api/ragie';
import { json } from '@/app/api/chat/route';

jest.mock('@/app/api/ragie', () => ({
  listDocuments: jest.fn(),
  searchDocuments: jest.fn()
}));

describe('Comando /docs', () => {
  it('deve listar documentos corretamente', async () => {
    const mockDocuments = {
      documents: [
        {
          id: '1',
          name: 'doc1.json',
          status: 'ready',
          chunk_count: 10,
          metadata: { scope: 'json-from-chat' }
        }
      ]
    };

    (listDocuments as jest.Mock).mockResolvedValue(mockDocuments);

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ content: '/docs' }] })
    });

    const response = await json(req);
    expect(response).toBeInstanceOf(Response);
    
    const data = await response.json();
    expect(data.content).toContain('doc1.json');
    expect(data.content).toContain('ID: 1');
  });

  it('deve retornar mensagem quando não há documentos', async () => {
    const mockEmptyDocuments = {
      documents: []
    };

    (listDocuments as jest.Mock).mockResolvedValue(mockEmptyDocuments);

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ content: '/docs' }] })
    });

    const response = await json(req);
    expect(response).toBeInstanceOf(Response);
    
    const data = await response.json();
    expect(data.content).toBe('Nenhum documento encontrado');
  });

  it('deve buscar conteúdo relevante', async () => {
    const mockSearchResults = {
      scored_chunks: [
        {
          text: 'Conteúdo relevante',
          score: 0.8
        }
      ]
    };

    (searchDocuments as jest.Mock).mockResolvedValue(mockSearchResults);

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ content: 'busca' }] })
    });

    const response = await json(req);
    expect(response).toBeInstanceOf(Response);
    
    const data = await response.json();
    expect(data.content).toBe('Conteúdo relevante');
  });

  it('deve lidar com erro ao listar documentos', async () => {
    (listDocuments as jest.Mock).mockRejectedValue(new Error('Erro ao listar documentos'));

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ content: '/docs' }] })
    });

    const response = await json(req);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Erro ao listar documentos');
  });

  it('deve lidar com erro na busca', async () => {
    (searchDocuments as jest.Mock).mockRejectedValue(new Error('Erro na busca'));

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ content: 'busca' }] })
    });

    const response = await json(req);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Erro na busca');
  });
}); 
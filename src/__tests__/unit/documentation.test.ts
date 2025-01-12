import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/chat/route';
import { searchDocuments } from '@/app/api/ragie';
import "@testing-library/jest-dom";

// Mock do módulo next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    }))
  }
}));

// Mock das funções da API do Ragie
jest.mock('@/app/api/ragie', () => ({
  searchDocuments: jest.fn().mockImplementation(async () => ({
    scored_chunks: [{
      text: "Documentação simulada",
      score: 0.95,
      metadata: { source: "api-docs" }
    }]
  })),
  listDocuments: jest.fn()
}));

describe('Processamento de Documentação do Ragie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve processar documentação da API corretamente', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        messages: [{ 
          role: 'user', 
          content: 'Como criar um documento na API do Ragie?' 
        }]
      })
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const text = await response.text();
    expect(text).toContain('Documentação simulada');
  });

  it('deve lidar com documentação não encontrada', async () => {
    const mockSearchDocuments = jest.mocked(searchDocuments);
    mockSearchDocuments.mockResolvedValueOnce({
      scored_chunks: []
    });

    const mockRequest = {
      json: () => Promise.resolve({
        messages: [{ 
          role: 'user', 
          content: 'Como fazer algo que não existe na documentação?' 
        }]
      })
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });

  it('deve lidar com erros na busca de documentação', async () => {
    const mockSearchDocuments = jest.mocked(searchDocuments);
    mockSearchDocuments.mockRejectedValueOnce(
      new Error('Erro na busca')
    );

    const mockRequest = {
      json: () => Promise.resolve({
        messages: [{ 
          role: 'user', 
          content: 'Como usar a API?' 
        }]
      })
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
}); 
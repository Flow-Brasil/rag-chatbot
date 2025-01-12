import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { listDocuments, searchDocuments, getDocumentContent, checkApiStatus } from '@/app/api/ragie';

// Mock do fetch global
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('API do Ragie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação de Conexão', () => {
    it('deve validar se a API key está presente', async () => {
      process.env.RAGIE_API_KEY = '';
      
      await expect(listDocuments()).rejects.toThrow('API key não configurada');
      
      process.env.RAGIE_API_KEY = 'tnt_test_key';
    });

    it('deve validar o formato da API key', async () => {
      const originalKey = process.env.RAGIE_API_KEY;
      process.env.RAGIE_API_KEY = 'invalid_key';
      
      await expect(listDocuments()).rejects.toThrow('API key inválida');
      
      process.env.RAGIE_API_KEY = originalKey;
    });

    it('deve lidar com timeout na conexão', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      );

      await expect(listDocuments()).rejects.toThrow('Timeout na conexão');
    });

    it('deve lidar com erros de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(listDocuments()).rejects.toThrow('Erro de conexão');
    });

    it('deve validar o status da API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'operational' })
      } as Response);

      const result = await checkApiStatus();
      expect(result).toBe(true);
    });
  });

  describe('listDocuments', () => {
    it('deve listar documentos corretamente', async () => {
      const mockDocuments = {
        documents: [
          {
            id: 'doc1',
            name: 'Documento 1',
            status: 'ready',
            chunk_count: 10,
            metadata: { scope: 'test' }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocuments
      } as Response);

      const result = await listDocuments();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ragie.ai/documents',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockDocuments);
    });

    it('deve lidar com erros ao listar documentos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized' })
      } as Response);

      await expect(listDocuments()).rejects.toThrow('Erro ao listar documentos: Unauthorized');
    });

    it('deve lidar com respostas vazias', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null
      } as Response);

      await expect(listDocuments()).rejects.toThrow('Resposta inválida do servidor');
    });
  });

  describe('searchDocuments', () => {
    it('deve buscar documentos corretamente', async () => {
      const mockSearchResult = {
        scored_chunks: [
          { 
            text: 'Resultado 1',
            score: 0.95,
            metadata: { source: 'doc1' }
          },
          { 
            text: 'Resultado 2',
            score: 0.85,
            metadata: { source: 'doc1' }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResult
      } as Response);

      const result = await searchDocuments('query test', 'doc1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ragie.ai/retrievals',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            query: 'query test',
            rerank: true,
            filter: {
              document_id: 'doc1'
            }
          })
        })
      );

      expect(result).toEqual(mockSearchResult);
      expect(result.scored_chunks[0]).toHaveProperty('score');
      expect(result.scored_chunks[0]).toHaveProperty('metadata');
    });

    it('deve buscar documentos sem filtro de documento', async () => {
      const mockSearchResult = {
        scored_chunks: [
          { 
            text: 'Resultado 1',
            score: 0.9,
            metadata: { source: 'doc1' }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResult
      } as Response);

      const result = await searchDocuments('query test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ragie.ai/retrievals',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'query test',
            rerank: true
          })
        })
      );

      expect(result).toEqual(mockSearchResult);
    });

    it('deve lidar com erros na busca', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Bad Request' })
      } as Response);

      await expect(searchDocuments('query test')).rejects.toThrow('Erro na busca: Bad Request');
    });

    it('deve validar o tamanho mínimo da query', async () => {
      await expect(searchDocuments('')).rejects.toThrow('Query muito curta');
      await expect(searchDocuments('a')).rejects.toThrow('Query muito curta');
    });

    it('deve lidar com resultados vazios', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ scored_chunks: [] })
      } as Response);

      const result = await searchDocuments('query sem resultados');
      expect(result.scored_chunks).toHaveLength(0);
    });
  });

  describe('getDocumentContent', () => {
    it('deve obter o conteúdo do documento corretamente', async () => {
      const mockContent = {
        content: 'Conteúdo do documento',
        metadata: {
          title: 'Título do Documento',
          created_at: '2024-01-01T00:00:00Z'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContent
      } as Response);

      const result = await getDocumentContent('doc1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ragie.ai/documents/doc1/content',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockContent);
      expect(result).toHaveProperty('metadata');
    });

    it('deve lidar com erros ao obter conteúdo', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Not Found' })
      } as Response);

      await expect(getDocumentContent('doc1')).rejects.toThrow('Erro ao obter conteúdo: Not Found');
    });

    it('deve validar o ID do documento', async () => {
      await expect(getDocumentContent('')).rejects.toThrow('ID do documento inválido');
    });

    it('deve lidar com conteúdo vazio', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: '' })
      } as Response);

      const result = await getDocumentContent('doc1');
      expect(result.content).toBe('');
    });
  });
}); 
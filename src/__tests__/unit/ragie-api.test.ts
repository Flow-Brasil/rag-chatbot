import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { listDocuments, searchDocuments, getDocumentContent } from '@/app/api/ragie';

// Mock do fetch global
global.fetch = jest.fn();

describe('API do Ragie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocuments
      });

      const result = await listDocuments();
      
      expect(global.fetch).toHaveBeenCalledWith(
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(listDocuments()).rejects.toThrow('Erro ao listar documentos');
    });
  });

  describe('searchDocuments', () => {
    it('deve buscar documentos corretamente', async () => {
      const mockSearchResult = {
        scored_chunks: [
          { text: 'Resultado 1' },
          { text: 'Resultado 2' }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResult
      });

      const result = await searchDocuments('query test', 'doc1');
      
      expect(global.fetch).toHaveBeenCalledWith(
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
    });

    it('deve buscar documentos sem filtro de documento', async () => {
      const mockSearchResult = {
        scored_chunks: [
          { text: 'Resultado 1' }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResult
      });

      const result = await searchDocuments('query test');
      
      expect(global.fetch).toHaveBeenCalledWith(
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(searchDocuments('query test')).rejects.toThrow('Erro na busca');
    });
  });

  describe('getDocumentContent', () => {
    it('deve obter o conteúdo do documento corretamente', async () => {
      const mockContent = {
        content: 'Conteúdo do documento'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContent
      });

      const result = await getDocumentContent('doc1');
      
      expect(global.fetch).toHaveBeenCalledWith(
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
    });

    it('deve lidar com erros ao obter conteúdo', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(getDocumentContent('doc1')).rejects.toThrow('Erro ao obter conteúdo');
    });
  });
}); 
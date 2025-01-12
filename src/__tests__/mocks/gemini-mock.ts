import { jest } from '@jest/globals';

// Mock do Gemini para testes
const mockGemini = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: "Resposta simulada do Gemini para testes"
            }
          }
        ]
      })
    }
  }
};

jest.mock('@google/generative-ai', () => ({
  __esModule: true,
  GoogleGenerativeAI: jest.fn().mockImplementation(() => mockGemini)
})); 
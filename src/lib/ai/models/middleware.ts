import { AIMiddleware } from '../types';

export const customMiddleware: AIMiddleware = {
  before: async (messages) => {
    // Implementar lógica de pré-processamento se necessário
    return messages;
  },
  after: async (response) => {
    // Implementar lógica de pós-processamento se necessário
    return response;
  }
}; 
import { RagieConfig, RagieRequestOptions, RagieResponse, RagieError } from '../types/ragie';

export class RagieClient {
  private config: RagieConfig;
  private retryDelay = 1000;

  constructor(config: RagieConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 10000,
      ...config
    };
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = this.config.maxRetries
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const error = await response.json() as RagieError;
        throw new Error(`Ragie API error: ${error.message || response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.name === 'TimeoutError') {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async getContext(options: RagieRequestOptions): Promise<RagieResponse> {
    try {
      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/retrievals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(options)
        }
      );

      const data = await response.json();
      return data as RagieResponse;
    } catch (error) {
      console.error('Error fetching context from Ragie:', error);
      return { scored_chunks: [] };
    }
  }

  async uploadDocument(content: string, metadata?: Record<string, any>) {
    try {
      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/documents/raw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({ content, metadata })
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Error uploading document to Ragie:', error);
      throw error;
    }
  }
} 
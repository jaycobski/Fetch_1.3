export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;
  private retries: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 30000; // Default 30s timeout
    this.retries = config.retries || 3;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async post<T>(path: string, body: any): Promise<T> {
    const url = new URL(path, this.baseUrl);
    
    try {
      // Ensure body is properly stringified
      const stringifiedBody = typeof body === 'string' ? body : JSON.stringify(body);

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'POST',
        headers: this.headers,
        body: stringifiedBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid JSON response from API');
      }
    } catch (error) {
      console.error('API request failed:', error);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeout}ms`);
      }
      throw error;
    }
  }
}
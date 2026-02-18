import {
  ProcurosApiError,
  ProcurosNetworkError,
  ProcurosRateLimitError,
  ProcurosTimeoutError,
  ProcurosValidationError,
} from './errors.js';

declare const __SDK_VERSION__: string;
const SDK_VERSION = typeof __SDK_VERSION__ !== 'undefined' ? __SDK_VERSION__ : '0.0.0-dev';

export interface HttpClientOptions {
  baseUrl: string;
  apiToken: string;
  timeout: number;
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryOnPost: boolean;
  fetch: typeof globalThis.fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface CombinedSignal {
  signal: AbortSignal;
  cleanup: () => void;
}

export class HttpClient {
  private readonly options: HttpClientOptions;

  constructor(options: HttpClientOptions) {
    this.options = options;
  }

  async get<T>(path: string, query?: Record<string, string | undefined>, requestOptions?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, query, requestOptions);
  }

  async post<T>(path: string, body?: unknown, requestOptions?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, undefined, requestOptions);
  }

  async put<T>(path: string, body?: unknown, requestOptions?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, undefined, requestOptions);
  }

  async getVoid(path: string, requestOptions?: RequestOptions): Promise<void> {
    await this.rawRequest('GET', path, undefined, undefined, requestOptions);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
    requestOptions?: RequestOptions,
  ): Promise<T> {
    const response = await this.rawRequest(method, path, body, query, requestOptions);
    return this.parseJsonResponse<T>(response, method, path);
  }

  private async rawRequest(
    method: HttpMethod,
    path: string,
    body?: unknown,
    query?: Record<string, string | undefined>,
    requestOptions?: RequestOptions,
  ): Promise<Response> {
    const url = this.buildUrl(path, query);
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.options.apiToken}`,
      'Accept': 'application/json',
      'User-Agent': `procuros-typescript-sdk/${SDK_VERSION}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const canRetry = this.isRetryable(method);
    let lastError: unknown;
    let rateLimitDelay: number | undefined;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      if (attempt > 0) {
        if (rateLimitDelay !== undefined) {
          await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
          rateLimitDelay = undefined;
        } else if (canRetry) {
          await this.backoff(attempt);
        } else {
          break;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
      const combined = requestOptions?.signal
        ? this.combineSignals(controller.signal, requestOptions.signal)
        : { signal: controller.signal, cleanup: undefined };

      try {
        const response = await this.options.fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: combined.signal,
        });

        if (response.ok) {
          return response;
        }

        if (response.status === 429 && attempt < this.options.maxRetries) {
          const retryAfterMs = this.parseRetryAfter(response.headers.get('Retry-After'));
          rateLimitDelay = retryAfterMs !== undefined
            ? Math.min(retryAfterMs, this.options.maxDelay)
            : this.computeBackoff(attempt + 1);
          lastError = await this.buildRateLimitError(response, method, path, retryAfterMs);
          continue;
        }

        if (response.status >= 500 && canRetry && attempt < this.options.maxRetries) {
          lastError = await this.buildApiError(response, method, path);
          continue;
        }

        if (response.status === 429) {
          throw await this.buildRateLimitError(response, method, path,
            this.parseRetryAfter(response.headers.get('Retry-After')));
        }

        throw await this.buildApiError(response, method, path);
      } catch (error) {
        if (error instanceof ProcurosApiError) {
          throw error;
        }

        if (this.isAbortError(error)) {
          if (requestOptions?.signal?.aborted) {
            throw new ProcurosNetworkError('Request was cancelled', { cause: error });
          }
          throw new ProcurosTimeoutError(this.options.timeout);
        }

        if (canRetry && attempt < this.options.maxRetries) {
          lastError = error;
          continue;
        }

        throw new ProcurosNetworkError(
          error instanceof Error ? error.message : 'Network request failed',
          { cause: error },
        );
      } finally {
        clearTimeout(timeoutId);
        combined.cleanup?.();
      }
    }

    if (lastError instanceof ProcurosRateLimitError || lastError instanceof ProcurosApiError) {
      throw lastError;
    }

    throw new ProcurosNetworkError(
      lastError instanceof Error ? lastError.message : 'Network request failed after retries',
      { cause: lastError },
    );
  }

  private isRetryable(method: HttpMethod): boolean {
    if (method === 'GET' || method === 'PUT') return true;
    if (method === 'POST' && this.options.retryOnPost) return true;
    return false;
  }

  private async backoff(attempt: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.computeBackoff(attempt)));
  }

  private computeBackoff(attempt: number): number {
    const base = this.options.baseDelay * Math.pow(2, attempt - 1);
    const jitter = base * (0.5 + Math.random() * 0.5);
    return Math.min(jitter, this.options.maxDelay);
  }

  private parseRetryAfter(header: string | null): number | undefined {
    if (!header) return undefined;
    const seconds = Number(header);
    if (!Number.isNaN(seconds) && seconds >= 0) {
      return seconds * 1000;
    }
    const dateMs = Date.parse(header);
    if (!Number.isNaN(dateMs)) {
      return Math.max(0, dateMs - Date.now());
    }
    return undefined;
  }

  private async buildRateLimitError(
    response: Response,
    method: string,
    path: string,
    retryAfterMs?: number,
  ): Promise<ProcurosRateLimitError> {
    let body: unknown;
    const text = await response.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : 'Rate limit exceeded';
    return new ProcurosRateLimitError(message, {
      status: 429,
      method,
      path,
      body,
      retryAfterMs,
    });
  }

  private buildUrl(path: string, query?: Record<string, string | undefined>): string {
    const url = new URL(path, this.options.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  }

  private async parseJsonResponse<T>(response: Response, method: string, path: string): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ProcurosApiError(
        `Expected JSON response but received non-JSON body`,
        { status: response.status, method, path, body: text },
      );
    }
  }

  private async buildApiError(response: Response, method: string, path: string): Promise<ProcurosApiError> {
    let body: unknown;
    const text = await response.text();

    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    if (response.status === 422 && typeof body === 'object' && body !== null && 'errors' in body) {
      const validationBody = body as { message?: string; errors?: Record<string, string[]>; errorUrl?: string };
      return new ProcurosValidationError(
        validationBody.message ?? `Validation failed`,
        {
          status: 422,
          method,
          path,
          body,
          fieldErrors: validationBody.errors ?? {},
          errorUrl: validationBody.errorUrl,
        },
      );
    }

    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : `API error: ${response.status}`;

    return new ProcurosApiError(message, {
      status: response.status,
      method,
      path,
      body,
    });
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }

  private combineSignals(internal: AbortSignal, external: AbortSignal): CombinedSignal {
    if (typeof AbortSignal.any === 'function') {
      return { signal: AbortSignal.any([internal, external]), cleanup: () => {} };
    }

    const controller = new AbortController();
    const onAbort = (): void => controller.abort();

    internal.addEventListener('abort', onAbort, { once: true });
    external.addEventListener('abort', onAbort, { once: true });

    return {
      signal: controller.signal,
      cleanup: () => {
        internal.removeEventListener('abort', onAbort);
        external.removeEventListener('abort', onAbort);
      },
    };
  }
}

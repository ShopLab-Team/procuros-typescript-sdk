import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ProcurosClient } from '../src/client.js';

export const TEST_TOKEN = 'test-api-token-12345';
export const BASE_URL = 'https://api.procuros.io';

export const server = setupServer();

export function createTestClient(
  overrides?: Partial<ConstructorParameters<typeof ProcurosClient>[0]>,
): ProcurosClient {
  return new ProcurosClient({
    apiToken: TEST_TOKEN,
    environment: 'production',
    timeout: 5_000,
    maxRetries: 0,
    ...overrides,
  });
}

export function createTestClientWithRetry(maxRetries = 2): ProcurosClient {
  return new ProcurosClient({
    apiToken: TEST_TOKEN,
    environment: 'production',
    timeout: 5_000,
    maxRetries,
    baseDelay: 10,
    maxDelay: 50,
  });
}

export function assertAuthHeader(request: Request): void {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${TEST_TOKEN}`) {
    throw new Error(`Expected Bearer ${TEST_TOKEN}, got ${auth}`);
  }
}

export { http, HttpResponse };

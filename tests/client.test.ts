import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ProcurosClient, ProcurosError } from '../src/index.js';
import { server, http, HttpResponse, BASE_URL, createTestClient } from './helpers.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ProcurosClient', () => {
  it('throws when apiToken is missing', () => {
    expect(() => new ProcurosClient({ apiToken: '' })).toThrow(ProcurosError);
  });

  it('defaults to production environment', async () => {
    server.use(
      http.get(`${BASE_URL}/v2/ping`, () => new HttpResponse(null, { status: 204 })),
    );

    const client = createTestClient();
    await expect(client.ping()).resolves.toBeUndefined();
  });

  it('uses staging URL when environment is staging', async () => {
    const stagingUrl = 'https://api.procuros-staging.io';
    server.use(
      http.get(`${stagingUrl}/v2/ping`, () => new HttpResponse(null, { status: 204 })),
    );

    const client = createTestClient({ environment: 'staging' });
    await expect(client.ping()).resolves.toBeUndefined();
  });

  it('exposes incoming, outgoing, and transactions resources', () => {
    const client = createTestClient();
    expect(client.incoming).toBeDefined();
    expect(client.outgoing).toBeDefined();
    expect(client.transactions).toBeDefined();
  });

  it('accepts custom timeout and retry config', () => {
    const client = new ProcurosClient({
      apiToken: 'token',
      timeout: 60_000,
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30_000,
      retryOnPost: true,
    });
    expect(client).toBeInstanceOf(ProcurosClient);
  });
});

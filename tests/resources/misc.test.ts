import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ProcurosApiError } from '../../src/index.js';
import { server, http, HttpResponse, BASE_URL, createTestClient, assertAuthHeader } from '../helpers.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Misc', () => {
  describe('ping', () => {
    it('succeeds with 204 response', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, ({ request }) => {
          assertAuthHeader(request);
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClient();
      await expect(client.ping()).resolves.toBeUndefined();
    });

    it('throws ProcurosApiError on failure', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
        ),
      );

      const client = createTestClient();
      await expect(client.ping()).rejects.toThrow(ProcurosApiError);
    });
  });
});

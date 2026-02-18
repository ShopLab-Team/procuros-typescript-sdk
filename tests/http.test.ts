import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import {
  ProcurosApiError,
  ProcurosValidationError,
  ProcurosRateLimitError,
  ProcurosNetworkError,
  ProcurosTimeoutError,
} from '../src/index.js';
import {
  server, http, HttpResponse, BASE_URL,
  createTestClient, createTestClientWithRetry, TEST_TOKEN,
} from './helpers.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HttpClient', () => {
  describe('auth and headers', () => {
    it('sends Bearer token in Authorization header', async () => {
      let capturedAuth = '';
      server.use(
        http.get(`${BASE_URL}/v2/ping`, ({ request }) => {
          capturedAuth = request.headers.get('Authorization') ?? '';
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClient();
      await client.ping();
      expect(capturedAuth).toBe(`Bearer ${TEST_TOKEN}`);
    });

    it('sends User-Agent header', async () => {
      let capturedUA = '';
      server.use(
        http.get(`${BASE_URL}/v2/ping`, ({ request }) => {
          capturedUA = request.headers.get('User-Agent') ?? '';
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClient();
      await client.ping();
      expect(capturedUA).toContain('procuros-typescript-sdk');
    });

    it('sends Content-Type on POST requests', async () => {
      let capturedCT = '';
      server.use(
        http.post(`${BASE_URL}/v2/errors`, ({ request }) => {
          capturedCT = request.headers.get('Content-Type') ?? '';
          return HttpResponse.json({ message: 'OK.' }, { status: 201 });
        }),
      );

      const client = createTestClient();
      await client.outgoing.reportError({ errorReason: 'test', errorType: 'DATA' });
      expect(capturedCT).toBe('application/json');
    });
  });

  describe('error handling', () => {
    it('throws ProcurosApiError on 4xx', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
        ),
      );

      const client = createTestClient();
      await expect(client.ping()).rejects.toThrow(ProcurosApiError);
    });

    it('throws ProcurosValidationError on 422 with errors field', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(
            { message: 'Validation failed', errors: { 'content.header.buyer': ['Required'] } },
            { status: 422 },
          ),
        ),
      );

      const client = createTestClient();
      try {
        await client.outgoing.send({ type: 'ORDER', content: {} as never });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ProcurosValidationError);
        const validationErr = err as ProcurosValidationError;
        expect(validationErr.fieldErrors).toHaveProperty('content.header.buyer');
        expect(validationErr.status).toBe(422);
        expect(validationErr.errorUrl).toBeUndefined();
      }
    });

    it('exposes errorUrl on ProcurosValidationError from transaction 422', async () => {
      const errorUrl = 'https://portal.procuros.io/errors/abc-123';
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(
            {
              message: 'The given data was invalid.',
              errors: { type: ['Transaction type is not valid'] },
              errorUrl,
            },
            { status: 422 },
          ),
        ),
      );

      const client = createTestClient();
      try {
        await client.outgoing.send({ type: 'ORDER', content: {} as never });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ProcurosValidationError);
        const validationErr = err as ProcurosValidationError;
        expect(validationErr.errorUrl).toBe(errorUrl);
        expect(validationErr.fieldErrors).toHaveProperty('type');
      }
    });

    it('throws ProcurosApiError on 5xx', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      const client = createTestClient();
      await expect(client.ping()).rejects.toThrow(ProcurosApiError);
    });

    it('handles non-JSON error responses gracefully', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          new HttpResponse('<html>Bad Gateway</html>', {
            status: 502,
            headers: { 'Content-Type': 'text/html' },
          }),
        ),
      );

      const client = createTestClient();
      try {
        await client.ping();
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ProcurosApiError);
        const apiErr = err as ProcurosApiError;
        expect(apiErr.status).toBe(502);
        expect(apiErr.body).toContain('Bad Gateway');
      }
    });

    it('does not leak token in error output', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
        ),
      );

      const client = createTestClient();
      try {
        await client.ping();
      } catch (err) {
        const json = JSON.stringify(err);
        expect(json).not.toContain(TEST_TOKEN);
      }
    });
  });

  describe('retry logic', () => {
    it('retries GET on 5xx', async () => {
      let attempts = 0;
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () => {
          attempts++;
          if (attempts < 3) {
            return HttpResponse.json({ message: 'Error' }, { status: 500 });
          }
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await client.ping();
      expect(attempts).toBe(3);
    });

    it('does NOT retry POST by default', async () => {
      let attempts = 0;
      server.use(
        http.post(`${BASE_URL}/v2/errors`, () => {
          attempts++;
          return HttpResponse.json({ message: 'Error' }, { status: 500 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await expect(
        client.outgoing.reportError({ errorReason: 'test', errorType: 'DATA' }),
      ).rejects.toThrow(ProcurosApiError);
      expect(attempts).toBe(1);
    });

    it('retries POST when retryOnPost is enabled', async () => {
      let attempts = 0;
      server.use(
        http.post(`${BASE_URL}/v2/errors`, () => {
          attempts++;
          if (attempts < 2) {
            return HttpResponse.json({ message: 'Error' }, { status: 500 });
          }
          return HttpResponse.json({ message: 'OK.' }, { status: 201 });
        }),
      );

      const client = createTestClient({ maxRetries: 2, baseDelay: 10, maxDelay: 50, retryOnPost: true });
      await client.outgoing.reportError({ errorReason: 'test', errorType: 'DATA' });
      expect(attempts).toBe(2);
    });

    it('throws after retries exhausted', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json({ message: 'Error' }, { status: 500 }),
        ),
      );

      const client = createTestClientWithRetry(2);
      await expect(client.ping()).rejects.toThrow(ProcurosApiError);
    });
  });

  describe('rate limiting (429)', () => {
    it('retries on 429 with Retry-After header and succeeds', async () => {
      let attempts = 0;
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () => {
          attempts++;
          if (attempts === 1) {
            return HttpResponse.json(
              { message: 'Too Many Requests' },
              { status: 429, headers: { 'Retry-After': '0' } },
            );
          }
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await client.ping();
      expect(attempts).toBe(2);
    });

    it('retries on 429 without Retry-After using backoff', async () => {
      let attempts = 0;
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () => {
          attempts++;
          if (attempts === 1) {
            return HttpResponse.json({ message: 'Too Many Requests' }, { status: 429 });
          }
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await client.ping();
      expect(attempts).toBe(2);
    });

    it('throws ProcurosRateLimitError after retries exhausted on 429', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () =>
          HttpResponse.json(
            { message: 'Too Many Requests' },
            { status: 429, headers: { 'Retry-After': '0' } },
          ),
        ),
      );

      const client = createTestClientWithRetry(1);
      try {
        await client.ping();
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ProcurosRateLimitError);
        expect(err).toBeInstanceOf(ProcurosApiError);
        const rle = err as ProcurosRateLimitError;
        expect(rle.status).toBe(429);
        expect(rle.retryAfterMs).toBe(0);
      }
    });

    it('retries on 429 with Retry-After as HTTP-date', async () => {
      let attempts = 0;
      server.use(
        http.get(`${BASE_URL}/v2/ping`, () => {
          attempts++;
          if (attempts === 1) {
            const futureDate = new Date(Date.now() + 100).toUTCString();
            return HttpResponse.json(
              { message: 'Too Many Requests' },
              { status: 429, headers: { 'Retry-After': futureDate } },
            );
          }
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await client.ping();
      expect(attempts).toBe(2);
    });

    it('retries 429 even on POST (rate-limit retries are always safe)', async () => {
      let attempts = 0;
      server.use(
        http.post(`${BASE_URL}/v2/errors`, () => {
          attempts++;
          if (attempts === 1) {
            return HttpResponse.json(
              { message: 'Too Many Requests' },
              { status: 429, headers: { 'Retry-After': '0' } },
            );
          }
          return HttpResponse.json({ message: 'OK.' }, { status: 201 });
        }),
      );

      const client = createTestClientWithRetry(2);
      await client.outgoing.reportError({ errorReason: 'test', errorType: 'DATA' });
      expect(attempts).toBe(2);
    });
  });

  describe('timeout and cancellation', () => {
    it('throws ProcurosTimeoutError when request exceeds timeout', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const client = createTestClient({ timeout: 100 });
      await expect(client.ping()).rejects.toThrow(ProcurosTimeoutError);
    });

    it('throws ProcurosNetworkError when per-request signal is aborted', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/ping`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 50);

      const client = createTestClient({ timeout: 10_000 });
      await expect(client.ping({ signal: controller.signal })).rejects.toThrow(ProcurosNetworkError);
    });
  });
});

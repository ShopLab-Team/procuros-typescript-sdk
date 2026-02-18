import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ProcurosError } from '../../src/index.js';
import { server, http, HttpResponse, BASE_URL, createTestClient, assertAuthHeader } from '../helpers.js';
import { sampleOrder } from '../fixtures/order.js';
import { sampleProductCatalog } from '../fixtures/product-catalog.js';
import { sampleCreditNote } from '../fixtures/credit-note.js';
import type { ReceivedTransaction, PaginatedResponse } from '../../src/types/responses.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const makePage = (
  items: ReceivedTransaction[],
  hasMore: boolean,
  nextCursor: string | null,
): PaginatedResponse<ReceivedTransaction> => ({
  items,
  hasMore,
  perPage: 100,
  count: items.length,
  nextCursor,
  nextPageUrl: nextCursor ? `${BASE_URL}/v2/transactions?cursor=${nextCursor}` : null,
});

const sampleReceived: ReceivedTransaction = {
  procurosTransactionId: '949b2f25-fd9d-4c58-8899-b4dc277f8cf9',
  type: 'ORDER',
  content: sampleOrder,
};

describe('IncomingTransactions', () => {
  describe('list', () => {
    it('returns paginated transactions', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, ({ request }) => {
          assertAuthHeader(request);
          return HttpResponse.json(makePage([sampleReceived], false, null));
        }),
      );

      const client = createTestClient();
      const page = await client.incoming.list();
      expect(page.items).toHaveLength(1);
      expect(page.items[0]!.type).toBe('ORDER');
      expect(page.hasMore).toBe(false);
    });

    it('passes filter[type] and pagination params', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('filter[type]')).toBe('INVOICE');
          expect(url.searchParams.get('per_page')).toBe('50');
          expect(url.searchParams.get('cursor')).toBe('abc');
          return HttpResponse.json(makePage([], false, null));
        }),
      );

      const client = createTestClient();
      await client.incoming.list({ type: 'INVOICE', perPage: 50, cursor: 'abc' });
    });

    it('returns empty page', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(makePage([], false, null)),
        ),
      );

      const client = createTestClient();
      const page = await client.incoming.list();
      expect(page.items).toHaveLength(0);
      expect(page.hasMore).toBe(false);
    });

    it('receives PRODUCT_CATALOG content correctly', async () => {
      const received: ReceivedTransaction = {
        procurosTransactionId: 'pc-rx-uuid',
        type: 'PRODUCT_CATALOG',
        content: sampleProductCatalog,
      };
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(makePage([received], false, null)),
        ),
      );

      const client = createTestClient();
      const page = await client.incoming.list({ type: 'PRODUCT_CATALOG' });
      expect(page.items).toHaveLength(1);
      expect(page.items[0]!.type).toBe('PRODUCT_CATALOG');
      expect(page.items[0]!.content).toEqual(sampleProductCatalog);
    });

    it('receives CREDIT_NOTE content correctly', async () => {
      const received: ReceivedTransaction = {
        procurosTransactionId: 'cn-rx-uuid',
        type: 'CREDIT_NOTE',
        content: sampleCreditNote,
      };
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(makePage([received], false, null)),
        ),
      );

      const client = createTestClient();
      const page = await client.incoming.list({ type: 'CREDIT_NOTE' });
      expect(page.items).toHaveLength(1);
      expect(page.items[0]!.type).toBe('CREDIT_NOTE');
      expect(page.items[0]!.content).toEqual(sampleCreditNote);
    });
  });

  describe('listAll', () => {
    it('iterates through multiple pages', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, ({ request }) => {
          callCount++;
          const url = new URL(request.url);
          const cursor = url.searchParams.get('cursor');

          if (!cursor) {
            return HttpResponse.json(makePage([sampleReceived], true, 'page2'));
          }
          return HttpResponse.json(makePage([{ ...sampleReceived, procurosTransactionId: '2nd-uuid' }], false, null));
        }),
      );

      const client = createTestClient();
      const results: ReceivedTransaction[] = [];
      for await (const tx of client.incoming.listAll()) {
        results.push(tx);
      }

      expect(results).toHaveLength(2);
      expect(callCount).toBe(2);
    });

    it('handles empty first page', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json(makePage([], false, null)),
        ),
      );

      const client = createTestClient();
      const results: ReceivedTransaction[] = [];
      for await (const tx of client.incoming.listAll()) {
        results.push(tx);
      }
      expect(results).toHaveLength(0);
    });
  });

  describe('markProcessed', () => {
    it('marks transaction as successfully processed', async () => {
      server.use(
        http.put(`${BASE_URL}/v2/transactions/:id`, async ({ request, params }) => {
          assertAuthHeader(request);
          expect(params['id']).toBe('949b2f25-fd9d-4c58-8899-b4dc277f8cf9');
          const body = await request.json();
          expect(body).toEqual({ success: true });
          return HttpResponse.json({ data: { message: 'OK.' } });
        }),
      );

      const client = createTestClient();
      const res = await client.incoming.markProcessed(
        '949b2f25-fd9d-4c58-8899-b4dc277f8cf9',
        { success: true },
      );
      expect(res.data.message).toBe('OK.');
    });

    it('marks transaction as failed with error details', async () => {
      server.use(
        http.put(`${BASE_URL}/v2/transactions/:id`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body['success']).toBe(false);
          expect(body['errorReason']).toBe('Not found');
          expect(body['errorType']).toBe('DATA');
          return HttpResponse.json({
            data: { message: 'OK.', errorUrl: 'https://portal.procuros.io/errors/1' },
          });
        }),
      );

      const client = createTestClient();
      const res = await client.incoming.markProcessed(
        '949b2f25-fd9d-4c58-8899-b4dc277f8cf9',
        { success: false, errorReason: 'Not found', errorType: 'DATA' },
      );
      expect(res.data.errorUrl).toBeDefined();
    });

    it('throws ProcurosError for invalid UUID', async () => {
      const client = createTestClient();
      await expect(
        client.incoming.markProcessed('not-a-uuid', { success: true }),
      ).rejects.toThrow(ProcurosError);
    });
  });

  describe('bulkMarkProcessed', () => {
    it('bulk marks transactions as processed', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions/bulk/mark-processed`, async ({ request }) => {
          assertAuthHeader(request);
          const body = await request.json() as { items: unknown[] };
          expect(body.items).toHaveLength(2);
          return HttpResponse.json({
            data: [
              { procurosTransactionId: 'id1', message: 'OK.' },
              { procurosTransactionId: 'id2', message: 'OK.', errorUrl: 'https://...' },
            ],
          });
        }),
      );

      const client = createTestClient();
      const res = await client.incoming.bulkMarkProcessed([
        { procurosTransactionId: 'id1', success: true },
        { procurosTransactionId: 'id2', success: false, errorReason: 'Missing GTIN', errorType: 'DATA' },
      ]);
      expect(res.data).toHaveLength(2);
    });

    it('throws ProcurosError when items array is empty', async () => {
      const client = createTestClient();
      await expect(client.incoming.bulkMarkProcessed([])).rejects.toThrow(ProcurosError);
    });
  });

  describe('input validation', () => {
    it('throws ProcurosError when perPage is 0', async () => {
      const client = createTestClient();
      await expect(client.incoming.list({ perPage: 0 })).rejects.toThrow(ProcurosError);
    });

    it('throws ProcurosError when perPage exceeds 100', async () => {
      const client = createTestClient();
      await expect(client.incoming.list({ perPage: 101 })).rejects.toThrow(ProcurosError);
    });

    it('throws ProcurosError when perPage is not an integer', async () => {
      const client = createTestClient();
      await expect(client.incoming.list({ perPage: 50.5 })).rejects.toThrow(ProcurosError);
    });
  });
});

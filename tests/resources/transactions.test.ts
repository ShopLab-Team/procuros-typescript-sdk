import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { ProcurosError } from '../../src/index.js';
import { server, http, HttpResponse, BASE_URL, createTestClient, assertAuthHeader } from '../helpers.js';
import { sampleOrder } from '../fixtures/order.js';
import type { Transaction, PaginatedResponse } from '../../src/types/responses.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const sampleTransaction: Transaction = {
  procurosTransactionId: '949b2f25-fd9d-4c58-8899-b4dc277f8cf9',
  type: 'ORDER',
  status: 'SUCCESS',
  flow: 'LIVE',
  createdAt: '2024-01-01T00:00:00+00:00',
  content: sampleOrder,
};

const makePage = (
  items: Transaction[],
  hasMore: boolean,
  nextCursor: string | null,
): PaginatedResponse<Transaction> => ({
  items,
  hasMore,
  perPage: 100,
  count: items.length,
  nextCursor,
  nextPageUrl: nextCursor ? `${BASE_URL}/v2/all-transactions?cursor=${nextCursor}` : null,
});

describe('AllTransactions', () => {
  describe('list', () => {
    it('returns paginated transactions', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/all-transactions`, ({ request }) => {
          assertAuthHeader(request);
          return HttpResponse.json(makePage([sampleTransaction], false, null));
        }),
      );

      const client = createTestClient();
      const page = await client.transactions.list();
      expect(page.items).toHaveLength(1);
      expect(page.items[0]!.status).toBe('SUCCESS');
    });

    it('passes all filter params', async () => {
      server.use(
        http.get(`${BASE_URL}/v2/all-transactions`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('filter[type]')).toBe('ORDER');
          expect(url.searchParams.get('filter[flow]')).toBe('LIVE');
          expect(url.searchParams.get('filter[status]')).toBe('SUCCESS');
          expect(url.searchParams.get('filter[created_between]')).toBe('2024-01-01,2024-01-31');
          expect(url.searchParams.get('per_page')).toBe('25');
          return HttpResponse.json(makePage([], false, null));
        }),
      );

      const client = createTestClient();
      await client.transactions.list({
        type: 'ORDER',
        flow: 'LIVE',
        status: 'SUCCESS',
        createdBetween: '2024-01-01,2024-01-31',
        perPage: 25,
      });
    });
  });

  describe('listAll', () => {
    it('iterates through multiple pages', async () => {
      let callCount = 0;
      server.use(
        http.get(`${BASE_URL}/v2/all-transactions`, ({ request }) => {
          callCount++;
          const url = new URL(request.url);
          const cursor = url.searchParams.get('cursor');

          if (!cursor) {
            return HttpResponse.json(makePage([sampleTransaction], true, 'page2'));
          }
          return HttpResponse.json(makePage(
            [{ ...sampleTransaction, procurosTransactionId: '2nd-uuid' }],
            false,
            null,
          ));
        }),
      );

      const client = createTestClient();
      const results: Transaction[] = [];
      for await (const tx of client.transactions.listAll()) {
        results.push(tx);
      }

      expect(results).toHaveLength(2);
      expect(callCount).toBe(2);
    });
  });

  describe('get', () => {
    it('returns a single transaction', async () => {
      const txId = '949b2f25-fd9d-4c58-8899-b4dc277f8cf9';
      server.use(
        http.get(`${BASE_URL}/v2/all-transactions/:id`, ({ request, params }) => {
          assertAuthHeader(request);
          expect(params['id']).toBe(txId);
          return HttpResponse.json({ data: sampleTransaction });
        }),
      );

      const client = createTestClient();
      const tx = await client.transactions.get(txId);
      expect(tx.procurosTransactionId).toBe(txId);
      expect(tx.type).toBe('ORDER');
    });

    it('throws ProcurosError for invalid UUID', async () => {
      const client = createTestClient();
      await expect(client.transactions.get('invalid')).rejects.toThrow(ProcurosError);
    });
  });
});

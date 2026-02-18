/**
 * Full SDK Simulation — Mock API (MSW) based on openapi-v2.yaml
 *
 * Exercises every public SDK method against locally mocked endpoints.
 * No real network calls. Temporary file — safe to delete after run.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ProcurosClient } from '../src/client.js';
import {
  ProcurosApiError,
  ProcurosValidationError,
  ProcurosError,
} from '../src/errors.js';
import { sampleOrder } from './fixtures/order.js';
import { sampleInvoice } from './fixtures/invoice.js';
import { sampleShippingNotice } from './fixtures/shipping-notice.js';
import { sampleProductCatalog } from './fixtures/product-catalog.js';
import { sampleCreditNote } from './fixtures/credit-note.js';

const BASE = 'https://api.procuros.io';
const TOKEN = 'sim-token-abc123';

const TX_ID_1 = '949b2f25-fd9d-4c58-8899-b4dc277f8cf9';
const TX_ID_2 = '94fe13aa-8c9b-40e5-9937-42b852185858';
const TX_ID_3 = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function makeReceivedTx(id: string, type: string, content: unknown) {
  return { procurosTransactionId: id, type, content };
}

function makeFullTx(id: string, type: string, content: unknown) {
  return {
    procurosTransactionId: id,
    type,
    flow: 'LIVE',
    status: 'SUCCESS',
    createdAt: '2024-01-15T10:30:00+00:00',
    content,
  };
}

function assertBearer(req: Request) {
  expect(req.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
}

const handlers = [
  // ── GET /v2/ping → 204 ──
  http.get(`${BASE}/v2/ping`, ({ request }) => {
    assertBearer(request);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── GET /v2/transactions → paginated incoming ──
  http.get(`${BASE}/v2/transactions`, ({ request }) => {
    assertBearer(request);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const perPage = Number(url.searchParams.get('per_page') ?? '100');
    const filterType = url.searchParams.get('filter[type]');

    if (cursor === 'page2') {
      return HttpResponse.json({
        items: [makeReceivedTx(TX_ID_3, filterType ?? 'INVOICE', sampleInvoice)],
        hasMore: false,
        perPage,
        count: 1,
        nextCursor: null,
        nextPageUrl: null,
      });
    }

    const items = [
      makeReceivedTx(TX_ID_1, 'ORDER', sampleOrder),
      makeReceivedTx(TX_ID_2, 'SHIPPING_NOTICE', sampleShippingNotice),
    ];
    const filtered = filterType ? items.filter((i) => i.type === filterType) : items;

    return HttpResponse.json({
      items: filtered,
      hasMore: true,
      perPage,
      count: filtered.length,
      nextCursor: 'page2',
      nextPageUrl: `${BASE}/v2/transactions?cursor=page2`,
    });
  }),

  // ── PUT /v2/transactions/:id → mark processed ──
  http.put(`${BASE}/v2/transactions/:id`, async ({ request, params }) => {
    assertBearer(request);
    const body = (await request.json()) as { success: boolean };
    const id = params['id'] as string;
    const resp: Record<string, unknown> = { message: 'OK.' };
    if (!body.success) {
      resp['errorUrl'] = `https://portal.procuros.io/transactions/${id}/errors`;
    }
    return HttpResponse.json({ data: resp });
  }),

  // ── POST /v2/transactions/bulk/mark-processed ──
  http.post(`${BASE}/v2/transactions/bulk/mark-processed`, async ({ request }) => {
    assertBearer(request);
    const { items } = (await request.json()) as {
      items: Array<{ procurosTransactionId: string; success: boolean }>;
    };
    const data = items.map((item) => ({
      procurosTransactionId: item.procurosTransactionId,
      message: 'OK.',
      ...(item.success ? {} : {
        errorUrl: `https://portal.procuros.io/transactions/${item.procurosTransactionId}/errors`,
      }),
    }));
    return HttpResponse.json({ data });
  }),

  // ── POST /v2/transactions → send outgoing (201) ──
  http.post(`${BASE}/v2/transactions`, async ({ request }) => {
    assertBearer(request);
    const body = (await request.json()) as { type: string };
    return HttpResponse.json(
      { message: `Transaction of type ${body.type} accepted.` },
      { status: 201 },
    );
  }),

  // ── GET /v2/all-transactions → paginated full list ──
  http.get(`${BASE}/v2/all-transactions`, ({ request }) => {
    assertBearer(request);
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const perPage = Number(url.searchParams.get('per_page') ?? '100');

    if (cursor === 'allpage2') {
      return HttpResponse.json({
        items: [makeFullTx(TX_ID_3, 'INVOICE', sampleInvoice)],
        hasMore: false,
        perPage,
        count: 1,
        nextCursor: null,
        nextPageUrl: null,
      });
    }

    return HttpResponse.json({
      items: [
        makeFullTx(TX_ID_1, 'ORDER', sampleOrder),
        makeFullTx(TX_ID_2, 'SHIPPING_NOTICE', sampleShippingNotice),
      ],
      hasMore: true,
      perPage,
      count: 2,
      nextCursor: 'allpage2',
      nextPageUrl: `${BASE}/v2/all-transactions?cursor=allpage2`,
    });
  }),

  // ── GET /v2/all-transactions/:id → show transaction ──
  http.get(`${BASE}/v2/all-transactions/:id`, ({ request, params }) => {
    assertBearer(request);
    const id = params['id'] as string;
    return HttpResponse.json({
      data: makeFullTx(id, 'ORDER', sampleOrder),
    });
  }),

  // ── POST /v2/errors → report error (201) ──
  http.post(`${BASE}/v2/errors`, async ({ request }) => {
    assertBearer(request);
    return HttpResponse.json(
      {
        message: 'OK.',
        errorUrl: 'https://portal.procuros.io/errors/err-001',
      },
      { status: 201 },
    );
  }),
];

const server = setupServer(...handlers);

function createClient(overrides?: Record<string, unknown>): ProcurosClient {
  return new ProcurosClient({
    apiToken: TOKEN,
    environment: 'production',
    timeout: 5_000,
    maxRetries: 0,
    ...overrides,
  });
}

// ─────────────────────────── Test Suite ───────────────────────────

describe('Full SDK Simulation against Mock API', () => {
  let client: ProcurosClient;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    client = createClient();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // ── Ping ──
  describe('ping', () => {
    it('returns successfully on 204', async () => {
      await expect(client.ping()).resolves.toBeUndefined();
    });

    it('throws on 401 Unauthorized', async () => {
      server.use(
        http.get(`${BASE}/v2/ping`, () =>
          HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
        ),
      );
      const err = await client.ping().catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ProcurosApiError);
      expect((err as ProcurosApiError).status).toBe(401);
    });
  });

  // ── Incoming Transactions ──
  describe('incoming.list', () => {
    it('returns first page with items', async () => {
      const page = await client.incoming.list({ perPage: 50 });
      expect(page.items).toHaveLength(2);
      expect(page.hasMore).toBe(true);
      expect(page.nextCursor).toBe('page2');
      expect(page.items[0]!.type).toBe('ORDER');
      expect(page.items[1]!.type).toBe('SHIPPING_NOTICE');
    });

    it('returns second page via cursor', async () => {
      const page = await client.incoming.list({ cursor: 'page2' });
      expect(page.items).toHaveLength(1);
      expect(page.hasMore).toBe(false);
      expect(page.nextCursor).toBeNull();
    });

    it('filters by type', async () => {
      const page = await client.incoming.list({ type: 'ORDER' });
      expect(page.items).toHaveLength(1);
      expect(page.items[0]!.type).toBe('ORDER');
    });
  });

  describe('incoming.listAll (auto-pagination)', () => {
    it('iterates all pages yielding 3 transactions total', async () => {
      const items = [];
      for await (const tx of client.incoming.listAll()) {
        items.push(tx);
      }
      expect(items).toHaveLength(3);
      expect(items[0]!.procurosTransactionId).toBe(TX_ID_1);
      expect(items[2]!.procurosTransactionId).toBe(TX_ID_3);
    });
  });

  describe('incoming.markProcessed', () => {
    it('marks as success', async () => {
      const resp = await client.incoming.markProcessed(TX_ID_1, { success: true });
      expect(resp.data.message).toBe('OK.');
      expect(resp.data.errorUrl).toBeUndefined();
    });

    it('marks as failed with errorUrl', async () => {
      const resp = await client.incoming.markProcessed(TX_ID_1, {
        success: false,
        errorReason: "GTIN '000' not found",
        errorType: 'DATA',
      });
      expect(resp.data.message).toBe('OK.');
      expect(resp.data.errorUrl).toContain(TX_ID_1);
    });

    it('rejects invalid UUID', async () => {
      await expect(
        client.incoming.markProcessed('not-a-uuid', { success: true }),
      ).rejects.toThrow(ProcurosError);
    });
  });

  describe('incoming.bulkMarkProcessed', () => {
    it('processes multiple items', async () => {
      const resp = await client.incoming.bulkMarkProcessed([
        { procurosTransactionId: TX_ID_1, success: true },
        { procurosTransactionId: TX_ID_2, success: false, errorReason: 'Bad data', errorType: 'DATA' },
      ]);
      expect(resp.data).toHaveLength(2);
      expect(resp.data[0]!.message).toBe('OK.');
      expect(resp.data[1]!.errorUrl).toBeDefined();
    });
  });

  // ── Outgoing Transactions ──
  describe('outgoing.send', () => {
    it('sends an ORDER', async () => {
      await expect(
        client.outgoing.send({ type: 'ORDER', content: sampleOrder }),
      ).resolves.not.toThrow();
    });

    it('sends an INVOICE', async () => {
      await expect(
        client.outgoing.send({ type: 'INVOICE', content: sampleInvoice }),
      ).resolves.not.toThrow();
    });

    it('sends a SHIPPING_NOTICE', async () => {
      await expect(
        client.outgoing.send({ type: 'SHIPPING_NOTICE', content: sampleShippingNotice }),
      ).resolves.not.toThrow();
    });

    it('sends a PRODUCT_CATALOG', async () => {
      await expect(
        client.outgoing.send({ type: 'PRODUCT_CATALOG', content: sampleProductCatalog }),
      ).resolves.not.toThrow();
    });

    it('sends a CREDIT_NOTE', async () => {
      await expect(
        client.outgoing.send({ type: 'CREDIT_NOTE', content: sampleCreditNote }),
      ).resolves.not.toThrow();
    });

    it('handles 422 validation error', async () => {
      server.use(
        http.post(`${BASE}/v2/transactions`, () =>
          HttpResponse.json(
            {
              message: 'The given data was invalid.',
              errors: {
                'content.header.orderIdentifier': ['The order identifier field is required.'],
                'content.items.0.quantity': ['The quantity must be greater than 0.'],
              },
            },
            { status: 422 },
          ),
        ),
      );

      const err = await client.outgoing
        .send({ type: 'ORDER', content: sampleOrder })
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(ProcurosValidationError);
      const ve = err as ProcurosValidationError;
      expect(ve.status).toBe(422);
      expect(ve.fieldErrors).toHaveProperty('content.header.orderIdentifier');
      expect(ve.fieldErrors['content.items.0.quantity']![0]).toContain('greater than 0');
    });
  });

  describe('outgoing.reportError', () => {
    it('reports an error and gets errorUrl', async () => {
      const resp = await client.outgoing.reportError({
        errorReason: 'Failed to build invoice',
        errorType: 'INTERNAL',
        transactionIdentifier: 'IV-0001',
        transactionType: 'INVOICE',
      });
      expect(resp.message).toBe('OK.');
      expect(resp.errorUrl).toContain('portal.procuros.io');
    });
  });

  // ── All Transactions ──
  describe('transactions.list', () => {
    it('returns paginated results', async () => {
      const page = await client.transactions.list({ perPage: 25 });
      expect(page.items).toHaveLength(2);
      expect(page.hasMore).toBe(true);
      expect(page.items[0]!.flow).toBe('LIVE');
      expect(page.items[0]!.status).toBe('SUCCESS');
      expect(page.items[0]!.createdAt).toBeDefined();
    });

    it('returns second page', async () => {
      const page = await client.transactions.list({ cursor: 'allpage2' });
      expect(page.items).toHaveLength(1);
      expect(page.hasMore).toBe(false);
    });
  });

  describe('transactions.listAll (auto-pagination)', () => {
    it('iterates all pages yielding 3 full transactions', async () => {
      const items = [];
      for await (const tx of client.transactions.listAll({ flow: 'LIVE' })) {
        items.push(tx);
      }
      expect(items).toHaveLength(3);
      expect(items[0]!.status).toBe('SUCCESS');
      expect(items[2]!.type).toBe('INVOICE');
    });
  });

  describe('transactions.get', () => {
    it('returns a single transaction', async () => {
      const tx = await client.transactions.get(TX_ID_1);
      expect(tx.procurosTransactionId).toBe(TX_ID_1);
      expect(tx.type).toBe('ORDER');
      expect(tx.flow).toBe('LIVE');
      expect(tx.content).toEqual(sampleOrder);
    });

    it('rejects invalid UUID', async () => {
      await expect(client.transactions.get('bad-id')).rejects.toThrow(ProcurosError);
    });

    it('handles 404 Not Found', async () => {
      server.use(
        http.get(`${BASE}/v2/all-transactions/:id`, () =>
          HttpResponse.json({ message: 'Transaction not found.' }, { status: 404 }),
        ),
      );
      const err = await client.transactions.get(TX_ID_1).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ProcurosApiError);
      expect((err as ProcurosApiError).status).toBe(404);
    });
  });

  // ── Error Scenarios ──
  describe('error handling', () => {
    it('handles 500 server error', async () => {
      server.use(
        http.get(`${BASE}/v2/all-transactions`, () =>
          HttpResponse.json({ message: 'Internal server error.' }, { status: 500 }),
        ),
      );
      const err = await client.transactions.list().catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ProcurosApiError);
      expect((err as ProcurosApiError).status).toBe(500);
    });

    it('retries on 500 when maxRetries > 0', async () => {
      let attempts = 0;
      server.use(
        http.get(`${BASE}/v2/all-transactions`, () => {
          attempts++;
          if (attempts < 3) {
            return HttpResponse.json({ message: 'Error' }, { status: 500 });
          }
          return HttpResponse.json({
            items: [],
            hasMore: false,
            perPage: 100,
            count: 0,
            nextCursor: null,
            nextPageUrl: null,
          });
        }),
      );
      const retryClient = createClient({ maxRetries: 2, baseDelay: 10, maxDelay: 50 });
      const page = await retryClient.transactions.list();
      expect(page.items).toHaveLength(0);
      expect(attempts).toBe(3);
    });

    it('rejects missing apiToken', () => {
      expect(() => new ProcurosClient({ apiToken: '' })).toThrow(ProcurosError);
    });

    it('supports AbortSignal cancellation', async () => {
      server.use(
        http.get(`${BASE}/v2/ping`, async () => {
          await new Promise((r) => setTimeout(r, 5_000));
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 50);

      await expect(client.ping({ signal: controller.signal })).rejects.toThrow();
    });
  });

  // ── Staging Environment ──
  describe('staging environment', () => {
    it('targets staging URL', async () => {
      server.use(
        http.get('https://api.procuros-staging.io/v2/ping', () =>
          new HttpResponse(null, { status: 204 }),
        ),
      );

      const stagingClient = new ProcurosClient({
        apiToken: TOKEN,
        environment: 'staging',
        timeout: 5_000,
        maxRetries: 0,
      });

      await expect(stagingClient.ping()).resolves.toBeUndefined();
    });
  });
});

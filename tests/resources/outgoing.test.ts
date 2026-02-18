import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server, http, HttpResponse, BASE_URL, createTestClient, assertAuthHeader } from '../helpers.js';
import { sampleOrder } from '../fixtures/order.js';
import { sampleInvoice } from '../fixtures/invoice.js';
import { sampleShippingNotice } from '../fixtures/shipping-notice.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OutgoingTransactions', () => {
  describe('send', () => {
    it('sends an ORDER transaction and returns procurosTransactionId', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          assertAuthHeader(request);
          const body = await request.json() as { type: string };
          expect(body.type).toBe('ORDER');
          return HttpResponse.json({ procurosTransactionId: 'new-uuid' }, { status: 201 });
        }),
      );

      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'ORDER', content: sampleOrder });
      expect(result).toHaveProperty('procurosTransactionId', 'new-uuid');
    });

    it('sends an INVOICE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('INVOICE');
          return HttpResponse.json({ procurosTransactionId: 'invoice-uuid' }, { status: 201 });
        }),
      );

      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'INVOICE', content: sampleInvoice });
      expect(result).toHaveProperty('procurosTransactionId', 'invoice-uuid');
    });

    it('sends a SHIPPING_NOTICE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('SHIPPING_NOTICE');
          return HttpResponse.json({ procurosTransactionId: 'sn-uuid' }, { status: 201 });
        }),
      );

      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'SHIPPING_NOTICE', content: sampleShippingNotice });
      expect(result).toHaveProperty('procurosTransactionId', 'sn-uuid');
    });

    it('handles 202 Accepted (trade relationship not yet active)', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, () =>
          HttpResponse.json({ message: 'Trade relationship not yet active.' }, { status: 202 }),
        ),
      );

      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'ORDER', content: sampleOrder });
      expect(result).toHaveProperty('message', 'Trade relationship not yet active.');
    });
  });

  describe('reportError', () => {
    it('reports an outgoing error', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/errors`, async ({ request }) => {
          assertAuthHeader(request);
          const body = await request.json() as Record<string, unknown>;
          expect(body['errorReason']).toBe('Product not found');
          expect(body['errorType']).toBe('DATA');
          return HttpResponse.json(
            { message: 'OK.', errorUrl: 'https://portal.procuros.io/errors/42' },
            { status: 201 },
          );
        }),
      );

      const client = createTestClient();
      const res = await client.outgoing.reportError({
        errorReason: 'Product not found',
        errorType: 'DATA',
        transactionIdentifier: 'PO-123',
        transactionType: 'ORDER',
      });
      expect(res.message).toBe('OK.');
      expect(res.errorUrl).toContain('portal.procuros.io');
    });

    it('reports error with context', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/errors`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          expect(body['errorContext']).toEqual({ orderId: '123' });
          return HttpResponse.json({ message: 'OK.' }, { status: 201 });
        }),
      );

      const client = createTestClient();
      await client.outgoing.reportError({
        errorReason: 'Internal failure',
        errorType: 'INTERNAL',
        errorContext: { orderId: '123' },
      });
    });
  });
});

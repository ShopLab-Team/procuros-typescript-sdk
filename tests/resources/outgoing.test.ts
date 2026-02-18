import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server, http, HttpResponse, BASE_URL, createTestClient, assertAuthHeader } from '../helpers.js';
import { sampleOrder } from '../fixtures/order.js';
import { sampleInvoice } from '../fixtures/invoice.js';
import { sampleShippingNotice } from '../fixtures/shipping-notice.js';
import { sampleOrderResponse } from '../fixtures/order-response.js';
import { sampleCreditNote } from '../fixtures/credit-note.js';
import { sampleDispatchInstruction } from '../fixtures/dispatch-instruction.js';
import { sampleDispatchInstructionResponse } from '../fixtures/dispatch-instruction-response.js';
import { sampleReceivalNotice } from '../fixtures/receival-notice.js';
import { sampleRemittanceAdvice } from '../fixtures/remittance-advice.js';
import { sampleProductCatalog } from '../fixtures/product-catalog.js';
import { sampleInventoryReport } from '../fixtures/inventory-report.js';
import { sampleSalesReport } from '../fixtures/sales-report.js';

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

    it('sends an ORDER_RESPONSE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('ORDER_RESPONSE');
          return HttpResponse.json({ procurosTransactionId: 'or-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'ORDER_RESPONSE', content: sampleOrderResponse });
      expect(result).toHaveProperty('procurosTransactionId', 'or-uuid');
    });

    it('sends a CREDIT_NOTE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('CREDIT_NOTE');
          return HttpResponse.json({ procurosTransactionId: 'cn-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'CREDIT_NOTE', content: sampleCreditNote });
      expect(result).toHaveProperty('procurosTransactionId', 'cn-uuid');
    });

    it('sends a DISPATCH_INSTRUCTION transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('DISPATCH_INSTRUCTION');
          return HttpResponse.json({ procurosTransactionId: 'di-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'DISPATCH_INSTRUCTION', content: sampleDispatchInstruction });
      expect(result).toHaveProperty('procurosTransactionId', 'di-uuid');
    });

    it('sends a DISPATCH_INSTRUCTION_RESPONSE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('DISPATCH_INSTRUCTION_RESPONSE');
          return HttpResponse.json({ procurosTransactionId: 'dir-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'DISPATCH_INSTRUCTION_RESPONSE', content: sampleDispatchInstructionResponse });
      expect(result).toHaveProperty('procurosTransactionId', 'dir-uuid');
    });

    it('sends a RECEIVAL_NOTICE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('RECEIVAL_NOTICE');
          return HttpResponse.json({ procurosTransactionId: 'rn-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'RECEIVAL_NOTICE', content: sampleReceivalNotice });
      expect(result).toHaveProperty('procurosTransactionId', 'rn-uuid');
    });

    it('sends a REMITTANCE_ADVICE transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('REMITTANCE_ADVICE');
          return HttpResponse.json({ procurosTransactionId: 'ra-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'REMITTANCE_ADVICE', content: sampleRemittanceAdvice });
      expect(result).toHaveProperty('procurosTransactionId', 'ra-uuid');
    });

    it('sends a PRODUCT_CATALOG transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('PRODUCT_CATALOG');
          return HttpResponse.json({ procurosTransactionId: 'pc-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'PRODUCT_CATALOG', content: sampleProductCatalog });
      expect(result).toHaveProperty('procurosTransactionId', 'pc-uuid');
    });

    it('sends an INVENTORY_REPORT transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('INVENTORY_REPORT');
          return HttpResponse.json({ procurosTransactionId: 'ir-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'INVENTORY_REPORT', content: sampleInventoryReport });
      expect(result).toHaveProperty('procurosTransactionId', 'ir-uuid');
    });

    it('sends a SALES_REPORT transaction', async () => {
      server.use(
        http.post(`${BASE_URL}/v2/transactions`, async ({ request }) => {
          const body = await request.json() as { type: string };
          expect(body.type).toBe('SALES_REPORT');
          return HttpResponse.json({ procurosTransactionId: 'sr-uuid' }, { status: 201 });
        }),
      );
      const client = createTestClient();
      const result = await client.outgoing.send({ type: 'SALES_REPORT', content: sampleSalesReport });
      expect(result).toHaveProperty('procurosTransactionId', 'sr-uuid');
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

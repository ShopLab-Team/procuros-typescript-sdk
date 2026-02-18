import type { RemittanceAdvice } from '../../src/types/documents-extended.js';

export const sampleRemittanceAdvice: RemittanceAdvice = {
  header: {
    adviceNumber: 'RM-0001',
    adviceDate: '2024-05-01',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: 'PAY-2024-0001',
    remittanceDate: '2024-05-05',
    currency: 'EUR',
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
  },
  items: [
    {
      documentNumber: 'IV9383-R45',
      documentDate: '2024-02-15',
      documentType: 'INVOICE',
      dueTotal: 4760.0,
      remittedTotal: 4760.0,
      tax: { amount: 760.0, percentage: 19.0 },
    },
  ],
  summary: {
    dueTotal: 4760.0,
    remittedTotal: 4760.0,
  },
};

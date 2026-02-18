import type { CreditNote } from '../../src/types/documents.js';

export const sampleCreditNote: CreditNote = {
  header: {
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '4522704465331', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '4231930775745', domain: 'GS1' }],
    },
    creditNoteIdentifier: 'CN-0001',
    creditNoteDate: '2024-03-01T00:00:00.000000Z',
    type: 'CORRECTION',
    invoiceIdentifier: 'IV9383-R45',
    invoiceDate: '2024-02-15',
    currency: 'EUR',
  },
  items: [
    {
      lineNumber: 1,
      identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
      isDepositItem: false,
      isInvoicedItem: true,
      quantity: 5,
      unitPrice: 200.0,
      description: 'Returned goods — defective batch.',
      tax: { amount: 190.0, percentage: 19.0 },
      unitOfMeasure: 'EA',
    },
  ],
};

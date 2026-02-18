import type { Invoice } from '../../src/types/documents.js';

export const sampleInvoice: Invoice = {
  header: {
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '4522704465331', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '4231930775745', domain: 'GS1' }],
    },
    invoiceIdentifier: 'IV9383-R45',
    invoiceDate: '2021-11-11',
    shippingNoticeIdentifier: 'SN9383-R45',
    shippingNoticeDate: '2021-11-04',
    orderIdentifier: 'PO9383-R45',
    orderDate: '2021-11-10',
    paymentTerms: [{ payInNumberOfDays: 28, percentage: 3.0 }],
  },
  items: [
    {
      lineNumber: 1,
      identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
      isDepositItem: false,
      isInvoicedItem: true,
      quantity: 20,
      unitPrice: 200.0,
      description: 'First product description.',
      tax: { amount: 760.0, percentage: 19.0, description: 'Total tax amount.' },
    },
  ],
};

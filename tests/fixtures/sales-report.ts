import type { SalesReport } from '../../src/types/documents-extended.js';

export const sampleSalesReport: SalesReport = {
  header: {
    salesReportIdentifier: 'SR-2024-001',
    salesReportDate: '2024-08-01T00:00:00.000000Z',
    salesPeriodStartDate: '2024-07-01T00:00:00.000000Z',
    salesPeriodEndDate: '2024-07-31T23:59:59.000000Z',
    currency: 'EUR',
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
  },
  locations: [
    {
      location: {
        name: 'ACME Store Berlin',
        identifiers: [{ identifier: '1100001016320', domain: 'GS1' }],
      },
      items: [
        {
          lineNumber: 1,
          identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
          description: 'Sparkling Water 0.75l',
          unitOfMeasure: 'EA',
          unitPrice: 1.5,
          salesQuantity: 240,
          lineGrossAmount: 428.4,
          lineNetAmount: 360.0,
          lineTaxAmount: 68.4,
          tax: { amount: 68.4, percentage: 19.0 },
        },
      ],
    },
  ],
};

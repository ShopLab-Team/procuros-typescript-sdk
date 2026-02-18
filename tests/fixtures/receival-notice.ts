import type { ReceivalNotice } from '../../src/types/documents-extended.js';

export const sampleReceivalNotice: ReceivalNotice = {
  header: {
    receivalAdviceNumber: 'RA-0001',
    receivalDate: '2024-04-14',
    customerOrderNumber: 'PO9383-R45',
    customer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    trackingNumber: 'JJD000123456789',
  },
  transportUnits: [
    {
      unitIdentifier: 'TU-001',
      items: [
        {
          lineNumber: 1,
          receivedQuantity: 20,
          shippedQuantity: 20,
          identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
          unitOfMeasure: 'EA',
          description: 'First product description.',
        },
      ],
    },
  ],
};

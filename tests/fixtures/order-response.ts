import type { OrderResponse } from '../../src/types/documents.js';

export const sampleOrderResponse: OrderResponse = {
  header: {
    type: 'ACCEPT',
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    orderResponseIdentifier: 'OR-0001',
    orderResponseDate: '2024-02-01T10:00:00.000000Z',
    orderIdentifier: 'PO9383-R45',
  },
  items: [
    {
      lineNumber: 1,
      orderLineNumber: 1,
      identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
      orderedQuantity: 20,
      confirmedQuantity: 20,
      unitOfMeasure: 'EA',
      description: 'First product description.',
    },
  ],
};

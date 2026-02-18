import type { DispatchInstruction } from '../../src/types/documents.js';

export const sampleDispatchInstruction: DispatchInstruction = {
  header: {
    shipmentIdentifier: 'SI-0001',
    orderIdentifier: 'PO9383-R45',
    shipFrom: {
      name: 'Warehouse Berlin',
      identifiers: [{ identifier: '1100001016315', domain: 'GS1' }],
      postalAddress: {
        street: 'Lagerstrasse 12',
        city: 'Berlin',
        postalCode: '10115',
        countryCode: 'DE',
      },
    },
    customer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    requestedDeliveryDate: '2024-04-10',
    modeOfTransport: 'ROAD',
    currency: 'EUR',
  },
  items: [
    {
      shippingNoticeLineNumber: 1,
      shippedQuantity: 20,
      orderedQuantity: 20,
      identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
      unitOfMeasure: 'EA',
      description: 'First product description.',
      batches: [],
    },
  ],
};

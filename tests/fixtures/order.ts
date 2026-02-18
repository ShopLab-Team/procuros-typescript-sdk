import type { Order } from '../../src/types/documents.js';

export const sampleOrder: Order = {
  header: {
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
      postalAddress: {
        street: 'Elroy-Fritsch-Ring 15',
        city: 'Berlin',
        countryCode: 'DE',
        postalCode: '82643',
      },
      contacts: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
        },
      ],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    orderIdentifier: 'PO9383-R45',
    orderDate: '2021-09-30',
    currency: 'EUR',
    requestedDeliveryDate: '2021-10-05',
    comments: 'Something to comment',
  },
  items: [
    {
      lineNumber: 1,
      identifiers: [
        { identifier: '4300348765432', domain: 'GS1' },
        { identifier: 'PROD-77-LS', domain: 'BUYER' },
      ],
      isDepositItem: false,
      quantity: 20.0,
      unitOfMeasure: 'EA',
      description: 'First product description.',
      unitPrice: 0.15,
    },
    {
      lineNumber: 2,
      identifiers: [{ identifier: '4300348765433', domain: 'GS1' }],
      isDepositItem: false,
      quantity: 19.0,
      unitOfMeasure: 'EA',
      description: 'Sparkling Water - Crate (6x0.75l).',
      unitPrice: 1.5,
    },
  ],
};

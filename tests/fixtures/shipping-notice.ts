import type { ShippingNotice } from '../../src/types/documents.js';

export const sampleShippingNotice: ShippingNotice = {
  header: {
    buyer: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    shippingNoticeIdentifier: 'SN9383-R45',
    shippingNoticeDate: '2021-11-24',
    orderIdentifier: 'PO9383-R45',
    despatchDate: '2021-11-05',
    expectedDeliveryDate: '2021-11-06',
    carrier: 'Example Delivery Solution',
    trackingNumber: 'b52ea6a7-c2ea-3bfc-a63f-19140d3b3af5',
  },
  transportUnits: [
    {
      items: [
        {
          lineNumber: 1,
          identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
          isDepositItem: false,
          orderedQuantity: 20.0,
          shippedQuantity: 20.0,
          description: 'First product description.',
        },
        {
          lineNumber: 2,
          identifiers: [{ identifier: '4300348765433', domain: 'GS1' }],
          isDepositItem: false,
          orderedQuantity: 19.0,
          shippedQuantity: 15.0,
          openQuantityAction: 'DISCARDED',
          description: 'Second product description.',
        },
      ],
    },
  ],
};

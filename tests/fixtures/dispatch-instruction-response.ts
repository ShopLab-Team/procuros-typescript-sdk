import type { DispatchInstructionResponse } from '../../src/types/documents-extended.js';

export const sampleDispatchInstructionResponse: DispatchInstructionResponse = {
  header: {
    shippingNoticeIdentifier: 'SN-0001',
    shippingNoticeDate: '2024-04-12',
    orderIdentifier: 'PO9383-R45',
    supplier: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    carrier: 'DHL Express',
    trackingNumber: 'JJD000123456789',
    modeOfTransport: 'ROAD',
    expectedDeliveryDate: '2024-04-14',
    currency: 'EUR',
  },
  transportUnits: [
    {
      unitIdentifier: 'TU-001',
      unitType: 'EURO_PALLET',
      items: [
        {
          lineNumber: 1,
          instructionLineNumber: 1,
          identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
          orderedQuantity: 20,
          shippedQuantity: 20,
          unitOfMeasure: 'EA',
          description: 'First product description.',
        },
      ],
    },
  ],
};

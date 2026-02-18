import type { ProductCatalog } from '../../src/types/documents-extended.js';

export const sampleProductCatalog: ProductCatalog = {
  header: {
    catalogDate: '2024-06-01',
    sender: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
    receiver: {
      name: 'ACME Co. Ltd.',
      identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
    },
    catalogNumber: 'CAT-2024-001',
  },
  items: [
    {
      lineNumber: 1,
      quantity: 1,
      name: 'Sparkling Water 0.75l',
      identity: { gtin: '4300348765432' },
      action: 'NEW',
      currency: 'EUR',
      unitOfMeasure: 'EA',
      isOrderable: true,
      unitPrice: 1.5,
      minimumOrderQuantity: 6,
      taxPercentage: 19.0,
      shortDescription: 'Premium sparkling mineral water',
      description: 'Naturally carbonated mineral water from Alpine springs, 0.75l glass bottle.',
      netWeight: 0.85,
      grossWeight: 1.1,
      category: 'Beverages',
      subCategory: 'Water',
      originCountryCode: 'DE',
      brand: 'Alpine Springs',
      hasExpiryDate: true,
      minimumRemainingShelfLifeInDays: 180,
      packagingUnits: [
        {
          quantity: 6,
          identity: { gtin: '4300348765400' },
          isOrderable: true,
          netWeight: 5.1,
          grossWeight: 7.2,
          unitOfMeasure: 'CS',
        },
      ],
    },
  ],
};

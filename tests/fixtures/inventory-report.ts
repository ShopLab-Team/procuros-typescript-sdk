import type { InventoryReport } from '../../src/types/documents-extended.js';

export const sampleInventoryReport: InventoryReport = {
  header: {
    inventoryReportIdentifier: 'INV-RPT-0001',
    inventoryReportDate: '2024-07-01T08:00:00.000000Z',
    warehouse: {
      name: 'Warehouse Berlin',
      identifiers: [{ identifier: '1100001016315', domain: 'GS1' }],
    },
    goodsOwner: {
      name: 'Testsupplier',
      identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
    },
  },
  items: [
    {
      lineNumber: 1,
      name: 'Sparkling Water 0.75l',
      availableQuantity: 500,
      blockedQuantity: 12,
      identity: { gtin: '4300348765432' },
      unitOfMeasure: 'EA',
      batches: [
        {
          batchIdentifier: 'BATCH-2024-A',
          expirationDate: '2025-01-15',
          quantity: 500,
          status: 'AVAILABLE',
        },
      ],
    },
  ],
};

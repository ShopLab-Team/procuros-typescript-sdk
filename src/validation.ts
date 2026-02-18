import { ProcurosError } from './errors.js';

const CREATED_BETWEEN_RE = /^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/;

export function validatePerPage(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new ProcurosError(`perPage must be an integer between 1 and 100, got ${value}`);
  }
}

export function validateBulkSize(length: number): void {
  if (length < 1 || length > 1000) {
    throw new ProcurosError(
      `bulkMarkProcessed requires 1–1000 items, got ${length}`,
    );
  }
}

export function validateCreatedBetween(value: string): void {
  if (!CREATED_BETWEEN_RE.test(value)) {
    throw new ProcurosError(
      `createdBetween must match "YYYY-MM-DD,YYYY-MM-DD", got "${value}"`,
    );
  }
}

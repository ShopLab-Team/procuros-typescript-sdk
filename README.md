# @shoplab/procuros-sdk

[![CI](https://github.com/ShopLab-Team/procuros-typescript-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/ShopLab-Team/procuros-typescript-sdk/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ShopLab-Team/procuros-typescript-sdk/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/ShopLab-Team/procuros-typescript-sdk/actions/workflows/github-code-scanning/codeql)

TypeScript SDK for the [Procuros API v2](https://api.procuros.io) — manage B2B trade transactions with full type safety, auto-pagination, retry logic, and zero runtime dependencies.

> **Full API Documentation:** See [docs/API.md](docs/API.md) for complete reference of every method, type, enum, and error class.

## Installation

```bash
npm install @shoplab/procuros-sdk
# or
pnpm add @shoplab/procuros-sdk
# or
yarn add @shoplab/procuros-sdk
```

Requires **Node.js 18+** (uses native `fetch`).

## Quick Start

```typescript
import { ProcurosClient } from '@shoplab/procuros-sdk';

const client = new ProcurosClient({
  apiToken: 'your-api-token',
  environment: 'production', // or 'staging'
});

// Test connectivity
await client.ping();

// List incoming transactions
const page = await client.incoming.list({ type: 'ORDER', perPage: 50 });
console.log(page.items);

// Auto-paginate through all transactions
for await (const tx of client.incoming.listAll({ type: 'ORDER' })) {
  console.log(tx.procurosTransactionId, tx.type);
}
```

## Configuration

```typescript
const client = new ProcurosClient({
  apiToken: 'your-api-token',      // Required. Bearer token for your ERP connection.
  environment: 'production',        // 'production' | 'staging'. Default: 'production'
  timeout: 30_000,                  // Request timeout in ms. Default: 30000
  maxRetries: 2,                    // Retry attempts on 5xx/network errors. Default: 2
  baseDelay: 500,                   // Base delay for exponential backoff (ms). Default: 500
  maxDelay: 10_000,                 // Max delay cap (ms). Default: 10000
  retryOnPost: false,               // Retry POST requests? Default: false (safety)
  fetch: customFetch,               // Custom fetch implementation (optional)
});
```

## API Reference

For the complete reference with every parameter, return type, and interface definition, see **[docs/API.md](docs/API.md)**.

### Incoming Transactions

```typescript
// List unprocessed incoming transactions (paginated)
const page = await client.incoming.list({
  type: 'ORDER',        // optional: filter by TransactionType
  perPage: 50,          // optional: 1-100 (server default when omitted)
  cursor: 'abc...',     // optional: cursor from previous page
});

// Auto-paginate through all incoming transactions
for await (const tx of client.incoming.listAll({ type: 'INVOICE' })) {
  // process each transaction
}

// Mark a transaction as processed
await client.incoming.markProcessed('uuid', { success: true });

// Mark as failed
await client.incoming.markProcessed('uuid', {
  success: false,
  errorReason: "Product GTIN '0001647296281' not found",
  errorType: 'DATA',
});

// Bulk mark up to 1000 transactions
await client.incoming.bulkMarkProcessed([
  { procurosTransactionId: 'uuid-1', success: true },
  { procurosTransactionId: 'uuid-2', success: false, errorReason: 'Not found', errorType: 'DATA' },
]);
```

### Outgoing Transactions

```typescript
// Send a transaction (discriminated union on `type`)
await client.outgoing.send({
  type: 'ORDER',
  content: {
    header: { buyer: { ... }, supplier: { ... }, orderIdentifier: 'PO-123', orderDate: '2024-01-15', currency: 'EUR' },
    items: [{ lineNumber: 1, identifiers: [{ identifier: '4300348765432', domain: 'GS1' }], quantity: 10, unitOfMeasure: 'EA' }],
  },
});

// Supported types: ORDER, ORDER_RESPONSE, SHIPPING_NOTICE, INVOICE, CREDIT_NOTE,
// DISPATCH_INSTRUCTION, DISPATCH_INSTRUCTION_RESPONSE, RECEIVAL_NOTICE,
// REMITTANCE_ADVICE, PRODUCT_CATALOG, INVENTORY_REPORT, SALES_REPORT

// Report an outgoing error
await client.outgoing.reportError({
  errorReason: 'Failed to build invoice payload',
  errorType: 'INTERNAL',
  transactionIdentifier: 'IV-0001',
  transactionType: 'INVOICE',
});
```

### All Transactions

```typescript
// List all transactions with filters
const page = await client.transactions.list({
  type: 'ORDER',
  flow: 'LIVE',
  status: 'SUCCESS',
  createdBetween: '2024-01-01,2024-01-31',
  perPage: 25,
});

// Auto-paginate
for await (const tx of client.transactions.listAll({ flow: 'LIVE' })) {
  console.log(tx.procurosTransactionId, tx.status);
}

// Get a single transaction
const tx = await client.transactions.get('949b2f25-fd9d-4c58-8899-b4dc277f8cf9');
```

### Ping

```typescript
await client.ping(); // throws on failure
```

## Error Handling

The SDK provides a hierarchy of error classes:

```typescript
import {
  ProcurosError,           // Base class for all SDK errors
  ProcurosApiError,        // 4xx/5xx responses (has .status, .method, .path, .body)
  ProcurosValidationError, // 422 responses (has .fieldErrors map)
  ProcurosRateLimitError,  // 429 responses (has .retryAfterMs, auto-retried)
  ProcurosNetworkError,    // DNS/connection failures
  ProcurosTimeoutError,    // Request timeout (has .timeoutMs)
} from '@shoplab/procuros-sdk';

try {
  await client.outgoing.send(transaction);
} catch (err) {
  if (err instanceof ProcurosValidationError) {
    console.log('Field errors:', err.fieldErrors);
  } else if (err instanceof ProcurosRateLimitError) {
    console.log(`Rate limited, retry after ${err.retryAfterMs}ms`);
  } else if (err instanceof ProcurosApiError) {
    console.log(`API error ${err.status}:`, err.message);
  } else if (err instanceof ProcurosTimeoutError) {
    console.log(`Timed out after ${err.timeoutMs}ms`);
  } else if (err instanceof ProcurosNetworkError) {
    console.log('Network failure:', err.message);
  }
}
```

## Request Cancellation

Every method accepts an optional `AbortSignal` for per-request cancellation:

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

await client.transactions.list({}, { signal: controller.signal });
```

## Retry Behavior

- **GET/PUT** requests retry on 5xx and network errors (up to `maxRetries`)
- **POST** requests do NOT retry by default (prevents duplicate transactions)
- Set `retryOnPost: true` if your workflow handles idempotency
- Exponential backoff with randomized jitter prevents thundering herd

## Publishing

```bash
# Build and test
pnpm run build
pnpm run test

# Publish to npm (runs prepublishOnly automatically)
npm publish --access public

# Or publish to a private registry
npm publish --registry https://your-registry.example.com
```

## License

MIT

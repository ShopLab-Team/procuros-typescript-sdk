# API Documentation

Full reference for every class, method, type, and enum exported by `@shoplab/procuros-sdk`.

---

## Table of Contents

- [ProcurosClient](#procurosclient)
  - [Constructor](#constructor)
  - [ping()](#ping)
- [client.incoming](#clientincoming)
  - [list()](#incominglist)
  - [listAll()](#incominglistall)
  - [markProcessed()](#incomingmarkprocessed)
  - [bulkMarkProcessed()](#incomingbulkmarkprocessed)
- [client.outgoing](#clientoutgoing)
  - [send()](#outgoingsend)
  - [reportError()](#outgoingreporterror)
- [client.transactions](#clienttransactions)
  - [list()](#transactionslist)
  - [listAll()](#transactionslistall)
  - [get()](#transactionsget)
- [Error Classes](#error-classes)
  - [ProcurosError](#procuroserror)
  - [ProcurosApiError](#procurosapierror)
  - [ProcurosValidationError](#procurosvalidationerror)
  - [ProcurosNetworkError](#procurosnetworkerror)
  - [ProcurosTimeoutError](#procurostimeouterror)
- [Types Reference](#types-reference)
  - [Configuration Types](#configuration-types)
  - [Enum Types](#enum-types)
  - [Request Types](#request-types)
  - [Response Types](#response-types)
  - [Document Types](#document-types)
  - [Common Types](#common-types)

---

## ProcurosClient

The main entry point for the SDK. All API interactions go through this class.

```typescript
import { ProcurosClient } from '@shoplab/procuros-sdk';
```

### Constructor

```typescript
new ProcurosClient(options: ProcurosClientOptions)
```

Creates a new SDK client instance. Throws `ProcurosError` if `apiToken` is empty.

#### ProcurosClientOptions

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiToken` | `string` | Yes | -- | Bearer token for your ERP connection. |
| `environment` | `'production' \| 'staging'` | No | `'production'` | API environment. Production: `api.procuros.io`. Staging: `api.procuros-staging.io`. |
| `timeout` | `number` | No | `30000` | Request timeout in milliseconds. |
| `maxRetries` | `number` | No | `2` | Max retry attempts on 5xx / network errors. |
| `baseDelay` | `number` | No | `500` | Base delay in ms for exponential backoff. |
| `maxDelay` | `number` | No | `10000` | Maximum backoff delay cap in ms. |
| `retryOnPost` | `boolean` | No | `false` | Whether to retry POST requests. Disabled by default to prevent duplicate transactions. |
| `fetch` | `typeof fetch` | No | `globalThis.fetch` | Custom fetch implementation for edge runtimes or testing. |

#### Example

```typescript
const client = new ProcurosClient({
  apiToken: 'your-api-token',
  environment: 'production',
  timeout: 15_000,
  maxRetries: 3,
});
```

---

### ping()

```typescript
client.ping(requestOptions?: RequestOptions): Promise<void>
```

Tests connectivity to the Procuros API. Resolves on success (HTTP 204), throws on failure.

**API endpoint:** `GET /v2/ping`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `requestOptions` | `RequestOptions` | No | Optional `{ signal: AbortSignal }` for cancellation. |

#### Example

```typescript
await client.ping();
console.log('Connected to Procuros API');
```

---

## client.incoming

Resource for managing **incoming transactions** (received from trade partners).

### incoming.list()

```typescript
client.incoming.list(
  options?: ListIncomingOptions,
  requestOptions?: RequestOptions,
): Promise<PaginatedResponse<ReceivedTransaction>>
```

Lists unprocessed incoming transactions with cursor-based pagination.

**API endpoint:** `GET /v2/transactions`

#### ListIncomingOptions

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `TransactionType` | No | -- | Filter by transaction type (e.g. `'ORDER'`, `'INVOICE'`). |
| `cursor` | `string` | No | -- | Pagination cursor from a previous response. |
| `perPage` | `number` | No | `100` | Items per page (1--100). |

#### Returns: PaginatedResponse\<ReceivedTransaction\>

| Field | Type | Description |
|---|---|---|
| `items` | `ReceivedTransaction[]` | Transactions on the current page. |
| `hasMore` | `boolean` | Whether more pages exist. |
| `perPage` | `number` | Items per page. |
| `count` | `number` | Number of items on the current page. |
| `nextCursor` | `string \| null` | Cursor for the next page, or `null`. |
| `nextPageUrl` | `string \| null` | Pre-built URL for the next page, or `null`. |

#### Example

```typescript
const page = await client.incoming.list({ type: 'ORDER', perPage: 50 });

for (const tx of page.items) {
  console.log(tx.procurosTransactionId, tx.type);
}

if (page.hasMore) {
  const nextPage = await client.incoming.list({ cursor: page.nextCursor! });
}
```

---

### incoming.listAll()

```typescript
client.incoming.listAll(
  options?: Omit<ListIncomingOptions, 'cursor'>,
  requestOptions?: RequestOptions,
): AsyncGenerator<ReceivedTransaction>
```

Auto-paginating iterator that yields every incoming transaction across all pages.

**API endpoint:** `GET /v2/transactions` (called repeatedly)

#### Example

```typescript
for await (const tx of client.incoming.listAll({ type: 'INVOICE' })) {
  console.log(tx.procurosTransactionId, tx.type);
}
```

---

### incoming.markProcessed()

```typescript
client.incoming.markProcessed(
  procurosTransactionId: string,
  request: MarkProcessedRequest,
  requestOptions?: RequestOptions,
): Promise<MarkProcessedResponse>
```

Reports the processing result of a single incoming transaction. The `procurosTransactionId` must be a valid UUID (validated client-side).

**API endpoint:** `PUT /v2/transactions/{procurosTransactionId}`

#### MarkProcessedRequest

| Property | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | Yes | Whether your system successfully processed the transaction. |
| `errorReason` | `string` | No | Human-readable reason for failure. |
| `errorType` | `ErrorType` | No | `'DATA'` (fixable by user) or `'INTERNAL'` (system-level). |
| `errorContext` | `Record<string, string>` | No | Additional metadata key-value pairs. |

#### Returns: MarkProcessedResponse

```typescript
{
  data: {
    message: string;     // Status message, e.g. "OK."
    errorUrl?: string;   // URL to view the error on the Procuros Portal (if failed)
  }
}
```

#### Example

```typescript
// Success
await client.incoming.markProcessed('949b2f25-...', { success: true });

// Failure
const res = await client.incoming.markProcessed('949b2f25-...', {
  success: false,
  errorReason: "Product GTIN '0001647296281' not found",
  errorType: 'DATA',
});
console.log(res.data.errorUrl); // link to Procuros Portal error page
```

---

### incoming.bulkMarkProcessed()

```typescript
client.incoming.bulkMarkProcessed(
  items: BulkMarkProcessedItem[],
  requestOptions?: RequestOptions,
): Promise<BulkMarkProcessedResponse>
```

Marks up to 1000 incoming transactions as processed in a single request.

**API endpoint:** `POST /v2/transactions/bulk/mark-processed`

#### BulkMarkProcessedItem

| Property | Type | Required | Description |
|---|---|---|---|
| `procurosTransactionId` | `string` | Yes | Transaction UUID. |
| `success` | `boolean` | Yes | Whether processing succeeded. |
| `errorReason` | `string` | No | Reason for failure. |
| `errorType` | `ErrorType` | No | `'DATA'` or `'INTERNAL'`. |
| `errorContext` | `Record<string, string>` | No | Additional metadata. |

#### Returns: BulkMarkProcessedResponse

```typescript
{
  data: Array<{
    procurosTransactionId: string;
    message: string;
    errorUrl?: string;
  }>
}
```

#### Example

```typescript
const res = await client.incoming.bulkMarkProcessed([
  { procurosTransactionId: 'uuid-1', success: true },
  { procurosTransactionId: 'uuid-2', success: false, errorReason: 'Not found', errorType: 'DATA' },
]);

for (const item of res.data) {
  console.log(item.procurosTransactionId, item.message);
}
```

---

## client.outgoing

Resource for **sending transactions** to trade partners and reporting errors.

### outgoing.send()

```typescript
client.outgoing.send(
  transaction: SentTransaction,
  requestOptions?: RequestOptions,
): Promise<void>
```

Sends a new transaction to a trade partner. The `transaction` is a discriminated union on the `type` field.

**API endpoint:** `POST /v2/transactions`

#### SentTransaction (discriminated union)

The `type` field determines the shape of `content`:

| `type` value | `content` type |
|---|---|
| `'ORDER'` | `Order` |
| `'ORDER_RESPONSE'` | `OrderResponse` |
| `'SHIPPING_NOTICE'` | `ShippingNotice` |
| `'INVOICE'` | `Invoice` |
| `'CREDIT_NOTE'` | `CreditNote` |
| `'DISPATCH_INSTRUCTION'` | `DispatchInstruction` |
| `'DISPATCH_INSTRUCTION_RESPONSE'` | `DispatchInstructionResponse` |
| `'RECEIVAL_NOTICE'` | `ReceivalNotice` |
| `'REMITTANCE_ADVICE'` | `RemittanceAdvice` |
| `'PRODUCT_CATALOG'` | `ProductCatalog` |
| `'INVENTORY_REPORT'` | `InventoryReport` |
| `'SALES_REPORT'` | `SalesReport` |

#### Example

```typescript
await client.outgoing.send({
  type: 'ORDER',
  content: {
    header: {
      buyer: {
        name: 'ACME Co.',
        identifiers: [{ identifier: '1100001016310', domain: 'GS1' }],
      },
      supplier: {
        identifiers: [{ identifier: '1100001016312', domain: 'GS1' }],
      },
      orderIdentifier: 'PO-2024-001',
      orderDate: '2024-01-15',
      currency: 'EUR',
    },
    items: [
      {
        lineNumber: 1,
        identifiers: [{ identifier: '4300348765432', domain: 'GS1' }],
        quantity: 10,
        unitOfMeasure: 'EA',
        unitPrice: 1.50,
      },
    ],
  },
});
```

---

### outgoing.reportError()

```typescript
client.outgoing.reportError(
  request: ReportErrorRequest,
  requestOptions?: RequestOptions,
): Promise<ReportErrorResponse>
```

Reports an error encountered while building an outgoing transaction payload. The error enters the same exception handling process as incoming transaction errors.

**API endpoint:** `POST /v2/errors`

#### ReportErrorRequest

| Property | Type | Required | Description |
|---|---|---|---|
| `errorReason` | `string` | Yes | Human-readable error description. |
| `errorType` | `ErrorType` | Yes | `'DATA'` or `'INTERNAL'`. |
| `errorContext` | `Record<string, string>` | No | Additional metadata. |
| `transactionIdentifier` | `string` | No | Identifier of the related transaction (e.g. order number). |
| `transactionType` | `TransactionType` | No | Type of the related transaction. |

#### Returns: ReportErrorResponse

```typescript
{
  message: string;     // "OK."
  errorUrl?: string;   // URL to view the error on the Procuros Portal
}
```

#### Example

```typescript
const res = await client.outgoing.reportError({
  errorReason: 'Failed to build invoice payload: missing billing address',
  errorType: 'DATA',
  transactionIdentifier: 'IV-0001',
  transactionType: 'INVOICE',
});
console.log(res.errorUrl);
```

---

## client.transactions

Resource for querying **all transactions** (both sent and received).

### transactions.list()

```typescript
client.transactions.list(
  options?: ListAllTransactionsOptions,
  requestOptions?: RequestOptions,
): Promise<PaginatedResponse<Transaction>>
```

Lists all transactions with optional filters and cursor-based pagination.

**API endpoint:** `GET /v2/all-transactions`

#### ListAllTransactionsOptions

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `TransactionType` | No | -- | Filter by transaction type. |
| `flow` | `TransactionFlow` | No | -- | Filter by flow: `'LIVE'` or `'TEST'`. |
| `status` | `TransactionStatus` | No | -- | Filter by status: `'PENDING'`, `'SUCCESS'`, `'FAILED'`, `'DROPPED'`, `'UNKNOWN'`. |
| `createdBetween` | `string` | No | -- | Date range filter. Format: `'YYYY-MM-DD,YYYY-MM-DD'`. |
| `cursor` | `string` | No | -- | Pagination cursor. |
| `perPage` | `number` | No | `100` | Items per page (1--100). |

#### Returns: PaginatedResponse\<Transaction\>

Same envelope as `incoming.list()`, but items are `Transaction` objects (which include `status`, `flow`, and `createdAt`).

#### Transaction

| Field | Type | Description |
|---|---|---|
| `procurosTransactionId` | `string` | Unique UUID on the Procuros network. |
| `type` | `TransactionType` | Document type (e.g. `'ORDER'`). |
| `status` | `TransactionStatus` | `'PENDING'`, `'SUCCESS'`, `'FAILED'`, `'DROPPED'`, or `'UNKNOWN'`. |
| `flow` | `TransactionFlow` | `'LIVE'` or `'TEST'`. |
| `createdAt` | `string` | ISO 8601 datetime. |
| `content` | `TransactionContent` | The document body (Order, Invoice, etc.). |

#### Example

```typescript
const page = await client.transactions.list({
  type: 'ORDER',
  flow: 'LIVE',
  status: 'SUCCESS',
  createdBetween: '2024-01-01,2024-12-31',
  perPage: 25,
});
```

---

### transactions.listAll()

```typescript
client.transactions.listAll(
  options?: Omit<ListAllTransactionsOptions, 'cursor'>,
  requestOptions?: RequestOptions,
): AsyncGenerator<Transaction>
```

Auto-paginating iterator that yields every matching transaction across all pages.

**API endpoint:** `GET /v2/all-transactions` (called repeatedly)

#### Example

```typescript
for await (const tx of client.transactions.listAll({ flow: 'LIVE' })) {
  console.log(`${tx.type} - ${tx.status} - ${tx.createdAt}`);
}
```

---

### transactions.get()

```typescript
client.transactions.get(
  procurosTransactionId: string,
  requestOptions?: RequestOptions,
): Promise<Transaction>
```

Fetches a single transaction by its UUID. The UUID is validated client-side before the request is sent.

**API endpoint:** `GET /v2/all-transactions/{procurosTransactionId}`

#### Example

```typescript
const tx = await client.transactions.get('949b2f25-fd9d-4c58-8899-b4dc277f8cf9');
console.log(tx.type, tx.status, tx.content);
```

---

## Error Classes

All errors extend `ProcurosError`, which extends the native `Error`. Import them from the package root:

```typescript
import {
  ProcurosError,
  ProcurosApiError,
  ProcurosValidationError,
  ProcurosNetworkError,
  ProcurosTimeoutError,
} from '@shoplab/procuros-sdk';
```

### ProcurosError

Base class for all SDK errors.

| Property | Type | Description |
|---|---|---|
| `name` | `string` | `'ProcurosError'` |
| `message` | `string` | Human-readable error description. |

Thrown for client-side validation failures (e.g. invalid UUID, missing `apiToken`).

---

### ProcurosApiError

Thrown when the API returns a non-2xx HTTP response (4xx or 5xx).

| Property | Type | Description |
|---|---|---|
| `name` | `string` | `'ProcurosApiError'` |
| `message` | `string` | Error message from the API response body. |
| `status` | `number` | HTTP status code (e.g. `401`, `500`). |
| `method` | `string` | HTTP method (`'GET'`, `'POST'`, `'PUT'`). |
| `path` | `string` | Request path (e.g. `'/v2/transactions'`). |
| `body` | `unknown` | Parsed response body (JSON object or raw text). |

Has a `toJSON()` method for safe serialization (never includes the bearer token).

---

### ProcurosValidationError

Extends `ProcurosApiError`. Thrown specifically for HTTP 422 responses that include a field-level `errors` map.

| Property | Type | Description |
|---|---|---|
| `fieldErrors` | `Record<string, string[]>` | Map of field paths to arrays of validation error messages. |

Plus all properties from `ProcurosApiError`.

```typescript
try {
  await client.outgoing.send(transaction);
} catch (err) {
  if (err instanceof ProcurosValidationError) {
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      console.log(`${field}: ${messages.join(', ')}`);
    }
  }
}
```

---

### ProcurosNetworkError

Thrown when the request fails at the network level (DNS resolution, connection refused, request cancelled via `AbortSignal`).

| Property | Type | Description |
|---|---|---|
| `name` | `string` | `'ProcurosNetworkError'` |
| `message` | `string` | Description of the network failure. |
| `cause` | `unknown` | The original underlying error. |

---

### ProcurosTimeoutError

Thrown when a request exceeds the configured `timeout`.

| Property | Type | Description |
|---|---|---|
| `name` | `string` | `'ProcurosTimeoutError'` |
| `message` | `string` | `'Request timed out after {X}ms'` |
| `timeoutMs` | `number` | The timeout value that was exceeded. |

---

## Types Reference

All types are exported from the package root:

```typescript
import type { Order, Invoice, TransactionType, ... } from '@shoplab/procuros-sdk';
```

### Configuration Types

| Type | Description |
|---|---|
| `ProcurosClientOptions` | Constructor options for `ProcurosClient`. |
| `Environment` | `'production' \| 'staging'` |
| `RequestOptions` | `{ signal?: AbortSignal }` -- per-request options. |
| `ListIncomingOptions` | Options for `incoming.list()`. |
| `ListAllTransactionsOptions` | Options for `transactions.list()`. |

### Enum Types

| Type | Values |
|---|---|
| `TransactionType` | `'ORDER'`, `'ORDER_RESPONSE'`, `'SHIPPING_NOTICE'`, `'INVOICE'`, `'CREDIT_NOTE'`, `'DISPATCH_INSTRUCTION'`, `'DISPATCH_INSTRUCTION_RESPONSE'`, `'RECEIVAL_NOTICE'`, `'REMITTANCE_ADVICE'`, `'PRODUCT_CATALOG'`, `'INVENTORY_REPORT'`, `'SALES_REPORT'` |
| `TransactionFlow` | `'LIVE'`, `'TEST'` |
| `TransactionStatus` | `'PENDING'`, `'SUCCESS'`, `'FAILED'`, `'DROPPED'`, `'UNKNOWN'` |
| `ErrorType` | `'DATA'`, `'INTERNAL'` |
| `UnitOfMeasure` | `'EA'`, `'GRM'`, `'HUR'`, `'KGM'`, `'LTR'`, `'MLT'`, `'MTK'`, `'MTR'`, `'PCK'`, `'SET'`, `'CS'`, `'CA'`, `'DAY'`, `'WEE'`, `'MON'`, `'CT'`, `'CQ'`, `'CU'`, `'BJ'`, `'BO'`, `'MTQ'`, `'PF'`, `'BG'`, `'RO'`, `'TNE'`, `'BE'`, `'CMT'`, `'KMT'`, `'PR'`, `'TU'` |
| `ModeOfTransport` | `'ROAD'`, `'RAIL'`, `'AIR'`, `'SEA'`, `'MULTIMODAL'` |
| `IncoTerms` | `'EXW'`, `'FCA'`, `'CPT'`, `'CIP'`, `'DAP'`, `'DDP'`, `'FAS'`, `'FOB'`, `'CFR'`, `'CIF'`, `'DAT'` |
| `ItemIdentifierDomain` | `'GS1'`, `'BUYER'`, `'SUPPLIER'` |
| `PartyIdentifierDomain` | `'GS1'`, `'DUNS'`, `'VAT_DE'`, `'FED_TAX'`, `'SENDER_INTERNAL'`, `'RECEIVER_INTERNAL'` |
| `ShippingNoticePartyIdentifierDomain` | All of `PartyIdentifierDomain` + `'VVVO'`, `'VETERINARY'` |
| `LineItemAttachmentType` | `'DECLARATION_OF_CONFORMITY'`, `'ENERGY_LABEL'`, `'EU_DATASHEET'`, `'SAFETY_DATASHEET'`, `'TECHNICAL_DATASHEET'`, `'PRODUCT_LABEL'` |
| `ModificationType` | `'ALLOWANCE'`, `'CHARGE'` |
| `ModificationCalculationType` | `'ABSOLUTE'`, `'RELATIVE'` |
| `ModificationReasonCode` | `'SHIPPING'`, `'PACKAGING'`, `'HANDLING'`, `'DISCOUNT'`, `'INSURANCE'` |
| `OpenQuantityAction` | `'DISCARDED'`, `'DELIVERED_LATER'` |
| `OrderResponseType` | `'ACCEPT'`, `'REJECT'`, `'CHANGE'` |
| `CreditNoteType` | `'CORRECTION'`, `'VALUE_CREDIT'` |
| `TransportUnitType` | `'EURO_PALLET'`, `'EURO_PALLET_HALF'`, `'EURO_PALLET_QUARTER'`, `'CARTON'`, `'PACKAGE'`, `'PALLET'`, `'CONTAINER'` |
| `ProductCatalogAction` | `'NEW'`, `'CHANGED'`, `'DELETED'` |
| `AllergenPresence` | `'PRESENT'`, `'TRACES'`, `'FREE_FROM'`, `'UNKNOWN'` |
| `ShippingNoticeItemGender` | `'MALE'`, `'FEMALE'` |

### Request Types

| Type | Used by | Description |
|---|---|---|
| `SentTransaction` | `outgoing.send()` | Discriminated union of all 12 sent transaction types. |
| `SentOrderTransaction` | -- | `{ type: 'ORDER'; content: Order }` |
| `SentOrderResponseTransaction` | -- | `{ type: 'ORDER_RESPONSE'; content: OrderResponse }` |
| `SentShippingNoticeTransaction` | -- | `{ type: 'SHIPPING_NOTICE'; content: ShippingNotice }` |
| `SentInvoiceTransaction` | -- | `{ type: 'INVOICE'; content: Invoice }` |
| `SentCreditNoteTransaction` | -- | `{ type: 'CREDIT_NOTE'; content: CreditNote }` |
| `SentDispatchInstructionTransaction` | -- | `{ type: 'DISPATCH_INSTRUCTION'; content: DispatchInstruction }` |
| `SentDispatchInstructionResponseTransaction` | -- | `{ type: 'DISPATCH_INSTRUCTION_RESPONSE'; content: DispatchInstructionResponse }` |
| `SentReceivalNoticeTransaction` | -- | `{ type: 'RECEIVAL_NOTICE'; content: ReceivalNotice }` |
| `SentRemittanceAdviceTransaction` | -- | `{ type: 'REMITTANCE_ADVICE'; content: RemittanceAdvice }` |
| `SentProductCatalogTransaction` | -- | `{ type: 'PRODUCT_CATALOG'; content: ProductCatalog }` |
| `SentInventoryReportTransaction` | -- | `{ type: 'INVENTORY_REPORT'; content: InventoryReport }` |
| `SentSalesReportTransaction` | -- | `{ type: 'SALES_REPORT'; content: SalesReport }` |
| `MarkProcessedRequest` | `incoming.markProcessed()` | Processing result for a single transaction. |
| `BulkMarkProcessedItem` | `incoming.bulkMarkProcessed()` | Processing result for a bulk item. |
| `ReportErrorRequest` | `outgoing.reportError()` | Outgoing error report. |

### Response Types

| Type | Returned by | Description |
|---|---|---|
| `PaginatedResponse<T>` | `incoming.list()`, `transactions.list()` | Cursor-paginated envelope. |
| `ReceivedTransaction` | `incoming.list()`, `incoming.listAll()` | Incoming transaction (id, type, content). |
| `Transaction` | `transactions.list()`, `transactions.listAll()`, `transactions.get()` | Full transaction with status, flow, createdAt. |
| `MarkProcessedResponse` | `incoming.markProcessed()` | `{ data: { message, errorUrl? } }` |
| `BulkMarkProcessedResponse` | `incoming.bulkMarkProcessed()` | `{ data: BulkMarkProcessedResponseItem[] }` |
| `BulkMarkProcessedResponseItem` | -- | `{ procurosTransactionId, message, errorUrl? }` |
| `ReportErrorResponse` | `outgoing.reportError()` | `{ message, errorUrl? }` |
| `TransactionContent` | -- | Union of all 12 document types. |
| `ShowTransactionResponse` | -- | Internal: `{ data: Transaction }` |

### Document Types

Each document type has a main interface plus header and item interfaces. All are fully exported.

| Document | Main Type | Header | Items |
|---|---|---|---|
| Purchase Order | `Order` | `OrderHeader` | `OrderItem` |
| Order Response | `OrderResponse` | `OrderResponseHeader` | `OrderResponseItem` |
| Invoice | `Invoice` | `InvoiceHeader` | `InvoiceItem`, `InvoiceItemWithSubItems`, `InvoiceItemWithSubSubItems` |
| Shipping Notice | `ShippingNotice` | `ShippingNoticeHeader` | `ShippingNoticeItem`, `ShippingNoticeItemWithSubItems`, `ShippingNoticeItemWithSubSubItems`, `ShippingNoticeTransportUnit`, `ShippingNoticeTransportUnitWithSubTransportUnits` |
| Credit Note | `CreditNote` | `CreditNoteHeader` | `CreditNoteItem`, `CreditNoteItemWithSubItems`, `CreditNoteItemWithSubSubItems` |
| Dispatch Instruction | `DispatchInstruction` | `DispatchInstructionHeader` | `DispatchInstructionItem`, `DispatchInstructionItemWithSubItems`, `DispatchInstructionItemWithSubSubItems` |
| Dispatch Instruction Response | `DispatchInstructionResponse` | `DispatchInstructionResponseHeader` | `DispatchInstructionResponseItem`, `DispatchInstructionResponseTransportUnit` |
| Receival Notice | `ReceivalNotice` | `ReceivalNoticeHeader` | `ReceivalNoticeItem`, `ReceivalNoticeTransportUnit` |
| Remittance Advice | `RemittanceAdvice` | `RemittanceAdviceHeader` | `RemittanceAdviceItem`, `RemittanceAdviceItemCorrection`, `RemittanceAdviceSummary` |
| Product Catalog | `ProductCatalog` | `ProductCatalogHeader` | `ProductCatalogItem`, `ProductCatalogItemWithSubItems`, `ProductCatalogItemWithSubSubItems`, `ProductCatalogItemPackagingUnit` |
| Inventory Report | `InventoryReport` | `InventoryReportHeader` | `InventoryReportItem` |
| Sales Report | `SalesReport` | `SalesReportHeader` | `SalesReportLocation`, `SalesReportLocationItem` |

### Common Types

| Type | Description |
|---|---|
| `Party` | Trade partner with name, identifiers, postal address, contacts, financial institution. |
| `PartyIdentifier` | `{ identifier: string; domain: PartyIdentifierDomain }` |
| `ShippingNoticePartyIdentifier` | Extended party identifier with VVVO/VETERINARY domains. |
| `ShippingNoticeParty` | Party variant using `ShippingNoticePartyIdentifier`. |
| `PostalAddress` | Street address with country code. |
| `Contact` | Contact details (name, phone, email, fax, department). |
| `FinancialInstitution` | Bank account details. |
| `Attachment` | File attachment (fileName, url, mimeType). |
| `LineItemAttachment` | Line item attachment with type classification. |
| `PaymentTerm` | `{ payInNumberOfDays: number; percentage: number }` |
| `Tax` | `{ amount: number; percentage: number; description?: string }` |
| `ItemIdentifier` | `{ identifier?: string; domain?: ItemIdentifierDomain }` |
| `Batch` | Batch info (identifier, expiration, quantity, weight). |
| `InventoryBatch` | Batch with status and statusReason fields. |
| `AdditionalOrderIdentifiers` | Extra order IDs for various parties. |
| `Certifications` | deBnn and EUDR certification info. |
| `CertificationsRequired` | Required certifications (fairtrade, supplierQa, eudr). |
| `Modification` | Price modification (allowance/charge). |
| `ModificationGroup` | Group of modifications with basis and level. |
| `DocumentSummary` | Summary with amounts, charges, allowances, and tax breakdown. |
| `ProductCatalogIdentity` | Catalog item identity (senderPartnerId, receiverPartnerId, gtin). |
| `NutritionalInformation` | Detailed nutritional data (energy, fats, carbs, proteins, vitamins, minerals). |
| `Allergen` | Allergen with identifiers, name, and presence. |
| `Additive` | Food additive with identifiers and name. |

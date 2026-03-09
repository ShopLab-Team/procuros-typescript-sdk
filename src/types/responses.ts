import type { TransactionFlow, TransactionStatus, TransactionType } from './enums.js';
import type {
  Order,
  OrderResponse,
  Invoice,
  ShippingNotice,
  CreditNote,
  DispatchInstruction,
} from './documents.js';
import type {
  DispatchInstructionResponse,
  ReceivalNotice,
  RemittanceAdvice,
  ProductCatalog,
  InventoryReport,
  SalesReport,
} from './documents-extended.js';

// ---------------------------------------------------------------------------
// Transaction Content Union
// ---------------------------------------------------------------------------

export type TransactionContent =
  | Order
  | OrderResponse
  | Invoice
  | ShippingNotice
  | CreditNote
  | DispatchInstruction
  | DispatchInstructionResponse
  | ReceivalNotice
  | RemittanceAdvice
  | ProductCatalog
  | InventoryReport
  | SalesReport;

// ---------------------------------------------------------------------------
// Paginated Response Envelope
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  perPage: number;
  count: number;
  nextCursor: string | null;
  nextPageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Received Transaction — discriminated union (GET /v2/transactions)
//
// Narrowing on `type` automatically narrows `content`:
//   if (tx.type === 'ORDER') { tx.content.header.orderIdentifier; }
// ---------------------------------------------------------------------------

type ReceivedTransactionOf<T extends TransactionType, C> = {
  procurosTransactionId: string;
  type: T;
  content: C;
};

export type ReceivedTransaction =
  | ReceivedTransactionOf<'ORDER', Order>
  | ReceivedTransactionOf<'ORDER_RESPONSE', OrderResponse>
  | ReceivedTransactionOf<'INVOICE', Invoice>
  | ReceivedTransactionOf<'SHIPPING_NOTICE', ShippingNotice>
  | ReceivedTransactionOf<'CREDIT_NOTE', CreditNote>
  | ReceivedTransactionOf<'DISPATCH_INSTRUCTION', DispatchInstruction>
  | ReceivedTransactionOf<'DISPATCH_INSTRUCTION_RESPONSE', DispatchInstructionResponse>
  | ReceivedTransactionOf<'RECEIVAL_NOTICE', ReceivalNotice>
  | ReceivedTransactionOf<'REMITTANCE_ADVICE', RemittanceAdvice>
  | ReceivedTransactionOf<'PRODUCT_CATALOG', ProductCatalog>
  | ReceivedTransactionOf<'INVENTORY_REPORT', InventoryReport>
  | ReceivedTransactionOf<'SALES_REPORT', SalesReport>;

// ---------------------------------------------------------------------------
// Full Transaction — discriminated union (GET /v2/all-transactions)
// ---------------------------------------------------------------------------

type TransactionOf<T extends TransactionType, C> = {
  procurosTransactionId: string;
  type: T;
  status: TransactionStatus;
  flow: TransactionFlow;
  createdAt: string;
  content: C;
};

export type Transaction =
  | TransactionOf<'ORDER', Order>
  | TransactionOf<'ORDER_RESPONSE', OrderResponse>
  | TransactionOf<'INVOICE', Invoice>
  | TransactionOf<'SHIPPING_NOTICE', ShippingNotice>
  | TransactionOf<'CREDIT_NOTE', CreditNote>
  | TransactionOf<'DISPATCH_INSTRUCTION', DispatchInstruction>
  | TransactionOf<'DISPATCH_INSTRUCTION_RESPONSE', DispatchInstructionResponse>
  | TransactionOf<'RECEIVAL_NOTICE', ReceivalNotice>
  | TransactionOf<'REMITTANCE_ADVICE', RemittanceAdvice>
  | TransactionOf<'PRODUCT_CATALOG', ProductCatalog>
  | TransactionOf<'INVENTORY_REPORT', InventoryReport>
  | TransactionOf<'SALES_REPORT', SalesReport>;

// ---------------------------------------------------------------------------
// Show Transaction Response (GET /v2/all-transactions/{id})
// ---------------------------------------------------------------------------

export interface ShowTransactionResponse {
  data: Transaction;
}

// ---------------------------------------------------------------------------
// Mark Processed Response (PUT /v2/transactions/{id})
// ---------------------------------------------------------------------------

export interface MarkProcessedResponse {
  data: {
    message: string;
    errorUrl?: string;
  };
}

// ---------------------------------------------------------------------------
// Bulk Mark Processed Response (POST /v2/transactions/bulk/mark-processed)
// ---------------------------------------------------------------------------

export interface BulkMarkProcessedResponseItem {
  procurosTransactionId: string;
  message: string;
  errorUrl?: string;
}

export interface BulkMarkProcessedResponse {
  data: BulkMarkProcessedResponseItem[];
}

// ---------------------------------------------------------------------------
// Report Error Response (POST /v2/errors)
// ---------------------------------------------------------------------------

export interface ReportErrorResponse {
  message: string;
  errorUrl?: string;
}

// ---------------------------------------------------------------------------
// Send Transaction Response (POST /v2/transactions)
// ---------------------------------------------------------------------------

export interface SendTransactionCreatedResponse {
  procurosTransactionId: string;
}

export interface SendTransactionAcceptedResponse {
  message: string;
}

export type SendTransactionResponse =
  | SendTransactionCreatedResponse
  | SendTransactionAcceptedResponse;

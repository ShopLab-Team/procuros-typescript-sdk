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
// Received Transaction (GET /v2/transactions)
// ---------------------------------------------------------------------------

export interface ReceivedTransaction {
  procurosTransactionId: string;
  type: TransactionType;
  content: TransactionContent;
}

// ---------------------------------------------------------------------------
// Full Transaction (GET /v2/all-transactions)
// ---------------------------------------------------------------------------

export interface Transaction {
  procurosTransactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  flow: TransactionFlow;
  createdAt: string;
  content: TransactionContent;
}

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

// ---------------------------------------------------------------------------
// Error Response Types
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface TransactionValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
  errorUrl: string;
}

import type { ErrorType, TransactionType } from './enums.js';
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
// Sent Transaction (discriminated union for POST /v2/transactions)
// ---------------------------------------------------------------------------

export interface SentOrderTransaction {
  type: 'ORDER';
  content: Order;
}

export interface SentOrderResponseTransaction {
  type: 'ORDER_RESPONSE';
  content: OrderResponse;
}

export interface SentShippingNoticeTransaction {
  type: 'SHIPPING_NOTICE';
  content: ShippingNotice;
}

export interface SentInvoiceTransaction {
  type: 'INVOICE';
  content: Invoice;
}

export interface SentCreditNoteTransaction {
  type: 'CREDIT_NOTE';
  content: CreditNote;
}

export interface SentDispatchInstructionTransaction {
  type: 'DISPATCH_INSTRUCTION';
  content: DispatchInstruction;
}

export interface SentDispatchInstructionResponseTransaction {
  type: 'DISPATCH_INSTRUCTION_RESPONSE';
  content: DispatchInstructionResponse;
}

export interface SentReceivalNoticeTransaction {
  type: 'RECEIVAL_NOTICE';
  content: ReceivalNotice;
}

export interface SentRemittanceAdviceTransaction {
  type: 'REMITTANCE_ADVICE';
  content: RemittanceAdvice;
}

export interface SentProductCatalogTransaction {
  type: 'PRODUCT_CATALOG';
  content: ProductCatalog;
}

export interface SentInventoryReportTransaction {
  type: 'INVENTORY_REPORT';
  content: InventoryReport;
}

export interface SentSalesReportTransaction {
  type: 'SALES_REPORT';
  content: SalesReport;
}

export type SentTransaction =
  | SentOrderTransaction
  | SentOrderResponseTransaction
  | SentShippingNoticeTransaction
  | SentInvoiceTransaction
  | SentCreditNoteTransaction
  | SentDispatchInstructionTransaction
  | SentDispatchInstructionResponseTransaction
  | SentReceivalNoticeTransaction
  | SentRemittanceAdviceTransaction
  | SentProductCatalogTransaction
  | SentInventoryReportTransaction
  | SentSalesReportTransaction;

// ---------------------------------------------------------------------------
// Mark Processed (PUT /v2/transactions/{id})
// ---------------------------------------------------------------------------

export interface MarkProcessedRequest {
  success: boolean;
  errorReason?: string;
  errorType?: ErrorType;
  errorContext?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Bulk Mark Processed (POST /v2/transactions/bulk/mark-processed)
// ---------------------------------------------------------------------------

export interface BulkMarkProcessedItem {
  procurosTransactionId: string;
  success: boolean;
  errorReason?: string;
  errorType?: ErrorType;
  errorContext?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Report Error (POST /v2/errors)
// ---------------------------------------------------------------------------

export interface ReportErrorRequest {
  errorReason: string;
  errorType: ErrorType;
  errorContext?: Record<string, string>;
  transactionIdentifier?: string;
  transactionType?: TransactionType;
}

import type {
  CreditNoteType,
  IncoTerms,
  ModeOfTransport,
  OpenQuantityAction,
  OrderResponseType,
  ShippingNoticeItemGender,
  TransportUnitType,
  UnitOfMeasure,
} from './enums.js';
import type {
  AdditionalOrderIdentifiers,
  Attachment,
  Batch,
  Certifications,
  CertificationsRequired,
  DocumentSummary,
  ItemIdentifier,
  LineItemAttachment,
  ModificationGroup,
  Party,
  PaymentTerm,
  ShippingNoticeParty,
  Tax,
} from './common.js';

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export interface OrderHeader {
  buyer: Party;
  supplier: Party;
  shipTo?: Party;
  billTo?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  orderIdentifier: string;
  orderDate: string;
  AdditionalOrderIdentifiers?: AdditionalOrderIdentifiers;
  type?: string;
  requestedDeliveryDate?: string;
  currency?: string;
  paymentTerms?: PaymentTerm[];
  comments?: string;
  deliveryInformation?: string;
  purchasingInformation?: string;
  legalInformation?: string;
  promotionCode?: string;
  contractReference?: string;
  version?: number;
  attachments?: Attachment[];
}

export interface OrderItem {
  lineNumber?: number;
  identifiers?: ItemIdentifier[];
  isDepositItem?: boolean;
  quantity?: number;
  unitOfMeasure?: UnitOfMeasure;
  description?: string;
  comments?: string;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  tax?: Tax;
  promotionCode?: string;
  contractReference?: string;
  requestedDeliveryDate?: string;
  requestedEarliestDeliveryDate?: string;
  requestedLatestDeliveryDate?: string;
  deliveryGracePeriodInDays?: number;
  minimumRemainingShelfLifeInDays?: number;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  brand?: string;
  consumerGroup?: string;
  assortment?: string;
  category?: string;
  subCategory?: string;
  certificationsRequired?: CertificationsRequired;
  attachments?: LineItemAttachment[];
  modificationGroups?: ModificationGroup[];
}

export interface Order {
  header: OrderHeader;
  items: OrderItem[];
  summary?: DocumentSummary;
}

// ---------------------------------------------------------------------------
// Order Response
// ---------------------------------------------------------------------------

export interface OrderResponseHeader {
  type?: OrderResponseType;
  version?: number;
  buyer: Party;
  supplier: Party;
  shipTo?: Party;
  billTo?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  orderResponseIdentifier: string;
  orderResponseDate: string;
  orderIdentifier: string;
  orderDate?: string;
  AdditionalOrderIdentifiers?: AdditionalOrderIdentifiers;
  confirmedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  currency?: string;
  paymentTerms?: PaymentTerm[];
  comments?: string;
  deliveryInformation?: string;
  purchasingInformation?: string;
  legalInformation?: string;
  contractReference?: string;
  promotionCode?: string;
}

export interface OrderResponseItem {
  lineNumber?: number;
  orderLineNumber?: number;
  identifiers?: ItemIdentifier[];
  isDepositItem?: boolean;
  orderedQuantity?: number;
  confirmedQuantity?: number;
  requestedDeliveryDate?: string;
  requestedEarliestDeliveryDate?: string;
  requestedLatestDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  confirmedEarliestDeliveryDate?: string;
  confirmedLatestDeliveryDate?: string;
  unitOfMeasure?: UnitOfMeasure;
  description?: string;
  comments?: string;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  tax?: Tax;
  contractReference?: string;
  promotionCode?: string;
  minimumRemainingShelfLifeInDays?: number;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  modificationGroups?: ModificationGroup[];
  attachments?: LineItemAttachment[];
}

export interface OrderResponse {
  header: OrderResponseHeader;
  items?: OrderResponseItem[];
  summary?: DocumentSummary;
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export interface InvoiceHeader {
  buyer: Party;
  supplier: Party;
  shipTo?: Party;
  billTo?: Party;
  billFrom?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  invoiceIdentifier: string;
  invoiceDate: string;
  invoiceValueDate?: string;
  invoiceDueDate?: string;
  shippingNoticeIdentifier: string;
  shippingNoticeDate: string;
  orderIdentifier: string;
  orderDate: string;
  AdditionalOrderIdentifiers?: AdditionalOrderIdentifiers;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  paymentTerms?: PaymentTerm[];
  comments?: string;
  deliveryInformation?: string;
  purchasingInformation?: string;
  legalInformation?: string;
  currency?: string;
  promotionCode?: string;
  organicControlPointNumber?: string;
  contractReference?: string;
  version?: number;
}

export interface InvoiceItem {
  lineNumber: number;
  shippingNoticeIdentifier?: string;
  shippingNoticeDate?: string;
  shippingNoticeLineNumber?: number;
  orderIdentifier?: string;
  orderDate?: string;
  orderLineNumber?: number;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  identifiers: ItemIdentifier[];
  isDepositItem: boolean;
  isInvoicedItem: boolean;
  description?: string;
  comments?: string;
  quantity: number;
  freeQuantity?: number;
  orderedQuantity?: number;
  unitPrice: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  certifications?: Certifications;
  promotionCode?: string;
  contractReference?: string;
  tax: Tax;
  batches?: Batch[];
  modificationGroups?: ModificationGroup[];
  unitOfMeasure?: UnitOfMeasure;
}

export interface InvoiceItemWithSubItems extends InvoiceItem {
  subItems?: InvoiceItem[];
}

export interface InvoiceItemWithSubSubItems extends InvoiceItem {
  subItems?: InvoiceItemWithSubItems[];
}

export interface Invoice {
  header: InvoiceHeader;
  items: InvoiceItemWithSubSubItems[];
  summary?: DocumentSummary;
}

// ---------------------------------------------------------------------------
// Shipping Notice
// ---------------------------------------------------------------------------

export interface ShippingNoticeHeader {
  buyer: Party;
  supplier: Party;
  shipFrom?: Party;
  shipTo?: Party;
  billTo?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  shippingNoticeIdentifier: string;
  shippingNoticeDate: string;
  orderIdentifier: string;
  orderDate?: string;
  AdditionalOrderIdentifiers?: AdditionalOrderIdentifiers;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  requestedDespatchDate?: string;
  despatchDate?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  modeOfTransport?: ModeOfTransport;
  incoTerms?: IncoTerms;
  shippingMethod?: string;
  status?: string;
  comments?: string;
  deliveryInformation?: string;
  purchasingInformation?: string;
  legalInformation?: string;
  currency?: string;
  version?: number;
}

export interface ShippingNoticeItem {
  lineNumber: number;
  orderLineNumber?: number;
  identifiers: ItemIdentifier[];
  isDepositItem: boolean;
  description?: string;
  comments?: string;
  orderedQuantity: number;
  shippedQuantity: number;
  openQuantityAction?: OpenQuantityAction;
  batches?: Batch[];
  unitPrice?: number;
  recommendedRetailPrice?: number;
  tax?: Tax;
  minimumRemainingShelfLifeInDays?: number;
  promotionCode?: string;
  contractReference?: string;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  certifications?: Certifications;
  unitOfMeasure?: UnitOfMeasure;
  breeder?: ShippingNoticeParty;
  fattener?: ShippingNoticeParty;
  slaughterer?: ShippingNoticeParty;
  cutter?: ShippingNoticeParty;
  slaughterDate?: string;
  tradeClass?: string;
  earTag?: string;
  birthdate?: string;
  gender?: ShippingNoticeItemGender;
}

export interface ShippingNoticeItemWithSubItems extends ShippingNoticeItem {
  subItems?: ShippingNoticeItem[];
}

export interface ShippingNoticeItemWithSubSubItems extends ShippingNoticeItem {
  subItems?: ShippingNoticeItemWithSubItems[];
}

export interface ShippingNoticeTransportUnit {
  unitIdentifier?: string;
  unitType?: TransportUnitType;
  containedTradeUnitCount?: number;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  requestedDespatchDate?: string;
  despatchDate?: string;
  items: ShippingNoticeItemWithSubSubItems[];
}

export interface ShippingNoticeTransportUnitWithSubTransportUnits extends ShippingNoticeTransportUnit {
  transportUnits?: ShippingNoticeTransportUnit[];
}

export interface ShippingNotice {
  header: ShippingNoticeHeader;
  transportUnits: ShippingNoticeTransportUnitWithSubTransportUnits[];
}

// ---------------------------------------------------------------------------
// Credit Note
// ---------------------------------------------------------------------------

export interface CreditNoteHeader {
  buyer: Party;
  supplier: Party;
  shipTo?: Party;
  billTo?: Party;
  billFrom?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  creditNoteIdentifier: string;
  creditNoteDate: string;
  creditNoteValueDate?: string;
  creditNoteDueDate?: string;
  type?: CreditNoteType;
  invoiceIdentifier?: string;
  invoiceDate?: string;
  shippingNoticeIdentifier?: string;
  shippingNoticeDate?: string;
  orderIdentifier?: string;
  orderDate?: string;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  paymentTerms?: PaymentTerm[];
  comments?: string;
  deliveryInformation?: string;
  purchasingInformation?: string;
  legalInformation?: string;
  currency?: string;
  promotionCode?: string;
  contractReference?: string;
  reason?: string;
  organicControlPointNumber?: string;
  version?: number;
}

export interface CreditNoteItem {
  lineNumber: number;
  shippingNoticeIdentifier?: string;
  shippingNoticeDate?: string;
  shippingNoticeLineNumber?: number;
  orderIdentifier?: string;
  orderDate?: string;
  orderLineNumber?: number;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  identifiers: ItemIdentifier[];
  isDepositItem: boolean;
  isInvoicedItem: boolean;
  description?: string;
  comments?: string;
  quantity: number;
  freeQuantity?: number;
  orderedQuantity?: number;
  unitPrice: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  certifications?: Certifications;
  promotionCode?: string;
  reason?: string;
  tax: Tax;
  batches?: Batch[];
  modificationGroups?: ModificationGroup[];
  unitOfMeasure?: UnitOfMeasure;
  contractReference?: string;
}

export interface CreditNoteItemWithSubItems extends CreditNoteItem {
  subItems?: CreditNoteItem[];
}

export interface CreditNoteItemWithSubSubItems extends CreditNoteItem {
  subItems?: CreditNoteItemWithSubItems[];
}

export interface CreditNote {
  header: CreditNoteHeader;
  items: CreditNoteItemWithSubSubItems[];
  summary?: DocumentSummary;
}

// ---------------------------------------------------------------------------
// Dispatch Instruction
// ---------------------------------------------------------------------------

export interface DispatchInstructionHeader {
  orderIdentifier?: string;
  orderDate?: string;
  shipmentIdentifier: string;
  noticeDate?: string;
  requestedDeliveryDate?: string;
  requestedDespatchDate?: string;
  shipFrom: Party;
  shipTo?: Party;
  billTo?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  customer?: Party;
  supplier?: Party;
  modeOfTransport?: ModeOfTransport;
  incoTerms?: IncoTerms;
  shippingMethod?: string;
  pickingNotes?: string;
  deliveryNotes?: string;
  comments?: string;
  currency?: string;
  version?: number;
}

export interface DispatchInstructionItem {
  orderLineNumber?: number;
  shippingNoticeLineNumber: number;
  shippedQuantity: number;
  orderedQuantity: number;
  requestedDeliveryDate?: string;
  requestedDespatchDate?: string;
  identifiers: ItemIdentifier[];
  unitOfMeasure?: UnitOfMeasure;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  tax?: Tax;
  currency?: string;
  description?: string;
  comments?: string;
  minimumRemainingShelfLifeInDays?: number;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  batches: Batch[];
  openQuantityAction?: OpenQuantityAction;
}

export interface DispatchInstructionItemWithSubItems extends DispatchInstructionItem {
  subItems?: DispatchInstructionItem[];
}

export interface DispatchInstructionItemWithSubSubItems extends DispatchInstructionItem {
  subItems?: DispatchInstructionItemWithSubItems[];
}

export interface DispatchInstruction {
  header: DispatchInstructionHeader;
  items: DispatchInstructionItemWithSubSubItems[];
}

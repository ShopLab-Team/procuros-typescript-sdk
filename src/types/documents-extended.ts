import type {
  AllergenPresence,
  IncoTerms,
  ModeOfTransport,
  OpenQuantityAction,
  ProductCatalogAction,
  UnitOfMeasure,
} from './enums.js';
import type {
  Attachment,
  Batch,
  InventoryBatch,
  ItemIdentifier,
  ModificationGroup,
  Party,
  ProductCatalogIdentity,
  Tax,
} from './common.js';

// ---------------------------------------------------------------------------
// Dispatch Instruction Response
// ---------------------------------------------------------------------------

export interface DispatchInstructionResponseHeader {
  orderIdentifier?: string;
  orderDate?: string;
  shippingNoticeIdentifier: string;
  requestedDespatchDate?: string;
  dispatchInstructionResponseDate?: string;
  shippingNoticeDate?: string;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  comments?: string;
  buyer?: Party;
  supplier: Party;
  shipTo?: Party;
  billTo?: Party;
  shipFrom?: Party;
  finalRecipient?: Party;
  technicalRecipient?: Party;
  modeOfTransport?: ModeOfTransport;
  incoTerms?: IncoTerms;
  shippingMethod?: string;
  status?: string;
  currency?: string;
  version?: number;
}

export interface DispatchInstructionResponseItem {
  lineNumber?: number;
  instructionLineNumber?: number;
  orderLineNumber?: number;
  isDepositItem?: boolean;
  description?: string;
  comments?: string;
  netWeight?: number;
  grossWeight?: number;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  hsCode?: string;
  organicControlPointNumber?: string;
  orderedQuantity?: number;
  shippedQuantity?: number;
  openQuantityAction?: OpenQuantityAction;
  unitOfMeasure?: UnitOfMeasure;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  recommendedRetailPrice?: number;
  tax?: Tax;
  identifiers?: ItemIdentifier[];
  batches?: Batch[];
}

export interface DispatchInstructionResponseTransportUnit {
  unitIdentifier?: string;
  unitType?: string;
  containedTradeUnitCount?: number;
  requestedDeliveryDate?: string;
  expectedDeliveryDate?: string;
  requestedDespatchDate?: string;
  despatchDate?: string;
  items: DispatchInstructionResponseItem[];
}

export interface DispatchInstructionResponse {
  header: DispatchInstructionResponseHeader;
  transportUnits: DispatchInstructionResponseTransportUnit[];
}

// ---------------------------------------------------------------------------
// Receival Notice
// ---------------------------------------------------------------------------

export interface ReceivalNoticeHeader {
  receivalAdviceNumber: string;
  receivalDate: string;
  deliveryNoteNumber?: string;
  customerOrderNumber?: string;
  shipTo?: Party;
  customer: Party;
  deliveryNoteDate?: string;
  orderDate?: string;
  shipFrom?: Party;
  billTo?: Party;
  supplier: Party;
  technicalRecipient?: Party;
  comments?: string;
  carrierId?: string;
  carrierDomain?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  version?: number;
}

export interface ReceivalNoticeItem {
  lineNumber?: number;
  receivedQuantity?: number;
  shippedQuantity?: number;
  identifiers?: ItemIdentifier[];
  orderLineNumber?: number;
  orderedQuantity?: number;
  rejectedQuantity?: number;
  rejectReason?: string;
  openQuantityAction?: OpenQuantityAction;
  unitPrice?: number;
  currency?: string;
  unitOfMeasure?: UnitOfMeasure;
  description?: string;
  batches?: Batch[];
}

export interface ReceivalNoticeTransportUnit {
  unitIdentifier?: string;
  unitType?: string;
  containedTradeUnitCount?: number;
  items: ReceivalNoticeItem[];
}

export interface ReceivalNotice {
  header: ReceivalNoticeHeader;
  transportUnits: ReceivalNoticeTransportUnit[];
}

// ---------------------------------------------------------------------------
// Remittance Advice
// ---------------------------------------------------------------------------

export interface RemittanceAdviceHeader {
  adviceNumber: string;
  adviceDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  remittanceDate?: string;
  currency?: string;
  payFrom?: Party;
  payTo?: Party;
  buyer?: Party;
  supplier?: Party;
  technicalRecipient?: Party;
  version?: number;
}

export interface RemittanceAdviceItemCorrection {
  basis?: number;
  reason?: string;
  amount: number;
  total: number;
  tax?: Tax;
}

export interface RemittanceAdviceItem {
  documentNumber?: string;
  documentDate?: string;
  externalDocumentNumber?: string;
  documentType?: string;
  dueTotal?: number;
  remittedTotal?: number;
  tax?: Tax;
  correctionTotal?: number;
  buyer?: Party;
  shipTo?: Party;
  corrections?: RemittanceAdviceItemCorrection[];
}

export interface RemittanceAdviceSummary {
  dueTotal?: number;
  remittedTotal?: number;
  correctionTotal?: number;
}

export interface RemittanceAdvice {
  header: RemittanceAdviceHeader;
  items: RemittanceAdviceItem[];
  summary: RemittanceAdviceSummary;
}

// ---------------------------------------------------------------------------
// Product Catalog
// ---------------------------------------------------------------------------

export interface ProductCatalogHeader {
  catalogNumber?: string;
  catalogDate: string;
  sender: Party;
  receiver: Party;
  importer?: Party;
  manufacturer?: Party;
  technicalRecipient?: Party;
  comments?: string;
  version?: number;
}

export interface AllergenIdentifiers {
  gdsn?: string;
  usda?: string;
  bls?: string;
  senderInternal?: string;
  receiverInternal?: string;
}

export interface Allergen {
  identifiers?: AllergenIdentifiers;
  name?: string;
  presence?: AllergenPresence;
}

export interface Additive {
  identifiers?: AllergenIdentifiers;
  name?: string;
}

export interface NutritionalInformation {
  energy?: { totalInKcal?: number; totalInKj?: number };
  fats?: {
    totalInGrams?: number; saturatedInGrams?: number;
    monounsaturatedInGrams?: number; polyunsaturatedInGrams?: number;
    transFatsInGrams?: number; omega3FattyAcidsInGrams?: number;
    omega6FattyAcidsInGrams?: number; omega9FattyAcidsInGrams?: number;
    epaInGrams?: number; dhaInGrams?: number; cholesterolInMilligrams?: number;
  };
  carbohydrates?: {
    totalInGrams?: number; sugarsInGrams?: number; addedSugarsInGrams?: number;
    polyolsInGrams?: number; starchInGrams?: number; lactoseInGrams?: number;
  };
  fiber?: {
    totalInGrams?: number; solubleInGrams?: number;
    insolubleInGrams?: number; betaGlucansInGrams?: number;
  };
  proteins?: {
    totalInGrams?: number;
    aminoAcids?: Record<string, number>;
  };
  saltInGrams?: number;
  sodiumInGrams?: number;
  alcoholInGrams?: number;
  waterInGrams?: number;
  caffeineInMilligrams?: number;
  taurineInMilligrams?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  otherCompounds?: Record<string, number>;
  specialDietaryInfo?: {
    breadUnitsBe?: number;
    meatFishWeightPerUnitInGrams?: number;
  };
}

export interface ProductCatalogItemPackagingUnit {
  quantity: number;
  identity?: ProductCatalogIdentity;
  isOrderable?: boolean;
  length?: number;
  width?: number;
  height?: number;
  netWeight?: number;
  grossWeight?: number;
  volume?: number;
  unitOfMeasure?: UnitOfMeasure;
}

export interface ProductCatalogItem {
  name?: string;
  lineNumber: number;
  quantity: number;
  identity: ProductCatalogIdentity;
  predecessorIdentity?: ProductCatalogIdentity;
  successorIdentity?: ProductCatalogIdentity;
  alternativeIdentifiers?: ProductCatalogIdentity[];
  action?: ProductCatalogAction;
  currency?: string;
  unitOfMeasure?: UnitOfMeasure;
  isOrderable?: boolean;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  unitPriceValidFromDate?: string;
  unitPriceValidUntilDate?: string;
  recommendedRetailPrice?: number;
  recommendedRetailPriceValidFromDate?: string;
  recommendedRetailPriceValidUntilDate?: string;
  minimumOrderQuantity?: number;
  taxPercentage?: number;
  depositAmount?: number;
  shortDescription?: string;
  description?: string;
  perUnitQuantity?: number;
  length?: number;
  width?: number;
  height?: number;
  netWeight?: number;
  grossWeight?: number;
  drainedWeight?: number;
  volume?: number;
  category?: string;
  subCategory?: string;
  unNumber?: number;
  hsCode?: string;
  htsCode?: string;
  deliverableFromDate?: string;
  isDangerous?: boolean;
  hasExpiryDate?: boolean;
  hasBatchNumber?: boolean;
  hasSerialNumber?: boolean;
  minimumRemainingShelfLifeInDays?: number;
  sourceIdentifier?: string;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  brand?: string;
  declarationOfConformity?: string;
  userManual?: string;
  energyLabel?: string;
  safetyDatasheet?: string;
  technicalDatasheet?: string;
  euDatasheet?: string;
  safetyInstructions?: string;
  materialComposition?: string;
  ingredients?: string;
  allergens?: Allergen[];
  nutritionalInformation?: NutritionalInformation;
  additives?: Additive[];
  images?: Attachment[];
  comment?: string;
  batches?: Batch[];
  packagingUnits?: ProductCatalogItemPackagingUnit[];
  modificationGroups?: ModificationGroup[];
  manufacturer?: Party;
  importer?: Party;
}

export interface ProductCatalogItemWithSubItems extends ProductCatalogItem {
  subItems?: ProductCatalogItem[];
}

export interface ProductCatalogItemWithSubSubItems extends ProductCatalogItem {
  subItems?: ProductCatalogItemWithSubItems[];
}

export interface ProductCatalog {
  header: ProductCatalogHeader;
  items: ProductCatalogItemWithSubSubItems[];
}

// ---------------------------------------------------------------------------
// Inventory Report
// ---------------------------------------------------------------------------

export interface InventoryReportHeader {
  inventoryReportIdentifier: string;
  inventoryReportDate: string;
  warehouse: Party;
  goodsOwner: Party;
  technicalRecipient?: Party;
  comments?: string;
  version?: number;
}

export interface InventoryReportItem {
  name?: string;
  lineNumber?: number;
  availableQuantity?: number;
  blockedQuantity?: number;
  orderedQuantity?: number;
  identity?: ProductCatalogIdentity;
  unitOfMeasure?: UnitOfMeasure;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  tax?: Tax;
  netWeight?: number;
  grossWeight?: number;
  hsCode?: string;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  comment?: string;
  batches?: InventoryBatch[];
}

export interface InventoryReport {
  header: InventoryReportHeader;
  items: InventoryReportItem[];
}

// ---------------------------------------------------------------------------
// Sales Report
// ---------------------------------------------------------------------------

export interface SalesReportHeader {
  salesReportIdentifier: string;
  salesReportDate: string;
  salesPeriodStartDate: string;
  salesPeriodEndDate: string;
  currency?: string;
  supplier: Party;
  buyer: Party;
  technicalRecipient?: Party;
  comments?: string;
}

export interface SalesReportLocationItem {
  lineNumber: number;
  identifiers: ItemIdentifier[];
  description?: string;
  unitOfMeasure?: UnitOfMeasure;
  unitPrice?: number;
  pricingUnitOfMeasure?: string;
  pricingUnitQuantity?: number;
  netUnitPrice?: number;
  recommendedRetailPrice?: number;
  salesQuantity: number;
  lineGrossAmount?: number;
  lineNetAmount?: number;
  lineTaxAmount?: number;
  comments?: string;
  netWeight?: number;
  grossWeight?: number;
  hsCode?: string;
  originCountryCode?: string;
  colorCode?: string;
  colorName?: string;
  size?: string;
  dimension?: string;
  organicControlPointNumber?: string;
  fscNumber?: string;
  category?: string;
  subCategory?: string;
  tax?: Tax;
}

export interface SalesReportLocation {
  location: Party;
  salesPeriodStartDate?: string;
  salesPeriodEndDate?: string;
  items: SalesReportLocationItem[];
}

export interface SalesReport {
  header: SalesReportHeader;
  locations: SalesReportLocation[];
}

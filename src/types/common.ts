import type {
  ItemIdentifierDomain,
  LineItemAttachmentType,
  ModificationCalculationType,
  ModificationReasonCode,
  ModificationType,
  PartyIdentifierDomain,
  ShippingNoticePartyIdentifierDomain,
  UnitOfMeasure,
} from './enums.js';

export interface Attachment {
  fileName?: string;
  url?: string;
  mimeType?: string;
}

export interface PaymentTerm {
  payInNumberOfDays: number;
  percentage: number;
}

export interface Tax {
  amount: number;
  percentage: number;
  description?: string | null;
}

export interface ItemIdentifier {
  identifier?: string;
  domain?: ItemIdentifierDomain;
}

export interface PartyIdentifier {
  identifier: string;
  domain: PartyIdentifierDomain;
}

export interface ShippingNoticePartyIdentifier {
  identifier: string;
  domain: ShippingNoticePartyIdentifierDomain;
}

export interface PostalAddress {
  /** @deprecated Use the `name` attribute on the `Party` object instead. */
  name?: string;
  street?: string;
  addressExtra?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
}

export interface Contact {
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  fax?: string;
  department?: string;
}

export interface FinancialInstitution {
  name?: string;
  institutionId?: string;
  institutionIdDomain?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export interface Party {
  name?: string;
  identifiers: PartyIdentifier[];
  postalAddress?: PostalAddress;
  contacts?: Contact[];
  financialInstitution?: FinancialInstitution;
}

export interface ShippingNoticeParty {
  name?: string;
  identifiers: ShippingNoticePartyIdentifier[];
  postalAddress?: PostalAddress;
  contacts?: Contact[];
}

export interface Batch {
  batchIdentifier?: string;
  expirationDate?: string;
  quantity?: number;
  netWeight?: number;
  grossWeight?: number;
}

export interface InventoryBatch extends Batch {
  status?: string;
  statusReason?: string;
}

export interface AdditionalOrderIdentifiers {
  supplierOrderIdentifier?: string;
  shipToOrderIdentifier?: string;
  shipFromOrderIdentifier?: string;
  billToOrderIdentifier?: string;
  billFromOrderIdentifier?: string;
  finalRecipientOrderIdentifier?: string;
  technicalRecipientOrderIdentifier?: string;
}

export interface EudrCertification {
  verificationNumber?: string;
  referenceNumber?: string;
}

export interface Certifications {
  deBnn?: string;
  eudr?: EudrCertification;
}

export interface CertificationsRequired {
  fairtrade?: boolean | null;
  supplierQa?: boolean | null;
  eudr?: boolean | null;
}

export interface LineItemAttachment {
  fileName?: string;
  url?: string;
  mimeType?: string;
  type?: LineItemAttachmentType;
}

export interface Modification {
  type?: ModificationType;
  calculationType?: ModificationCalculationType;
  reasonCode?: ModificationReasonCode;
  description?: string;
  percentage?: number;
  amount?: number;
  tax?: Tax;
}

export interface ModificationGroup {
  basis: number;
  level: number;
  modifications: Modification[];
}

export interface SummaryTaxItem {
  percentage: number;
  taxableAmount: number;
  taxAmount: number;
  category: string;
  description?: string;
}

export interface SummaryTax {
  total: number;
  description?: string;
  items: SummaryTaxItem[];
}

export interface DocumentSummary {
  subtotalAmount?: number;
  grossAmount?: number;
  netAmount?: number;
  dueAmount: number;
  totalCharges?: number;
  totalAllowances?: number;
  tax?: SummaryTax;
  modificationGroups?: ModificationGroup[];
}

export interface ProductCatalogIdentity {
  senderPartnerId?: string;
  receiverPartnerId?: string;
  gtin?: string;
}

export type Currency = string;

export type { UnitOfMeasure };

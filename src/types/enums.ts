export type TransactionType =
  | 'ORDER'
  | 'ORDER_RESPONSE'
  | 'SHIPPING_NOTICE'
  | 'INVOICE'
  | 'CREDIT_NOTE'
  | 'DISPATCH_INSTRUCTION'
  | 'DISPATCH_INSTRUCTION_RESPONSE'
  | 'RECEIVAL_NOTICE'
  | 'REMITTANCE_ADVICE'
  | 'PRODUCT_CATALOG'
  | 'INVENTORY_REPORT'
  | 'SALES_REPORT';

export type TransactionFlow = 'LIVE' | 'TEST';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'DROPPED' | 'UNKNOWN';

export type ErrorType = 'DATA' | 'INTERNAL';

export type UnitOfMeasure =
  | 'EA' | 'GRM' | 'HUR' | 'KGM' | 'LTR' | 'MLT' | 'MTK' | 'MTR'
  | 'PCK' | 'SET' | 'CS' | 'CA' | 'DAY' | 'WEE' | 'MON' | 'CT'
  | 'CQ' | 'CU' | 'BJ' | 'BO' | 'MTQ' | 'PF' | 'BG' | 'RO'
  | 'TNE' | 'BE' | 'CMT' | 'KMT' | 'PR' | 'TU';

export type ModeOfTransport = 'ROAD' | 'RAIL' | 'AIR' | 'SEA' | 'MULTIMODAL';

export type IncoTerms =
  | 'EXW' | 'FCA' | 'CPT' | 'CIP' | 'DAP' | 'DDP'
  | 'FAS' | 'FOB' | 'CFR' | 'CIF' | 'DAT';

export type ItemIdentifierDomain = 'GS1' | 'BUYER' | 'SUPPLIER';

export type PartyIdentifierDomain =
  | 'GS1' | 'DUNS' | 'VAT_DE' | 'FED_TAX' | 'SENDER_INTERNAL' | 'RECEIVER_INTERNAL';

export type ShippingNoticePartyIdentifierDomain =
  | PartyIdentifierDomain | 'VVVO' | 'VETERINARY';

export type LineItemAttachmentType =
  | 'DECLARATION_OF_CONFORMITY' | 'ENERGY_LABEL' | 'EU_DATASHEET'
  | 'SAFETY_DATASHEET' | 'TECHNICAL_DATASHEET' | 'PRODUCT_LABEL';

export type ModificationType = 'ALLOWANCE' | 'CHARGE';

export type ModificationCalculationType = 'ABSOLUTE' | 'RELATIVE';

export type ModificationReasonCode =
  | 'SHIPPING' | 'PACKAGING' | 'HANDLING' | 'DISCOUNT' | 'INSURANCE';

export type OpenQuantityAction = 'DISCARDED' | 'DELIVERED_LATER';

export type OrderResponseType = 'ACCEPT' | 'REJECT' | 'CHANGE';

export type CreditNoteType = 'CORRECTION' | 'VALUE_CREDIT';

export type TransportUnitType =
  | 'EURO_PALLET' | 'EURO_PALLET_HALF' | 'EURO_PALLET_QUARTER'
  | 'CARTON' | 'PACKAGE' | 'PALLET' | 'CONTAINER';

export type ProductCatalogAction = 'NEW' | 'CHANGED' | 'DELETED';

export type AllergenPresence = 'PRESENT' | 'TRACES' | 'FREE_FROM' | 'UNKNOWN';

export type ShippingNoticeItemGender = 'MALE' | 'FEMALE';

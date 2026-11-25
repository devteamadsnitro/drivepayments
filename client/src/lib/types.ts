export type YesNo = "yes" | "no";
export type ContactMethod = "phone" | "telegram" | "whatsapp";
export type OwnerAddressMode = "no" | "legal" | "dba";
export type ProcessingMethod = "cards" | "ach" | "both";
export type ProcessingChannel = "online" | "inperson" | "phone";

export interface BusinessInfo {
  ownershipType: string;
  legalName: string;
  dbaName: string;
  phoneDial: string;
  phone: string;
  businessEmail: string;
  contactMethod: ContactMethod | "";
  taxId: string;
  locationType: string;
  yearsInBusiness: string;
  monthsInBusiness: string;
  websites: string[];
  description: string;
  businessType: string;
  country: string;
  legalAddress: string;
  city: string;
  state: string;
  zip: string;
  dbaSameAsLegal: YesNo | "";
  dbaAddress: string;
  dbaCity: string;
  dbaState: string;
  dbaZip: string;
  yearsAtLocation: string;
  monthsAtLocation: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  addressMode: OwnerAddressMode | "";
  country: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  yearsAtResidence: string;
  monthsAtResidence: string;
  idType: string;
  idNumber: string;
  ssn: string;
  dob: string;
  phone: string;
  email: string;
  ownershipPct: string;
}

export interface BankInfo {
  routingNumber: string;
  bankName: string;
  accountNumber: string;
}

export interface ProcessingInfo {
  methods: ProcessingMethod | "";
  acceptsCardsNow: YesNo | "";
  currentProcessor: string;
  monthlyVolume: string;
  averageTicket: string;
  highTicket: string;
  channels: ProcessingChannel[];
  fraudProtection: YesNo | "";
  needsAch: YesNo | "";
  enrolledRdr: YesNo | "";
}

export interface UploadedDocument {
  id: string;
  file: File;
}

export type DocumentMap = Record<string, UploadedDocument[]>;

export interface ApplicationState {
  business: BusinessInfo;
  owners: Owner[];
  bank: BankInfo;
  processing: ProcessingInfo;
  documents: DocumentMap;
  consent: boolean;
  /** Sharing with partners and opening gateways on the merchant's behalf. */
  partnerConsent: boolean;
}

export type Errors = Record<string, string>;

export type StepId = 1 | 2 | 3 | 4;

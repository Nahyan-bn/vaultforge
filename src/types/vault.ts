/**
 * VAULTFORGE — Domain Record Types & Decrypted Models
 */

export type RecordType = 'login' | 'note' | 'card' | 'api_key';

export interface CustomField {
  id: string;
  label: string;
  value: string;
  isSensitive: boolean;
}

export interface PasswordHistoryEntry {
  password: string;
  createdAt: number;
}

export interface BaseRecord {
  id: string;
  vaultId: string;
  type: RecordType;
  title: string;
  category: string;
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  customFields?: CustomField[];
}

export interface LoginCredential extends BaseRecord {
  type: 'login';
  username: string;
  password: string;
  website?: string;
  passwordHistory?: PasswordHistoryEntry[];
}

export interface SecureNote extends BaseRecord {
  type: 'note';
  content: string;
}

export interface PaymentCard extends BaseRecord {
  type: 'card';
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pin?: string;
}

export interface ApiKeyRecord extends BaseRecord {
  type: 'api_key';
  service: string;
  apiKey: string;
  apiSecret?: string;
  endpointUrl?: string;
}

export type DecryptedRecord = LoginCredential | SecureNote | PaymentCard | ApiKeyRecord;

export interface HealthIssue {
  id: string;
  recordId: string;
  recordTitle: string;
  type: 'WEAK' | 'REUSED' | 'OLD' | 'MISSING_DATA' | 'SHORT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
}

export interface VaultAnalytics {
  totalRecords: number;
  loginCount: number;
  noteCount: number;
  cardCount: number;
  apiKeyCount: number;
  strongPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
  securityScore: number;
  issues: HealthIssue[];
}

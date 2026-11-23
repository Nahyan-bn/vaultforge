/**
 * VAULTFORGE 2.0 — Multi-Layer Authentication & Identity Verification Types
 * Domain: Biometrics (WebAuthn/Passkeys), 6-Digit PIN, Iris Hardware/Demo, Government Identity
 */

import type { WrappedKey, KdfParams } from '../crypto/types';

export type AuthMethodType = 'password' | 'pin' | 'biometric' | 'iris' | 'recovery';

export interface PinAuthConfig {
  enabled: boolean;
  saltHex: string;          // 16-byte salt for PIN Argon2id derivation
  wrappedDek: WrappedKey;   // DEK wrapped by Argon2id(PIN, saltHex)
  kdfParams: KdfParams;     // Calibrated parameters for PIN (memory-hard to slow brute force)
  failedAttempts: number;
  lockedUntil: number;      // Unix timestamp (ms) when lockout expires
  maxAttempts: number;      // Default: 5
  updatedAt: number;
}

export interface BiometricAuthConfig {
  enabled: boolean;
  credentialId: string;     // Base64/Hex identifier from WebAuthn
  credentialPublicKey?: string;
  authenticatorAttachment: 'platform' | 'cross-platform';
  deviceLabel: string;      // e.g., "Windows Hello / Touch ID Platform Authenticator"
  wrappedDek: WrappedKey;   // DEK wrapped by 256-bit Biometric KEK
  bioKekHexEncrypted?: string; // Encapsulated biometric key payload bound to authenticator
  registeredAt: number;
  lastUsedAt?: number;
}

export type IrisDriverStatus = 'NOT_CONFIGURED' | 'DEMO_READY' | 'HARDWARE_CONNECTED';

export interface IrisScanResult {
  timestamp: number;
  confidence: number;       // 0 - 100%
  pupilDilationRatio: number;
  collaretteMatches: number;
  status: 'MATCH' | 'MISMATCH' | 'CALIBRATION_REQUIRED' | 'ERROR';
  isHardwareVerified: boolean; // false for demo/simulation
}

export interface IrisScanConfig {
  driverType: 'SIMULATED_DEMO_OPTICAL' | 'EXTERNAL_USB_ISO_19794' | 'PROPRIETARY_SDK';
  allowSimulationDemo: boolean;
  lastScanResult?: IrisScanResult;
  updatedAt: number;
}

export type GovernmentVerificationStatus = 'UNVERIFIED' | 'DEMO_VERIFIED' | 'OFFICIALLY_VERIFIED';

export interface GovernmentVerificationRecord {
  status: GovernmentVerificationStatus;
  provider: 'MOCK_UIDAI_AADHAAR' | 'DIGILOCKER_SANDBOX' | 'OFFICIAL_ASA_KUA';
  verificationId: string;        // Synthetic transaction UUID
  maskedIdentifier: string;      // e.g., "•••• •••• 9012" (Synthetic only)
  holderCategory: 'RESIDENT_INDIVIDUAL' | 'BUSINESS_ENTITY';
  verifiedAt: number;
  certificateDigestHex: string;  // BLAKE2b hash of verification record
  consentTimestamp: number;
  statutoryDisclaimerAcknowledged: boolean;
}

export interface MultiAuthSummary {
  hasMasterPassword: boolean;
  hasPin: boolean;
  isPinLocked: boolean;
  pinLockRemainingSeconds: number;
  hasBiometrics: boolean;
  biometricType?: string;
  irisStatus: IrisDriverStatus;
  governmentStatus: GovernmentVerificationStatus;
  preferredMethod: AuthMethodType;
}

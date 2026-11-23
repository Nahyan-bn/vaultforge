/**
 * VAULTFORGE 2.0 — Government Identity Verification Provider Service
 * Compliant Architecture: Provider-independent framework with strict regulatory guardrails.
 * 
 * LEGAL & SECURITY COMPLIANCE:
 * 1. Strictly sandbox demonstration mode for prototype evaluation.
 * 2. Unofficial APIs and scraping are prohibited.
 * 3. Never collects, processes, or stores real Aadhaar numbers or statutory credentials.
 * 4. All synthetic test identifiers are strictly masked (•••• •••• XXXX).
 * 5. Two distinct statuses: DEMO VERIFIED (simulation) and OFFICIALLY VERIFIED (requires certified ASA/KUA).
 */

import sodium from 'libsodium-wrappers-sumo';
import type { GovernmentVerificationRecord, GovernmentVerificationStatus } from '../types/auth';

export interface GovernmentIdProvider {
  id: string;
  name: string;
  isOfficialProvider: boolean;
  statutoryJurisdiction: string;
  requestOtp: (syntheticAadhaar: string) => Promise<{ txnId: string; maskedPhone: string; testHintOtp?: string }>;
  verifyOtp: (txnId: string, otp: string, syntheticAadhaar: string) => Promise<GovernmentVerificationRecord>;
}

/**
 * MOCK UIDAI AADHAAR PROVIDER (SANDBOX DEMO ENVIRONMENT)
 * Simulates the standard 2-factor OTP verification protocol with synthetic test data only.
 */
export class MockUidaiAadhaarProvider implements GovernmentIdProvider {
  public id = 'MOCK_UIDAI_AADHAAR';
  public name = 'UIDAI Sandbox Test Provider (Mock Government Verification)';
  public isOfficialProvider = false;
  public statutoryJurisdiction = 'India (UIDAI Regulations Sandbox Environment)';

  // In-memory active transaction store (never persisted)
  private activeTransactions: Map<string, { expectedOtp: string; last4: string; createdAt: number }> = new Map();

  public async requestOtp(syntheticAadhaar: string): Promise<{ txnId: string; maskedPhone: string; testHintOtp: string }> {
    // 1. Sanitize input: allow only digits
    const cleanDigits = syntheticAadhaar.replace(/\D/g, '');
    if (cleanDigits.length !== 12) {
      throw new Error('Synthetic Aadhaar must contain exactly 12 digits (e.g. 2345 6789 0123).');
    }

    // 2. Generate random transaction ID and 6-digit test OTP
    const txnId = `TXN_SANDBOX_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const last4 = cleanDigits.slice(-4);

    this.activeTransactions.set(txnId, {
      expectedOtp: testOtp,
      last4,
      createdAt: Date.now()
    });

    // Cleanup transactions older than 5 minutes
    setTimeout(() => {
      this.activeTransactions.delete(txnId);
    }, 5 * 60 * 1000);

    return {
      txnId,
      maskedPhone: '••••••8842',
      testHintOtp: testOtp
    };
  }

  public async verifyOtp(txnId: string, otp: string, _syntheticAadhaar: string): Promise<GovernmentVerificationRecord> {
    const txn = this.activeTransactions.get(txnId);
    if (!txn) {
      throw new Error('Verification transaction expired or invalid. Please request a new OTP.');
    }

    if (txn.expectedOtp !== otp.trim()) {
      throw new Error('Incorrect OTP. Authentication rejected by sandbox provider.');
    }

    // Remove transaction once verified
    this.activeTransactions.delete(txnId);

    // Compute cryptographic verification digest using BLAKE2b (C Engine)
    await sodium.ready;
    const timestamp = Date.now();
    const verificationContext = `VF_MOCK_GOV_VERIFY:${txnId}:${txn.last4}:${timestamp}`;
    const digest = sodium.crypto_generichash(32, verificationContext, null);
    const certificateDigestHex = sodium.to_hex(digest);

    return {
      status: 'DEMO_VERIFIED',
      provider: 'MOCK_UIDAI_AADHAAR',
      verificationId: txnId,
      maskedIdentifier: `•••• •••• ${txn.last4}`,
      holderCategory: 'RESIDENT_INDIVIDUAL',
      verifiedAt: timestamp,
      certificateDigestHex,
      consentTimestamp: timestamp - 15000,
      statutoryDisclaimerAcknowledged: true
    };
  }
}

/**
 * DigiLocker / National ID Official Provider Interface Stub
 * Pluggable adapter for future certified provider credentials
 */
export class DigiLockerEnterpriseProvider implements GovernmentIdProvider {
  public id = 'DIGILOCKER_SANDBOX';
  public name = 'DigiLocker Identity Gateway (API Sandbox)';
  public isOfficialProvider = false;
  public statutoryJurisdiction = 'India (Digital India / NeGD)';

  public async requestOtp(): Promise<any> {
    throw new Error('DigiLocker enterprise client credentials required for activation.');
  }

  public async verifyOtp(): Promise<any> {
    throw new Error('DigiLocker gateway unconfigured.');
  }
}

class GovernmentIdRegistry {
  private providers: Map<string, GovernmentIdProvider> = new Map();
  private activeProviderId: string = 'MOCK_UIDAI_AADHAAR';

  constructor() {
    this.registerProvider(new MockUidaiAadhaarProvider());
    this.registerProvider(new DigiLockerEnterpriseProvider());
  }

  public registerProvider(provider: GovernmentIdProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getActiveProvider(): GovernmentIdProvider {
    return this.providers.get(this.activeProviderId) || new MockUidaiAadhaarProvider();
  }

  public getAvailableProviders(): GovernmentIdProvider[] {
    return Array.from(this.providers.values());
  }

  public setActiveProvider(id: string): void {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }
}

export const governmentIdRegistry = new GovernmentIdRegistry();

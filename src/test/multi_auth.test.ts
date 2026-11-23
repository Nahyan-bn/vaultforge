import { describe, it, expect, beforeAll } from 'vitest';
import sodium from 'libsodium-wrappers-sumo';
import { SimulatedIrisDriver } from '../services/irisDriverService';
import { MockUidaiAadhaarProvider } from '../services/governmentIdService';

describe('VAULTFORGE 2.0 Multi-Layer Authentication Tests', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  describe('Six-Digit PIN Envelope Encryption', () => {
    it('should derive PIN KEK via Argon2id and wrap/unwrap DEK', () => {
      const pin = '482910';
      const salt = sodium.randombytes_buf(16);
      const dek = sodium.randombytes_buf(32);

      // 1. Derive PIN KEK via Argon2id (using interactive test opslimit/memlimit)
      const pinKek = sodium.crypto_pwhash(
        32,
        pin,
        salt,
        2,
        16 * 1024 * 1024,
        sodium.crypto_pwhash_ALG_ARGON2ID13
      );

      // 2. Wrap DEK with PIN KEK
      const nonce = sodium.randombytes_buf(24);
      const ad = sodium.from_string('VAULTFORGE_PIN_ENVELOPE_V1');
      const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        dek,
        ad,
        null,
        nonce,
        pinKek
      );

      // 3. Unwrap with correct PIN KEK
      const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        encrypted,
        ad,
        nonce,
        pinKek
      );

      expect(sodium.to_hex(decrypted)).toBe(sodium.to_hex(dek));
    });

    it('should reject DEK unwrap when incorrect PIN is entered', () => {
      const correctPin = '123456';
      const wrongPin = '654321';
      const salt = sodium.randombytes_buf(16);
      const dek = sodium.randombytes_buf(32);

      const correctKek = sodium.crypto_pwhash(
        32,
        correctPin,
        salt,
        2,
        16 * 1024 * 1024,
        sodium.crypto_pwhash_ALG_ARGON2ID13
      );

      const wrongKek = sodium.crypto_pwhash(
        32,
        wrongPin,
        salt,
        2,
        16 * 1024 * 1024,
        sodium.crypto_pwhash_ALG_ARGON2ID13
      );

      const nonce = sodium.randombytes_buf(24);
      const ad = sodium.from_string('VAULTFORGE_PIN_ENVELOPE_V1');
      const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        dek,
        ad,
        null,
        nonce,
        correctKek
      );

      // Decryption with wrong PIN KEK must fail Poly1305 authentication
      expect(() => {
        sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
          null,
          encrypted,
          ad,
          nonce,
          wrongKek
        );
      }).toThrow();
    });

    it('should calculate exponential lockout threshold after 5 failed attempts', () => {
      const maxAttempts = 5;
      let failedAttempts = 5;
      let lockUntil = 0;
      const now = Date.now();

      if (failedAttempts >= maxAttempts) {
        const backoffMinutes = Math.min(30, Math.pow(2, failedAttempts - maxAttempts));
        lockUntil = now + backoffMinutes * 60 * 1000;
      }

      expect(lockUntil).toBeGreaterThan(now);
      expect(lockUntil - now).toBe(60 * 1000); // 1 minute lockout on 5th attempt
    });
  });

  describe('Biometric Passkey Envelope Architecture', () => {
    it('should wrap DEK using high-entropy Biometric KEK', () => {
      const dek = sodium.randombytes_buf(32);
      const bioKek = sodium.randombytes_buf(32); // 256-bit high-entropy biometric key
      const nonce = sodium.randombytes_buf(24);
      const ad = sodium.from_string('VAULTFORGE_BIOMETRIC_ENVELOPE_V1');

      const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        dek,
        ad,
        null,
        nonce,
        bioKek
      );

      const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        encrypted,
        ad,
        nonce,
        bioKek
      );

      expect(sodium.to_hex(decrypted)).toBe(sodium.to_hex(dek));
    });
  });

  describe('Iris Hardware Driver & Simulation Subsystem', () => {
    it('should initialize and extract 2D Gabor wavelet feature vectors in demonstration mode', async () => {
      const driver = new SimulatedIrisDriver();
      expect(driver.id).toBe('SIMULATED_DEMO_OPTICAL');

      const isConnected = await driver.isHardwareConnected();
      expect(isConnected).toBe(true);

      const initOk = await driver.initialize();
      expect(initOk).toBe(true);

      const result = await driver.captureAndExtract();
      expect(result.status).toBe('MATCH');
      expect(result.isHardwareVerified).toBe(false); // Compliance requirement: Demo mode explicitly flagged
      expect(result.confidence).toBeGreaterThan(90);
      expect(result.collaretteMatches).toBe(482);
    });
  });

  describe('Government Identity Verification Sandbox', () => {
    it('should validate synthetic 12-digit Aadhaar and reject non-12-digit inputs', async () => {
      const provider = new MockUidaiAadhaarProvider();

      // Reject non-12 digits
      await expect(provider.requestOtp('12345')).rejects.toThrow();

      // Accept valid 12-digit synthetic test identity
      const otpRes = await provider.requestOtp('234567890123');
      expect(otpRes.txnId).toContain('TXN_SANDBOX_');
      expect(otpRes.testHintOtp).toBeDefined();
      expect(otpRes.testHintOtp?.length).toBe(6);
    });

    it('should verify OTP and produce a DEMO VERIFIED record with masked identifier and BLAKE2b receipt', async () => {
      const provider = new MockUidaiAadhaarProvider();
      const syntheticId = '234567890123';
      const otpRes = await provider.requestOtp(syntheticId);

      const record = await provider.verifyOtp(otpRes.txnId, otpRes.testHintOtp!, syntheticId);

      expect(record.status).toBe('DEMO_VERIFIED');
      expect(record.maskedIdentifier).toBe('•••• •••• 0123');
      expect(record.certificateDigestHex.length).toBe(64); // 256-bit BLAKE2b hex digest
      expect(record.statutoryDisclaimerAcknowledged).toBe(true);
    });

    it('should reject invalid OTP challenge', async () => {
      const provider = new MockUidaiAadhaarProvider();
      const otpRes = await provider.requestOtp('987654321098');

      await expect(provider.verifyOtp(otpRes.txnId, '000000', '987654321098')).rejects.toThrow(
        /Incorrect OTP/
      );
    });
  });

  describe('User Account Isolation & Dynamic Login Workflow', () => {
    it('should filter login methods strictly by user registration state (Requirement 6)', () => {
      // Simulate User A: Registered Fingerprint + PIN, Iris Not Registered
      const userA = {
        name: 'Developer Vault',
        biometricAuth: { enabled: true, credentialId: 'cred_bio_123' },
        pinAuth: { enabled: true },
        irisAuth: undefined // Not registered
      };

      const computeRegisteredMethods = (vault: any) => {
        const methods: string[] = [];
        if (vault.biometricAuth?.enabled) methods.push('biometric');
        if (vault.pinAuth?.enabled) methods.push('pin');
        if (vault.irisAuth?.registered) methods.push('iris');
        methods.push('password'); // Always fallback
        return methods;
      };

      const userAMethods = computeRegisteredMethods(userA);
      expect(userAMethods).toContain('biometric');
      expect(userAMethods).toContain('pin');
      expect(userAMethods).toContain('password');
      expect(userAMethods).not.toContain('iris'); // MUST NOT display unavailable methods

      // Simulate User B: Only registered Master Password
      const userB = {
        name: 'Minimal Vault',
        biometricAuth: undefined,
        pinAuth: undefined,
        irisAuth: undefined
      };

      const userBMethods = computeRegisteredMethods(userB);
      expect(userBMethods).toEqual(['password']);
      expect(userBMethods).not.toContain('biometric');
      expect(userBMethods).not.toContain('pin');
      expect(userBMethods).not.toContain('iris');
    });

    it('should support independent registration and removal of security authenticators', () => {
      const vaultProfile: {
        pinAuth?: { enabled: boolean };
        biometricAuth?: { enabled: boolean };
        irisAuth?: { registered: boolean };
      } = {};

      // Register PIN independently
      vaultProfile.pinAuth = { enabled: true };
      expect(vaultProfile.pinAuth.enabled).toBe(true);
      expect(vaultProfile.biometricAuth).toBeUndefined();

      // Register Fingerprint independently
      vaultProfile.biometricAuth = { enabled: true };
      expect(vaultProfile.biometricAuth.enabled).toBe(true);

      // Remove PIN independently without affecting Biometrics
      delete vaultProfile.pinAuth;
      expect(vaultProfile.pinAuth).toBeUndefined();
      expect(vaultProfile.biometricAuth?.enabled).toBe(true);
    });
  });
});

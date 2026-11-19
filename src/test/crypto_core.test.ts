import { describe, it, expect, beforeAll } from 'vitest';
import sodium from 'libsodium-wrappers-sumo';
import { calculatePasswordEntropy, evaluatePasswordQuality, analyzeVaultHealth } from '../utils/securityAnalysis';
import type { DecryptedRecord } from '../types/vault';

describe('VAULTFORGE — Cryptographic & Security Verification', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  it('1. WebAssembly libsodium C core initializes successfully', () => {
    expect(sodium.SODIUM_LIBRARY_VERSION_MAJOR).toBeGreaterThan(0);
    expect(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES).toBe(32);
    expect(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES).toBe(24);
    expect(sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES).toBe(16);
  });

  it('2. Argon2id derives 256-bit KEK from password and 16-byte salt', () => {
    const password = 'CapstoneMasterPassword2026!';
    const salt = sodium.randombytes_buf(16);
    const kek = sodium.crypto_pwhash(
      32,
      password,
      salt,
      2, // opslimit
      16 * 1024 * 1024, // 16MB RAM
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    expect(kek.length).toBe(32);

    // Deriving with same parameters must produce identical key
    const kek2 = sodium.crypto_pwhash(
      32,
      password,
      salt,
      2,
      16 * 1024 * 1024,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );
    expect(sodium.to_hex(kek)).toBe(sodium.to_hex(kek2));

    // Deriving with different salt must produce completely different key
    const differentSalt = sodium.randombytes_buf(16);
    const kekDiff = sodium.crypto_pwhash(
      32,
      password,
      differentSalt,
      2,
      16 * 1024 * 1024,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );
    expect(sodium.to_hex(kek)).not.toBe(sodium.to_hex(kekDiff));
  });

  it('3. Envelope Encryption: KEK wraps and unwraps 256-bit DEK', () => {
    const dek = sodium.randombytes_buf(32);
    const kek = sodium.randombytes_buf(32);
    const nonce = sodium.randombytes_buf(24);
    const ad = sodium.from_string('VAULTFORGE_DEK_ENVELOPE_V1');

    // Wrap DEK
    const wrapped = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      dek,
      ad,
      null,
      nonce,
      kek
    );

    // Unwrap DEK with correct KEK
    const unwrapped = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      wrapped,
      ad,
      nonce,
      kek
    );
    expect(sodium.to_hex(unwrapped)).toBe(sodium.to_hex(dek));

    // Attempt unwrap with wrong KEK must throw authentication failure
    const wrongKek = sodium.randombytes_buf(32);
    expect(() => {
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        wrapped,
        ad,
        nonce,
        wrongKek
      );
    }).toThrow();
  });

  it('4. Authenticated Encryption (XChaCha20-Poly1305) & Decryption', () => {
    const key = sodium.randombytes_buf(32);
    const nonce = sodium.randombytes_buf(24);
    const plaintext = 'Secret credential database record';
    const plaintextBytes = sodium.from_string(plaintext);
    const ad = sodium.from_string('VAULTFORGE_RECORD:test');

    const cipherAndTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintextBytes,
      ad,
      null,
      nonce,
      key
    );

    // Ensure cipher length equals plaintext length + 16-byte Poly1305 MAC tag
    expect(cipherAndTag.length).toBe(plaintextBytes.length + 16);

    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      cipherAndTag,
      ad,
      nonce,
      key
    );

    expect(sodium.to_string(decrypted)).toBe(plaintext);
  });

  it('5. Tamper Detection: Modified ciphertext is strictly rejected', () => {
    const key = sodium.randombytes_buf(32);
    const nonce = sodium.randombytes_buf(24);
    const plaintextBytes = sodium.from_string('Critical bank credentials');
    const ad = sodium.from_string('VAULTFORGE_RECORD');

    const cipherAndTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintextBytes,
      ad,
      null,
      nonce,
      key
    );

    // Deliberately flip 1 bit in ciphertext
    const corrupted = new Uint8Array(cipherAndTag);
    corrupted[0] ^= 0x01;

    expect(() => {
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        corrupted,
        ad,
        nonce,
        key
      );
    }).toThrow();
  });

  it('6. Tamper Detection: Modified Poly1305 MAC tag is strictly rejected', () => {
    const key = sodium.randombytes_buf(32);
    const nonce = sodium.randombytes_buf(24);
    const plaintextBytes = sodium.from_string('System Root Token');
    const ad = sodium.from_string('VAULTFORGE_RECORD');

    const cipherAndTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintextBytes,
      ad,
      null,
      nonce,
      key
    );

    // Corrupt last byte (which resides in the Poly1305 tag)
    const corrupted = new Uint8Array(cipherAndTag);
    corrupted[corrupted.length - 1] ^= 0xff;

    expect(() => {
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        corrupted,
        ad,
        nonce,
        key
      );
    }).toThrow();
  });

  it('7. Memory Hygiene: sodium_memzero wipes buffer contents', () => {
    const buffer = sodium.randombytes_buf(32);
    const nonZeroBefore = buffer.some((b) => b !== 0);
    expect(nonZeroBefore).toBe(true);

    sodium.memzero(buffer);
    const allZeroAfter = buffer.every((b) => b === 0);
    expect(allZeroAfter).toBe(true);
  });

  it('8. Password Quality & Entropy Evaluator', () => {
    const weak = evaluatePasswordQuality('password');
    expect(weak.strength).toBe('WEAK');

    const strong = evaluatePasswordQuality('C4pst0ne#S3cure_Pr0ject2026!');
    expect(strong.strength === 'STRONG' || strong.strength === 'EXCELLENT').toBe(true);

    const entropy = calculatePasswordEntropy('Tr0ub4dor&3');
    expect(entropy).toBeGreaterThan(40);
  });

  it('9. Vault Health Analysis detects weak and reused passwords', () => {
    const mockRecords: DecryptedRecord[] = [
      {
        id: '1',
        vaultId: 'v1',
        type: 'login',
        title: 'Site A',
        username: 'user1',
        password: 'reused_password123',
        category: 'Test',
        tags: [],
        isFavorite: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: '2',
        vaultId: 'v1',
        type: 'login',
        title: 'Site B',
        username: 'user2',
        password: 'reused_password123', // Reused!
        category: 'Test',
        tags: [],
        isFavorite: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: '3',
        vaultId: 'v1',
        type: 'login',
        title: 'Site C',
        username: 'user3',
        password: '123', // Weak & short!
        category: 'Test',
        tags: [],
        isFavorite: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const analytics = analyzeVaultHealth(mockRecords);
    expect(analytics.totalRecords).toBe(3);
    expect(analytics.reusedPasswords).toBe(2);
    expect(analytics.weakPasswords).toBeGreaterThan(0);
    expect(analytics.securityScore).toBeLessThan(70);
    expect(analytics.issues.length).toBeGreaterThan(0);
  });

  it('10. Hash-linked audit chain verification', () => {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const event1 = 'Vault created';
    const digest1 = sodium.to_hex(sodium.crypto_generichash(32, sodium.from_string(`${genesisHash}:${event1}`), null));

    const event2 = 'Credential added';
    const digest2 = sodium.to_hex(sodium.crypto_generichash(32, sodium.from_string(`${digest1}:${event2}`), null));

    expect(digest1).not.toBe(genesisHash);
    expect(digest2).not.toBe(digest1);
  });
});

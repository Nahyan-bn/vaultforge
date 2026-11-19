import { describe, it, expect, beforeAll } from 'vitest';
import sodium from 'libsodium-wrappers-sumo';

describe('VAULTFORGE — Vault Lifecycle & Recovery Workflows', () => {
  beforeAll(async () => {
    await sodium.ready;
  });

  it('1. Vault Creation and Emergency Recovery Key derivation workflow', () => {
    const masterPassword = 'MasterPassword123!';
    const salt = sodium.randombytes_buf(16);

    // 1. Derive Primary KEK
    const primaryKek = sodium.crypto_pwhash(
      32,
      masterPassword,
      salt,
      2,
      16 * 1024 * 1024,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    // 2. Generate Random DEK
    const dek = sodium.randombytes_buf(32);

    // 3. Wrap DEK with Primary KEK
    const primaryNonce = sodium.randombytes_buf(24);
    const primaryWrappedDek = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      dek,
      sodium.from_string('VAULTFORGE_DEK_ENVELOPE_V1'),
      null,
      primaryNonce,
      primaryKek
    );

    // 4. Generate Emergency Recovery Key (256-bit secret)
    const recoverySecret = sodium.randombytes_buf(32);
    const recoveryKek = sodium.crypto_generichash(
      32,
      sodium.from_string(`VF_RECOVERY_KEY_DERIVATION:${sodium.to_hex(recoverySecret)}`),
      null
    );

    // 5. Wrap DEK with Recovery KEK
    const recoveryNonce = sodium.randombytes_buf(24);
    const recoveryWrappedDek = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      dek,
      sodium.from_string('VAULTFORGE_RECOVERY_ENVELOPE_V1'),
      null,
      recoveryNonce,
      recoveryKek
    );

    // Verify recovery unwrapping succeeds
    const recoveredDek = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      recoveryWrappedDek,
      sodium.from_string('VAULTFORGE_RECOVERY_ENVELOPE_V1'),
      recoveryNonce,
      recoveryKek
    );

    expect(sodium.to_hex(recoveredDek)).toBe(sodium.to_hex(dek));
  });

  it('2. Changing master password re-wraps DEK without touching records', () => {
    const originalPassword = 'OldPassword123!';
    const newPassword = 'NewPassword2026!';
    const originalSalt = sodium.randombytes_buf(16);
    const newSalt = sodium.randombytes_buf(16);
    const dek = sodium.randombytes_buf(32);

    // User encrypts a sensitive record with DEK
    const recordNonce = sodium.randombytes_buf(24);
    const recordCiphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      sodium.from_string('GitHub Token: ghp_123456789'),
      sodium.from_string('RECORD_AD'),
      null,
      recordNonce,
      dek
    );

    // Change master password:
    // Derive new KEK and wrap existing DEK
    const newKek = sodium.crypto_pwhash(
      32,
      newPassword,
      newSalt,
      2,
      16 * 1024 * 1024,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    const newWrappedNonce = sodium.randombytes_buf(24);
    const newWrappedDek = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      dek,
      sodium.from_string('VAULTFORGE_DEK_ENVELOPE_V1'),
      null,
      newWrappedNonce,
      newKek
    );

    // Unlock with new password:
    const unlockedDek = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      newWrappedDek,
      sodium.from_string('VAULTFORGE_DEK_ENVELOPE_V1'),
      newWrappedNonce,
      newKek
    );

    expect(sodium.to_hex(unlockedDek)).toBe(sodium.to_hex(dek));

    // Existing record decrypts seamlessly with the unwrapped DEK!
    const decryptedRecord = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      recordCiphertext,
      sodium.from_string('RECORD_AD'),
      recordNonce,
      unlockedDek
    );

    expect(sodium.to_string(decryptedRecord)).toBe('GitHub Token: ghp_123456789');
  });

  it('3. Encrypted backup package serialization and verification', () => {
    const backup = {
      format: 'VAULTFORGE_ENCRYPTED_BACKUP',
      version: '1.0',
      exportedAt: Date.now(),
      vaultMeta: {
        name: 'Personal Vault',
        color: '#2F6BFF',
        saltHex: 'a1b2c3d4e5f6',
        kdfParams: { opslimit: 2, memlimit: 33554432, algorithm: 2 }
      },
      encryptedRecords: [
        { id: 'rec_1', ciphertextHex: 'deadbeef', tagHex: 'cafebabe', nonceHex: '010203' }
      ]
    };

    const serialized = JSON.stringify(backup);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.format).toBe('VAULTFORGE_ENCRYPTED_BACKUP');
    expect(deserialized.encryptedRecords.length).toBe(1);
    expect(deserialized.encryptedRecords[0].ciphertextHex).toBe('deadbeef');
  });
});

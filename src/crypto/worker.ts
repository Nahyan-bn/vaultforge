/**
 * VAULTFORGE — Cryptographic Dedicated Web Worker
 * Executes libsodium C core via WebAssembly
 * Domain: Argon2id, XChaCha20-Poly1305, CSPRNG, sodium_memzero
 */

import sodium from 'libsodium-wrappers-sumo';
import type { WorkerRequest, WorkerResponse, TelemetryLog, WrappedKey, EncryptedPayload, KdfParams } from './types';

let isReady = false;
let heldKeyMemory: Uint8Array[] = [];

// Initialize libsodium WebAssembly
const initPromise = (async () => {
  await sodium.ready;
  isReady = true;
  return true;
})();

function recordTelemetry(
  c_function: string,
  operation: TelemetryLog['operation'],
  input_bytes: number,
  output_bytes: number,
  duration_ms: number,
  status: TelemetryLog['status']
): TelemetryLog {
  return {
    id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    c_function,
    operation,
    input_bytes,
    output_bytes,
    duration_ms: Number(duration_ms.toFixed(2)),
    status,
    timestamp: Date.now()
  };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  const start = performance.now();

  try {
    await initPromise;

    switch (req.type) {
      case 'INIT': {
        const duration = performance.now() - start;
        const telemetry = recordTelemetry('sodium_init()', 'KEY_GEN', 0, 0, duration, 'VF_OK');
        self.postMessage({
          id: req.id,
          success: true,
          data: { versionMajor: sodium.SODIUM_LIBRARY_VERSION_MAJOR, ready: isReady },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'CALIBRATE_KDF': {
        // Safe calibration: calculate duration of 1 iteration to gauge device speed
        const testPwd = 'vaultforge_benchmark_passphrase';
        const testSalt = sodium.randombytes_buf(16);
        const t0 = performance.now();
        sodium.crypto_pwhash(
          32,
          testPwd,
          testSalt,
          2, // opslimit
          16 * 1024 * 1024, // 16MB
          sodium.crypto_pwhash_ALG_ARGON2ID13
        );
        const singlePassMs = performance.now() - t0;

        // Choose calibrated parameters targeting ~200-400ms for responsive unlock
        let opslimit = 3;
        let memlimit = 64 * 1024 * 1024; // 64 MB
        if (singlePassMs > 150) {
          opslimit = 2;
          memlimit = 32 * 1024 * 1024; // 32 MB
        } else if (singlePassMs < 50) {
          opslimit = 4;
          memlimit = 64 * 1024 * 1024; // 64 MB
        }

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('crypto_pwhash_calibrate()', 'KDF_CALIBRATE', testPwd.length, 32, duration, 'VF_OK');
        self.postMessage({
          id: req.id,
          success: true,
          data: { opslimit, memlimit, algorithm: sodium.crypto_pwhash_ALG_ARGON2ID13, benchmarkDurationMs: singlePassMs },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'DERIVE_KEK': {
        const salt = sodium.from_hex(req.saltHex);
        const kek = sodium.crypto_pwhash(
          32,
          req.password,
          salt,
          req.params.opslimit,
          req.params.memlimit,
          req.params.algorithm || sodium.crypto_pwhash_ALG_ARGON2ID13
        );
        heldKeyMemory.push(kek);
        const kekHex = sodium.to_hex(kek);
        const duration = performance.now() - start;
        const telemetry = recordTelemetry('crypto_pwhash_argon2id13()', 'KDF_DERIVE', req.password.length + salt.length, 32, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { kekHex },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'GENERATE_DEK': {
        const dek = sodium.randombytes_buf(32);
        heldKeyMemory.push(dek);
        const dekHex = sodium.to_hex(dek);
        const duration = performance.now() - start;
        const telemetry = recordTelemetry('randombytes_buf(32)', 'KEY_GEN', 0, 32, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { dekHex },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'WRAP_KEY': {
        const dek = sodium.from_hex(req.dekHex);
        const kek = sodium.from_hex(req.kekHex);
        const nonce = sodium.randombytes_buf(24);
        const ad = req.context ? sodium.from_string(req.context) : new Uint8Array(0);

        // Encrypt DEK using KEK with XChaCha20-Poly1305
        const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
          dek,
          ad,
          null,
          nonce,
          kek
        );

        // In libsodium, encrypted = ciphertext (32 bytes) + tag (16 bytes)
        const cipherDek = encrypted.subarray(0, 32);
        const tag = encrypted.subarray(32);

        const wrapped: WrappedKey = {
          nonceHex: sodium.to_hex(nonce),
          tagHex: sodium.to_hex(tag),
          cipherDekHex: sodium.to_hex(cipherDek)
        };

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_encrypt()', 'KEY_WRAP', 32, 48, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { wrapped },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'UNWRAP_KEY': {
        const kek = sodium.from_hex(req.kekHex);
        const nonce = sodium.from_hex(req.wrapped.nonceHex);
        const cipherDek = sodium.from_hex(req.wrapped.cipherDekHex);
        const tag = sodium.from_hex(req.wrapped.tagHex);
        const ad = req.context ? sodium.from_string(req.context) : new Uint8Array(0);

        // Recombine cipher and tag for libsodium open
        const combined = new Uint8Array(cipherDek.length + tag.length);
        combined.set(cipherDek, 0);
        combined.set(tag, cipherDek.length);

        try {
          const dek = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null,
            combined,
            ad,
            nonce,
            kek
          );
          heldKeyMemory.push(dek);
          const dekHex = sodium.to_hex(dek);
          const duration = performance.now() - start;
          const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_decrypt()', 'KEY_UNWRAP', 48, 32, duration, 'VF_OK');

          self.postMessage({
            id: req.id,
            success: true,
            data: { dekHex },
            telemetry
          } satisfies WorkerResponse);
        } catch {
          const duration = performance.now() - start;
          const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_decrypt()', 'KEY_UNWRAP', 48, 0, duration, 'VF_ERR_AUTH_FAILED');
          self.postMessage({
            id: req.id,
            success: false,
            error: 'Authentication failed: Invalid password or corrupted key wrapping envelope',
            telemetry
          } satisfies WorkerResponse);
        }
        break;
      }

      case 'SEAL_RECORD': {
        const key = sodium.from_hex(req.keyHex);
        const plaintextBytes = sodium.from_string(req.plaintext);
        const nonce = sodium.randombytes_buf(24);
        const ad = req.ad ? sodium.from_string(req.ad) : new Uint8Array(0);

        const cipherAndTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
          plaintextBytes,
          ad,
          null,
          nonce,
          key
        );

        const cipherBytes = cipherAndTag.subarray(0, plaintextBytes.length);
        const tagBytes = cipherAndTag.subarray(plaintextBytes.length);

        const payload: EncryptedPayload = {
          nonceHex: sodium.to_hex(nonce),
          tagHex: sodium.to_hex(tagBytes),
          ciphertextHex: sodium.to_hex(cipherBytes),
          adHex: req.ad ? sodium.to_hex(ad) : undefined
        };

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_encrypt()', 'AEAD_SEAL', plaintextBytes.length, cipherAndTag.length, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { payload },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'OPEN_RECORD': {
        const key = sodium.from_hex(req.keyHex);
        const nonce = sodium.from_hex(req.payload.nonceHex);
        const cipherBytes = sodium.from_hex(req.payload.ciphertextHex);
        const tagBytes = sodium.from_hex(req.payload.tagHex);
        const ad = req.payload.adHex ? sodium.from_hex(req.payload.adHex) : (req.ad ? sodium.from_string(req.ad) : new Uint8Array(0));

        const combined = new Uint8Array(cipherBytes.length + tagBytes.length);
        combined.set(cipherBytes, 0);
        combined.set(tagBytes, cipherBytes.length);

        try {
          const decryptedBytes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null,
            combined,
            ad,
            nonce,
            key
          );
          const plaintext = sodium.to_string(decryptedBytes);
          const duration = performance.now() - start;
          const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_decrypt()', 'AEAD_OPEN', combined.length, decryptedBytes.length, duration, 'VF_OK');

          self.postMessage({
            id: req.id,
            success: true,
            data: { plaintext },
            telemetry
          } satisfies WorkerResponse);
        } catch {
          const duration = performance.now() - start;
          const telemetry = recordTelemetry('crypto_aead_xchacha20poly1305_ietf_decrypt()', 'AEAD_OPEN', combined.length, 0, duration, 'VF_ERR_AUTH_FAILED');
          self.postMessage({
            id: req.id,
            success: false,
            error: 'AEAD Poly1305 authentication failed: Record has been tampered with or key is incorrect.',
            telemetry
          } satisfies WorkerResponse);
        }
        break;
      }

      case 'GENERATE_PASSWORD': {
        let chars = '';
        const { uppercase, lowercase, numbers, symbols, excludeAmbiguous } = req.options;
        const amb = 'il1Lo0O';

        if (lowercase) chars += excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        if (uppercase) chars += excludeAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (numbers) chars += excludeAmbiguous ? '23456789' : '0123456789';
        if (symbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

        if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';
        for (let i = 0; i < req.length; i++) {
          const idx = sodium.randombytes_uniform(chars.length);
          result += chars[idx];
        }

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('randombytes_uniform()', 'CSPRNG_GEN', 0, req.length, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { password: result },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'GENERATE_PIN': {
        let pin = '';
        for (let i = 0; i < req.length; i++) {
          const d = sodium.randombytes_uniform(10);
          pin += d.toString();
        }
        const duration = performance.now() - start;
        const telemetry = recordTelemetry('randombytes_uniform(10)', 'CSPRNG_GEN', 0, req.length, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { pin },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'HASH_DIGEST': {
        const dataBytes = sodium.from_string(req.data);
        const digestBytes = sodium.crypto_generichash(32, dataBytes, null);
        const hashHex = sodium.to_hex(digestBytes);
        const duration = performance.now() - start;
        const telemetry = recordTelemetry('crypto_generichash()', 'INTEGRITY_CHECK', dataBytes.length, 32, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { hashHex },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'PANIC_LOCK': {
        // Zero all retained key buffers using sodium_memzero
        let wipedCount = 0;
        for (const buf of heldKeyMemory) {
          sodium.memzero(buf);
          wipedCount++;
        }
        heldKeyMemory = [];

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('sodium_memzero()', 'MEM_ZERO', wipedCount * 32, 0, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { wipedBuffers: wipedCount },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      case 'TAMPER_DEMO': {
        // Safe laboratory demonstration: intentionally flip a byte to test AEAD integrity detection
        const p = req.payload;
        let tamperedPayload = { ...p };

        const flipByte = (hexStr: string, idx: number) => {
          const arr = sodium.from_hex(hexStr);
          if (idx < arr.length) {
            arr[idx] ^= 0x5a; // bitwise flip
          }
          return sodium.to_hex(arr);
        };

        if (req.target === 'ciphertext') {
          tamperedPayload.ciphertextHex = flipByte(p.ciphertextHex, req.byteIndex);
        } else if (req.target === 'tag') {
          tamperedPayload.tagHex = flipByte(p.tagHex, req.byteIndex % 16);
        } else if (req.target === 'nonce') {
          tamperedPayload.nonceHex = flipByte(p.nonceHex, req.byteIndex % 24);
        } else if (req.target === 'ad' && p.adHex) {
          tamperedPayload.adHex = flipByte(p.adHex, req.byteIndex);
        }

        const duration = performance.now() - start;
        const telemetry = recordTelemetry('tamper_simulation()', 'INTEGRITY_CHECK', 1, 1, duration, 'VF_OK');

        self.postMessage({
          id: req.id,
          success: true,
          data: { tamperedPayload },
          telemetry
        } satisfies WorkerResponse);
        break;
      }

      default:
        throw new Error(`Unknown request type: ${(req as any).type}`);
    }
  } catch (err: any) {
    const duration = performance.now() - start;
    const telemetry = recordTelemetry('vf_error', 'INTEGRITY_CHECK', 0, 0, duration, 'VF_ERR_INTERNAL');
    self.postMessage({
      id: req.id,
      success: false,
      error: err?.message || 'Cryptographic engine error',
      telemetry
    } satisfies WorkerResponse);
  }
};

/**
 * VAULTFORGE — Cryptographic Type Definitions & IPC Protocols
 * Domain: C11 / WebAssembly Typed Bridge
 */

export interface KdfParams {
  opslimit: number;      // Argon2id computational passes (e.g. 2, 3)
  memlimit: number;      // Argon2id memory in bytes (e.g. 67108864 = 64MB)
  algorithm: number;     // 2 = Argon2id13
}

export interface WrappedKey {
  nonceHex: string;      // 24-byte hex (48 chars)
  tagHex: string;        // 16-byte hex (32 chars)
  cipherDekHex: string;  // 32-byte hex (64 chars)
}

export interface EncryptedPayload {
  nonceHex: string;      // 24-byte fresh nonce
  tagHex: string;        // 16-byte Poly1305 MAC tag
  ciphertextHex: string; // Encrypted data hex
  adHex?: string;        // Bound associated data
}

export interface TelemetryLog {
  id: string;
  c_function: string;
  operation: 'KDF_DERIVE' | 'KDF_CALIBRATE' | 'KEY_GEN' | 'KEY_WRAP' | 'KEY_UNWRAP' | 'AEAD_SEAL' | 'AEAD_OPEN' | 'CSPRNG_GEN' | 'MEM_ZERO' | 'INTEGRITY_CHECK';
  input_bytes: number;
  output_bytes: number;
  duration_ms: number;
  status: 'VF_OK' | 'VF_ERR_AUTH_FAILED' | 'VF_ERR_PARAM' | 'VF_ERR_INTERNAL';
  timestamp: number;
}

export type WorkerRequest =
  | { id: string; type: 'INIT' }
  | { id: string; type: 'CALIBRATE_KDF'; targetMs?: number }
  | { id: string; type: 'DERIVE_KEK'; password: string; saltHex: string; params: KdfParams }
  | { id: string; type: 'GENERATE_DEK' }
  | { id: string; type: 'WRAP_KEY'; dekHex: string; kekHex: string; context?: string }
  | { id: string; type: 'UNWRAP_KEY'; wrapped: WrappedKey; kekHex: string; context?: string }
  | { id: string; type: 'SEAL_RECORD'; plaintext: string; keyHex: string; ad?: string }
  | { id: string; type: 'OPEN_RECORD'; payload: EncryptedPayload; keyHex: string; ad?: string }
  | { id: string; type: 'GENERATE_PASSWORD'; length: number; options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean; excludeAmbiguous: boolean } }
  | { id: string; type: 'GENERATE_PIN'; length: number }
  | { id: string; type: 'HASH_DIGEST'; data: string }
  | { id: string; type: 'PANIC_LOCK' }
  | { id: string; type: 'TAMPER_DEMO'; payload: EncryptedPayload; target: 'ciphertext' | 'tag' | 'nonce' | 'ad'; byteIndex: number };

export type WorkerResponse = {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  telemetry: TelemetryLog;
};

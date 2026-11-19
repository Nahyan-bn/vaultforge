# VAULTFORGE — Architecture Specification
**Capstone Team:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Version:** 1.0  

---

## 1. Architectural Philosophy

VAULTFORGE adheres to three non-negotiable architectural tenets:
1. **Local-First Zero-Knowledge:** Plaintext credentials and master keys never leave the client application. No remote servers hold decryption keys or ciphertext.
2. **Strict Cryptographic Isolation:** Cryptographic primitives and key material execute exclusively within an isolated WebAssembly C core inside a dedicated Web Worker thread. The main UI thread never handles raw cryptographic algorithms.
3. **Envelope Encryption Decoupling:** Authentication (KEK) is decoupled from data protection (DEK). This permits instantaneous master password changes and emergency recovery key unwrapping without database re-encryption.

---

## 2. Component Layering

### 2.1 User Interface Layer (React 19 & TypeScript)
- **Design System:** Custom "Cyber Dark" palette (`#05070D` background, `#0B1220` surface, `#2F6BFF` primary, `#22E3FF` cyan, `#8B5CF6` violet).
- **State Stores:** Zustand stores (`useVaultStore`, `useTelemetryStore`) holding transient decrypted state only while the vault session is actively unlocked.
- **Visual Instrumentation:** Responsive SVG radar charts, animated mechanical vault geometry, real-time security score orb, and C-engine telemetry drawer.

### 2.2 Application Bridge Layer (`src/crypto/bridge.ts`)
- Implements an asynchronous, promise-driven Remote Procedure Call (RPC) bridge communicating with the Web Worker via typed `postMessage` requests.
- Intercepts and dispatches sanitized telemetry telemetry packets (`c_function`, `operation`, `input_bytes`, `output_bytes`, `duration_ms`, `status`) to the developer drawer.

### 2.3 Dedicated Cryptographic Worker (`src/crypto/worker.ts`)
- Runs in an isolated background thread, preventing heavy memory-hard computations (e.g., Argon2id 64MB passes) from causing UI frame drops.
- Maintains in-memory key buffers and explicitly executes volatile zeroing upon receipt of `PANIC_LOCK` or session termination.

### 2.4 C11 Core & WebAssembly Engine (`src/crypto_core/`)
- Contains modular C11 code structured for native compilation with CMake as well as WebAssembly packaging via libsodium.
- Provides cryptographic primitives:
  - `crypto_pwhash_argon2id13`
  - `crypto_aead_xchacha20poly1305_ietf_encrypt` / `decrypt`
  - `randombytes_buf` / `randombytes_uniform`
  - `crypto_generichash` (BLAKE2b)
  - `sodium_memzero`

### 2.5 Storage Layer (`src/storage/indexedDb.ts`)
- Utilizes browser IndexedDB with strict schema isolation:
  - `vault_meta`: Public vault ID, salt (16 bytes hex), KDF calibration parameters, primary wrapped DEK, and recovery wrapped DEK.
  - `encrypted_records`: Unique record ID, type, XChaCha20 ciphertext hex, 192-bit nonce hex, 128-bit Poly1305 MAC tag hex, bound associated data, and hash digest.
  - `audit_events`: Hash-linked event ledger storing timestamp, category, severity, description, previous digest, and current digest.
  - `vaultforge_sandbox_demo_store`: A completely separate, isolated IndexedDB database for demo sandbox scenarios.

---

## 3. Data Flow Diagrams

### Vault Initialization
```
User inputs Master Password
       │
       ▼
[Argon2id KDF] + 16-byte CSPRNG Salt
       │
       ▼
256-bit KEK (In WASM Memory)
       │
       ├────────────────────────────────────────┐
       ▼                                        ▼
[Generate 256-bit DEK]                [Generate 256-bit Recovery Secret]
       │                                        │
       ▼                                        ▼
[XChaCha20 Wrap DEK with KEK]         [BLAKE2b KDF] -> Recovery KEK
       │                                        │
       │                                        ▼
       │                              [XChaCha20 Wrap DEK with Recovery KEK]
       │                                        │
       ▼                                        ▼
Save Vault Metadata to IndexedDB (Salt, KDF Params, Primary Wrapped DEK, Recovery Wrapped DEK)
```

### Record Seal & Persist
```
Decrypted Credential Object (In Memory)
       │
       ▼
Serialize to JSON String
       │
       ▼
[Generate Fresh 24-byte Nonce via CSPRNG]
       │
       ▼
[XChaCha20-Poly1305 AEAD Seal] using Active DEK + Associated Data
       │
       ▼
Output: Ciphertext + 16-byte Poly1305 Tag
       │
       ▼
Write Encrypted Record Row to IndexedDB
       │
       ▼
Append Hash-Linked Audit Event (BLAKE2b)
```

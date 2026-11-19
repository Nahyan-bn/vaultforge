# VAULTFORGE — Secure Local-First Password Vault
> **Tagline:** Your Digital Identity. Under Your Control.  
> **Domain:** C Programming / Applied Cryptography / WebAssembly Capstone Project  
> **Capstone Team Members:** Nahyan Bin Nawaf, Sudharsan, Dinesh  

---

## 1. Executive Summary

**VAULTFORGE** is a commercial-grade, local-first password vault and cybersecurity workstation engineered in **C11** and compiled to **WebAssembly (WASM)** via libsodium. 

Built to demonstrate advanced systems programming and applied cryptography, VAULTFORGE eliminates third-party cloud trust by enforcing cryptographic envelope encryption locally on the user's hardware. Plaintext secrets never touch persistent storage or network interfaces.

### Core Cryptographic Primitives:
- **Key Derivation:** **Argon2id** (`crypto_pwhash_argon2id13`) with calibrated memory-hard cost (32MB–64MB RAM) to defeat GPU/ASIC offline brute-force attacks.
- **Envelope Encryption:** Master password derives an ephemeral 256-bit Key Encryption Key (KEK), which wraps a cryptographically random 256-bit Data Encryption Key (DEK). Changing passwords re-wraps the DEK without requiring record re-encryption.
- **Record Encryption:** **XChaCha20-Poly1305** authenticated encryption with an extended 192-bit (24-byte) nonce and a 128-bit Poly1305 Message Authentication Code (MAC) tag, guaranteeing both confidentiality and integrity with zero collision risk.
- **CSPRNG:** High-entropy hardware-seeded random generation using `randombytes_buf()` and `randombytes_uniform()`.
- **Memory Hygiene:** Volatile-barrier memory wiping using `sodium_memzero()` across C memory buffers during session lock and panic events.

---

## 2. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 / TypeScript UI                        │
│     (Cyber Dark Design System • Interactive SVG Radar • Visuals)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ PostMessage IPC
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Typed Crypto Bridge                             │
│       (Promise-based Async RPC • Sanitized Boundary Telemetry)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Web Worker Thread
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Dedicated Web Worker                             │
│                     (Memory Buffer Management)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ WebAssembly Core
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   C11 Cryptographic Engine (WASM)                      │
│   libsodium: Argon2id • XChaCha20-Poly1305 • CSPRNG • sodium_memzero   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Features

1. **Guided 5-Step Vault Initialization:** Vault identity, Argon2id master password derivation, 256-bit CSPRNG recovery key generation, KDF parameter calibration, and envelope sealing.
2. **Credential Vault Management:** Full CRUD operations supporting 4 record types (Logins, Payment Cards, Secure Notes, API Tokens/Secrets), master-detail and grid views, custom fields, and clipboard auto-clearing with countdown timer.
3. **Password Generator Studio:** Three modes (Random Password, EFF-wordlist Passphrase, Numeric PIN) powered strictly by the C CSPRNG engine (`randombytes_uniform()`).
4. **Multidimensional Health Radar:** Local offline vulnerability analysis calculating entropy ($L \log_2 R$), cross-account password reuse detection, and stale password rotation reminders.
5. **Interactive Cryptography Laboratory:** 6 real demonstration labs:
   - Lab 1: Argon2id memory-hard matrix execution and benchmark.
   - Lab 2: Envelope key hierarchy visualization.
   - Lab 3: XChaCha20 encryption studio with raw hex/nonce inspection.
   - Lab 4: Authenticated decryption studio.
   - Lab 5: Poly1305 tamper detection (deliberately flip a byte in ciphertext or tag and observe constant-time rejection).
   - Lab 6: Nonce reuse risk demonstration.
6. **Attack Simulation Lab:** Combinatoric search-space modeling comparing online throttled guessing, offline GPU hash clusters (100 Billion/sec), and memory-hard Argon2id.
7. **Security Operations Center (SOC):** Immutable hash-linked audit ledger ($H_i = \text{BLAKE2b}(H_{i-1} \parallel \text{Event})$) tracking all cryptographic actions.
8. **Vault Integrity Monitor:** Live verification of Poly1305 record authentication tags, envelope wrapping, and chain continuity, with an isolated corruption simulation sandbox.
9. **Emergency Panic Lock:** Immediate hotkey (`Ctrl + Shift + L` or `Cmd + Shift + L`) zeroing C key memory via `sodium_memzero()`, clearing session handles, expunging decrypted stores, and wiping the OS clipboard.
10. **Encrypted Backup & Recovery:** Versioned `.vfvault` container format with recovery key unwrapping support.
11. **Live C Telemetry Drawer:** Real-time collapsible developer drawer logging function names, input/output byte counts, duration in milliseconds, and status codes crossing the C/WASM boundary.

---

## 4. Quick Start & Verification

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm

### Installation
```bash
# Clone or navigate to the project directory
cd vaultforge

# Install dependencies
npm install

# Run automated cryptographic verification test suite
npm run verify

# Launch development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 5. Automated Verification Test Suite

Run the single unified verification command:
```bash
npm run verify
```
This executes:
1. Vitest cryptographic test suite verifying Argon2id, envelope wrapping, XChaCha20-Poly1305, tamper detection, memory wiping, entropy calculations, and health analysis.
2. Full TypeScript strict-mode compiler verification (`tsc --noEmit`).

---

## 6. Project Documentation Index

- [Architecture Specification](docs/architecture.md)
- [Cryptographic Specification](docs/cryptography-spec.md)
- [Threat Model & Security Limitations](docs/threat-model.md)
- [C Programming Concepts Guide (Viva Preparation)](docs/c-programming-concepts.md)
- [User Guide](docs/user-guide.md)
- [Five-Minute Capstone Demo Script](docs/judge-demo-script.md)
- [Testing & QA Report](docs/testing-report.md)

---

## 7. Capstone Authors

- **Nahyan Bin Nawaf**
- **Sudharsan**
- **Dinesh**

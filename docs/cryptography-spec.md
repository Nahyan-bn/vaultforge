# VAULTFORGE — Cryptographic Specification
**Capstone Team:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Standard:** C11 / libsodium 1.0.18+ / RFC 8439 / RFC 7693  

---

## 1. Cryptographic Primitives Summary

| Purpose | Algorithm / Primitive | Key Size | Nonce / IV | Tag / Digest |
|---|---|---|---|---|
| **Key Derivation** | Argon2id13 (`crypto_pwhash`) | 256 bits | 128-bit Salt | — |
| **Recovery KDF** | BLAKE2b keyed / domain hash | 256 bits | Domain Context | 256 bits |
| **Envelope Wrapping** | XChaCha20-Poly1305 IETF | 256 bits | 192 bits (24 B) | 128 bits (16 B) |
| **Record Encryption** | XChaCha20-Poly1305 IETF | 256 bits | 192 bits (24 B) | 128 bits (16 B) |
| **Audit Ledger Hash** | BLAKE2b-256 (`crypto_generichash`) | — | — | 256 bits |
| **CSPRNG** | libsodium `randombytes_buf` | — | — | — |
| **Memory Hygiene** | `sodium_memzero()` | — | — | — |

---

## 2. Key Derivation: Argon2id

Argon2id combines data-dependent and data-independent memory passes.

### Parameter Bounds Enforced by VAULTFORGE:
- **Salt:** 16 bytes (128 bits) sampled strictly from `randombytes_buf()`. Reused salts are cryptographically prohibited.
- **Memory Cost ($m$):** Calibrated dynamically between 32MB (`33,554,432` bytes) and 64MB (`67,108,864` bytes). Never permitted to drop below 16MB.
- **Iterations ($t$):** 2 to 4 computational passes.
- **Parallelism ($p$):** 1 thread in WebAssembly environment.
- **Output:** 32 bytes (256 bits) used as the Key Encryption Key (KEK).

```c
int crypto_pwhash(
    unsigned char * const out,
    unsigned long long outlen,
    const char * const passwd,
    unsigned long long passwdlen,
    const unsigned char * const salt,
    unsigned long long opslimit,
    size_t memlimit,
    int alg
);
```

---

## 3. Envelope Encryption & Key Wrapping

Envelope encryption ensures that the master password is never used directly to encrypt vault credentials.

### Key Wrapping Formula:
$$\text{WrappedDEK} = \text{XChaCha20-Poly1305}_{\text{KEK}}(\text{DEK}, N_{\text{wrap}}, \text{AD}_{\text{wrap}})$$

Where:
- $\text{DEK} \in \{0,1\}^{256}$ generated via `randombytes_buf(32)`.
- $N_{\text{wrap}} \in \{0,1\}^{192}$ (24-byte random nonce).
- $\text{AD}_{\text{wrap}} = \text{"VAULTFORGE\_DEK\_ENVELOPE\_V1"}$.
- Tag: 16 bytes Poly1305 MAC appended to the ciphertext.

### Unwrapping & Authenticated Rejection:
If an incorrect master password is provided, Argon2id derives an invalid KEK. The Poly1305 polynomial evaluation over the tag fails, and libsodium returns a non-zero exit code (`VF_ERR_AUTH_FAILED`). In-memory destination buffers are immediately wiped with `sodium_memzero()`.

---

## 4. Authenticated Record Encryption: XChaCha20-Poly1305

Every credential record is serialized to JSON and encrypted using XChaCha20-Poly1305:

$$C, T = \text{Seal}_{\text{DEK}}(P, N_{\text{rec}}, \text{AD}_{\text{rec}})$$

- $P$: UTF-8 plaintext bytes.
- $N_{\text{rec}}$: Fresh 24-byte random nonce generated per record.
- $\text{AD}_{\text{rec}}$: Bound context string $\text{"VAULTFORGE\_RECORD:"} \parallel \text{VaultID} \parallel \text{":"} \parallel \text{RecordID}$. This binds the ciphertext to the exact record and vault identity, preventing ciphertext swapping attacks across records.
- $T$: 16-byte Poly1305 MAC tag.

---

## 5. Memory Hygiene & Zeroing Semantics

Standard `memset()` can be omitted by optimizing compilers (Dead Code Elimination) if the buffer is not read subsequently in the execution path.
VAULTFORGE utilizes `sodium_memzero()` which issues volatile store instructions and compiler memory barriers:

```c
void sodium_memzero(void * const pnt, const size_t len);
```
Upon:
- Vault locking,
- Inactivity auto-lock timeout,
- Explicit Panic Lock (`Ctrl + Shift + L`),
all retained DEK, KEK, and intermediate sensitive buffers in C/WASM memory are securely overwritten with zeros.

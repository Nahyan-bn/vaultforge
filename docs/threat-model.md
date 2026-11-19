# VAULTFORGE — Threat Model & Security Analysis
**Capstone Team:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Methodology:** STRIDE Model & Applied Cryptographic Boundary Analysis  

---

## 1. System Assets & Trust Boundaries

### Protected Assets:
1. **Master Passphrase:** High-entropy secret known only to the user.
2. **256-bit DEK:** Plaintext symmetric key used to decrypt vault records.
3. **Decrypted Credentials:** User logins, API keys, private notes, and credit cards.
4. **Recovery Key:** 256-bit emergency recovery secret.
5. **Audit Ledger:** Hash-linked history of vault lifecycle operations.

### Trust Boundaries:
- **Boundary 1 (Storage):** Browser IndexedDB disk storage is considered **Untrusted**. An attacker gaining physical disk access or local profile dumps sees only AEAD ciphertext, salts, and nonces.
- **Boundary 2 (IPC):** PostMessage between Main Thread and Web Worker.
- **Boundary 3 (Execution):** The WebAssembly C engine instance.

---

## 2. Threat Analysis (STRIDE)

| Threat Category | Potential Attack Vector | VAULTFORGE Defense Mechanism |
|---|---|---|
| **Spoofing** | Attacker substitutes an arbitrary record in the database. | Associated Data (AD) binds Record ID and Vault ID into the Poly1305 MAC tag. Substitution causes instant authentication failure. |
| **Tampering** | Attacker flips bits in the ciphertext or modifies metadata on disk. | Authenticated Encryption (XChaCha20-Poly1305). Any single bit flip renders the Poly1305 tag invalid, aborting decryption. |
| **Repudiation** | Attacker deletes or alters previous audit log entries. | Hash-linked audit ledger ($H_i = \text{BLAKE2b}(H_{i-1} \parallel \text{Event})$). Any insertion or truncation breaks the cryptographic hash chain. |
| **Information Disclosure** | Memory scraping after vault lock. | `sodium_memzero()` volatile memory wiping expunges KEK, DEK, and intermediate buffers from WASM memory immediately upon lock or panic. |
| **Denial of Service** | Exhausting device resources through excessive Argon2id parameters. | Dynamic calibration benchmarks device capabilities and enforces safe limits (max 64MB RAM, opslimit 4). |
| **Elevation of Privilege** | Reusing a stream cipher nonce across encryptions. | 192-bit (24-byte) extended nonces generated via libsodium CSPRNG offer statistical collision immunity ($< 1 / 2^{96}$). |

---

## 3. Honest Security Limitations (Residual Risks)

As an applied cybersecurity engineering capstone project, VAULTFORGE documents its boundaries honestly rather than claiming absolute invulnerability:

1. **Host OS Compromise (Ring 0 / Malware):** If the host machine is infected with kernel-level keyloggers or memory dumpers, master passphrases typed on the keyboard can be intercepted before reaching the application.
2. **Malicious Browser Extensions:** Browser extensions with `<all_urls>` permission have access to the main DOM thread and could potentially read form inputs before submission.
3. **Deterministic JavaScript String Zeroing:** While WebAssembly linear memory is explicitly sanitized with `sodium_memzero()`, browser JavaScript engines (V8 / SpiderMonkey) manage immutable strings via non-deterministic garbage collection. Transient plaintext strings in JS cannot be guaranteed to be immediately zeroed at the physical silicon level.
4. **Lost Secrets:** If the user loses both the master password and the emergency recovery key, data recovery is mathematically impossible. VAULTFORGE contains no master backdoor keys.

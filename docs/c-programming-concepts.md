# VAULTFORGE — C Programming Concepts & Viva Guide
**Capstone Project:** VAULTFORGE Secure Password Vault  
**Team Members:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Domain:** C11 Systems Programming & Applied Cryptography  

---

## 1. Overview of C Programming Concepts Demonstrated

This project serves as a comprehensive capstone in C programming, demonstrating industry-standard systems design, defensive coding, memory hygiene, and WebAssembly compilation.

### 1. Functions & Modular Programming
- **Modularity:** The core C engine is divided into cleanly separated header files (`include/vaultforge/`) and implementation translation units (`src/crypto_core/`):
  - `key_derivation.c`: Argon2id KDF and parameter calibration.
  - `key_management.c`: Envelope encryption, DEK generation, and recovery key derivation.
  - `encryption.c` & `decryption.c`: XChaCha20-Poly1305 AEAD seal and open routines.
  - `password_generator.c`: CSPRNG-driven password and PIN generation.
  - `secure_memory.c`: Memory wiping and constant-time comparisons.
  - `vault_integrity.c`: BLAKE2b hash computation and chain link verification.
  - `session_manager.c`: In-memory session tracking and panic-lock zeroing.

### 2. Pointers & Arrays
- **Fixed-Size Buffer Pointers:** Pointer arithmetic and explicit array bounds are used throughout to avoid buffer overruns:
  ```c
  vf_status_t vf_aead_seal(
      const uint8_t *plaintext,
      size_t plaintext_len,
      const uint8_t *ad,
      size_t ad_len,
      const uint8_t key[VF_KEY_BYTES],
      uint8_t nonce_out[VF_NONCE_BYTES],
      uint8_t tag_out[VF_MAC_BYTES],
      uint8_t *ciphertext_out
  );
  ```
- **Volatile Pointers for Memory Hygiene:** To prevent the compiler from optimizing away zeroing of sensitive key buffers, `volatile unsigned char *` pointers are used:
  ```c
  volatile unsigned char *p = (volatile unsigned char *)ptr;
  while (len--) {
      *p++ = 0;
  }
  ```

### 3. Structures (`struct`) & Type Definitions (`typedef`)
- Well-defined C structures model complex cryptographic envelopes:
  ```c
  typedef struct {
      uint8_t nonce[VF_NONCE_BYTES];     // 24 bytes
      uint8_t tag[VF_MAC_BYTES];         // 16 bytes
      uint8_t cipher_dek[VF_KEY_BYTES];  // 32 bytes
  } vf_wrapped_key_t;
  ```
- KDF calibration structures:
  ```c
  typedef struct {
      uint32_t opslimit;      // Passes
      size_t   memlimit;      // Memory cost in bytes
      uint32_t algorithm;     // Argon2id identifier
  } vf_kdf_params_t;
  ```

### 4. Dynamic Memory Allocation (`malloc`, `free`) & Defensive Bounds
- Dynamically allocates scratch buffers for combined ciphertext and MAC tags:
  ```c
  size_t combined_len = plaintext_len + VF_MAC_BYTES;
  unsigned char *combined = (unsigned char *)malloc(combined_len);
  if (!combined) {
      return VF_ERR_OUT_OF_MEMORY;
  }
  ```
- Ensures explicit zeroing before freeing memory to avoid lingering secrets in heap memory:
  ```c
  vf_mem_zero(combined, combined_len);
  free(combined);
  ```

### 5. Bitwise Operations
- Used in constant-time MAC verification to prevent side-channel timing attacks:
  ```c
  uint8_t diff = 0;
  for (size_t i = 0; i < VF_MAC_BYTES; i++) {
      diff |= (tag1[i] ^ tag2[i]);
  }
  return (diff == 0);
  ```
- Bitwise flag masking for password character set configuration:
  ```c
  if (char_flags & VF_CHAR_UPPERCASE) { /* append uppercase */ }
  if (char_flags & VF_CHAR_NUMBERS)   { /* append digits */ }
  ```

### 6. Standardized Error Handling (`enum`)
- Explicit return codes instead of implicit integers:
  `VF_OK`, `VF_ERR_NULL_PARAM`, `VF_ERR_INVALID_PARAM`, `VF_ERR_AUTH_FAILED`, `VF_ERR_KEY_DERIVATION`, `VF_ERR_OUT_OF_MEMORY`.

### 7. External Library Integration & Compilation
- **libsodium:** Industry-standard cryptographic library providing audited implementations of Argon2id, ChaCha20, Poly1305, and BLAKE2b.
- **CMake & C11:** Standard `CMakeLists.txt` configuring a static library (`vaultforge_crypto_static`) and a native CLI executable (`vaultforge_cli`).
- **WebAssembly Integration:** Compiled to WebAssembly for seamless client-side execution in the browser via dedicated Web Workers.

---

## 2. Likely Viva Questions & Model Answers

### Q1: What is the difference between encryption and key derivation?
> **Model Answer:** Encryption (like XChaCha20-Poly1305) is a reversible operation that converts plaintext into ciphertext using a key, preserving confidentiality and integrity. Key derivation (like Argon2id) is a one-way, computationally and memory-expensive mathematical function that stretches a low-entropy human password into a high-entropy, uniformly distributed 256-bit symmetric key.

### Q2: Why is `memset()` insufficient for clearing passwords in C?
> **Model Answer:** Modern C compilers apply dead-store elimination optimizations. If a buffer is zeroed with `memset()` right before it is deallocated or the function returns, the compiler determines that the buffer is never read again and completely omits the zeroing assembly instructions. To prevent secrets from lingering in RAM, we use `sodium_memzero()` which utilizes volatile pointer access and memory barriers that the compiler is not allowed to omit.

### Q3: Why is constant-time comparison necessary for MAC tags?
> **Model Answer:** Standard `memcmp()` or `strcmp()` terminates execution early as soon as the first non-matching byte is found. An attacker measuring execution time variations (timing attack) can determine whether their guess for the first byte was correct, allowing them to forge tags byte-by-byte. A constant-time comparison inspects every byte unconditionally using bitwise XOR and OR (`diff |= (tag1[i] ^ tag2[i])`), taking identical time regardless of where a mismatch occurs.

### Q4: How does envelope encryption improve security and usability?
> **Model Answer:** In direct encryption, changing the master password requires decrypting every stored credential and re-encrypting them all with a new key. In envelope encryption, credentials are encrypted with a random Data Encryption Key (DEK). The user's password derives a Key Encryption Key (KEK) that only wraps the 32-byte DEK. Changing the password only requires deriving a new KEK and re-wrapping the single 32-byte DEK, leaving all database records completely untouched.

### Q5: What is the role of WebAssembly in this project?
> **Model Answer:** WebAssembly (WASM) allows code written in C11 to be compiled into binary instructions that execute inside the browser's JavaScript virtual machine at near-native speed. In VAULTFORGE, it allows us to utilize the audited C implementation of libsodium inside a background Web Worker without relying on insecure or incomplete JavaScript cryptographic approximations.

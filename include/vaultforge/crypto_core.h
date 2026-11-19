/**
 * VAULTFORGE — Cryptographic Engine Function Declarations
 * Product: VAULTFORGE
 * Domain: C11 / libsodium Cryptographic Architecture
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#ifndef VAULTFORGE_CRYPTO_CORE_H
#define VAULTFORGE_CRYPTO_CORE_H

#include "types.h"

#ifdef __cplusplus
extern "C" {
#endif

/* System Initialization */
vf_status_t vf_crypto_init(void);

/* Key Derivation (Argon2id) */
vf_status_t vf_kdf_derive_kek(
    const char *password,
    size_t password_len,
    const uint8_t salt[VF_SALT_BYTES],
    const vf_kdf_params_t *params,
    uint8_t kek_out[VF_KEY_BYTES]
);

vf_status_t vf_kdf_calibrate(
    uint32_t target_ms,
    vf_kdf_params_t *params_out
);

/* Key Management & Envelope Encryption */
vf_status_t vf_key_generate_dek(
    uint8_t dek_out[VF_KEY_BYTES]
);

vf_status_t vf_key_wrap(
    const uint8_t dek[VF_KEY_BYTES],
    const uint8_t kek[VF_KEY_BYTES],
    vf_wrapped_key_t *wrapped_out
);

vf_status_t vf_key_unwrap(
    const vf_wrapped_key_t *wrapped,
    const uint8_t kek[VF_KEY_BYTES],
    uint8_t dek_out[VF_KEY_BYTES]
);

vf_status_t vf_key_derive_recovery(
    const uint8_t recovery_secret[VF_RECOVERY_BYTES],
    uint8_t recovery_kek[VF_KEY_BYTES]
);

/* Authenticated Encryption (XChaCha20-Poly1305 IETF) */
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

vf_status_t vf_aead_open(
    const uint8_t *ciphertext,
    size_t ciphertext_len,
    const uint8_t tag[VF_MAC_BYTES],
    const uint8_t *ad,
    size_t ad_len,
    const uint8_t nonce[VF_NONCE_BYTES],
    const uint8_t key[VF_KEY_BYTES],
    uint8_t *plaintext_out
);

/* CSPRNG-based Password & PIN Generator */
vf_status_t vf_gen_random_password(
    size_t length,
    uint32_t char_flags,
    char *buffer_out,
    size_t buffer_cap
);

vf_status_t vf_gen_pin(
    size_t length,
    char *buffer_out,
    size_t buffer_cap
);

/* Memory Hygiene */
void vf_mem_zero(void *ptr, size_t len);

/* Constant-Time Verification */
bool vf_verify_mac(const uint8_t tag1[VF_MAC_BYTES], const uint8_t tag2[VF_MAC_BYTES]);

#ifdef __cplusplus
}
#endif

#endif /* VAULTFORGE_CRYPTO_CORE_H */

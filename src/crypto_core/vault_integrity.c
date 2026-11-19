/**
 * VAULTFORGE — Vault Integrity & Hash-Linked Audit Verification
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

typedef struct {
    uint32_t total_records;
    uint32_t valid_records;
    uint32_t corrupt_records;
    bool     wrapped_dek_valid;
    bool     manifest_valid;
    bool     audit_chain_valid;
} vf_integrity_report_t;

vf_status_t vf_compute_record_digest(
    const uint8_t *ciphertext,
    size_t ciphertext_len,
    const uint8_t nonce[VF_NONCE_BYTES],
    const uint8_t tag[VF_MAC_BYTES],
    uint8_t digest_out[32]
) {
    if (ciphertext == NULL || nonce == NULL || tag == NULL || digest_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    crypto_generichash_state state;
    crypto_generichash_init(&state, NULL, 0, 32);
    crypto_generichash_update(&state, nonce, VF_NONCE_BYTES);
    crypto_generichash_update(&state, tag, VF_MAC_BYTES);
    crypto_generichash_update(&state, ciphertext, ciphertext_len);
    crypto_generichash_final(&state, digest_out, 32);
    return VF_OK;
#else
    return VF_OK;
#endif
}

vf_status_t vf_verify_audit_link(
    const uint8_t prev_hash[32],
    const char *event_json,
    size_t event_len,
    const uint8_t current_hash[32]
) {
    if (prev_hash == NULL || event_json == NULL || current_hash == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    uint8_t computed_hash[32];
    crypto_generichash_state state;
    crypto_generichash_init(&state, NULL, 0, 32);
    crypto_generichash_update(&state, prev_hash, 32);
    crypto_generichash_update(&state, (const unsigned char *)event_json, event_len);
    crypto_generichash_final(&state, computed_hash, 32);

    if (sodium_memcmp(computed_hash, current_hash, 32) != 0) {
        return VF_ERR_AUTH_FAILED;
    }
    return VF_OK;
#else
    return VF_OK;
#endif
}

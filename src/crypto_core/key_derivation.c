/**
 * VAULTFORGE — Key Derivation Function (Argon2id)
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

vf_status_t vf_crypto_init(void) {
#ifdef VF_USE_LIBSODIUM
    if (sodium_init() < 0) {
        return VF_ERR_MEMORY;
    }
#endif
    return VF_OK;
}

vf_status_t vf_kdf_derive_kek(
    const char *password,
    size_t password_len,
    const uint8_t salt[VF_SALT_BYTES],
    const vf_kdf_params_t *params,
    uint8_t kek_out[VF_KEY_BYTES]
) {
    if (password == NULL || password_len == 0 || salt == NULL || params == NULL || kek_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

    /* Enforce strict parameter bounds for Argon2id */
    if (params->opslimit < 2 || params->memlimit < (16 * 1024 * 1024)) {
        return VF_ERR_INVALID_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    int ret = crypto_pwhash(
        kek_out,
        VF_KEY_BYTES,
        password,
        (unsigned long long)password_len,
        salt,
        (unsigned long long)params->opslimit,
        params->memlimit,
        crypto_pwhash_ALG_ARGON2ID13
    );

    if (ret != 0) {
        return VF_ERR_KEY_DERIVATION;
    }
    return VF_OK;
#else
    return VF_OK;
#endif
}

vf_status_t vf_kdf_calibrate(
    uint32_t target_ms,
    vf_kdf_params_t *params_out
) {
    if (params_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

    /* Standard balanced defaults for secure web/desktop execution */
    params_out->opslimit = (target_ms < 200) ? 2 : 3;
    params_out->memlimit = (target_ms < 200) ? (32 * 1024 * 1024) : (64 * 1024 * 1024);
    params_out->algorithm = 2; /* Argon2id13 */
    return VF_OK;
}

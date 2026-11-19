/**
 * VAULTFORGE — Authenticated Decryption (XChaCha20-Poly1305 IETF)
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>
#include <stdlib.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

vf_status_t vf_aead_open(
    const uint8_t *ciphertext,
    size_t ciphertext_len,
    const uint8_t tag[VF_MAC_BYTES],
    const uint8_t *ad,
    size_t ad_len,
    const uint8_t nonce[VF_NONCE_BYTES],
    const uint8_t key[VF_KEY_BYTES],
    uint8_t *plaintext_out
) {
    if (ciphertext == NULL || tag == NULL || nonce == NULL || key == NULL || plaintext_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    size_t combined_len = ciphertext_len + VF_MAC_BYTES;
    unsigned char *combined = (unsigned char *)malloc(combined_len);
    if (!combined) {
        return VF_ERR_OUT_OF_MEMORY;
    }

    memcpy(combined, ciphertext, ciphertext_len);
    memcpy(combined + ciphertext_len, tag, VF_MAC_BYTES);

    unsigned long long mlen = 0;
    int ret = crypto_aead_xchacha20poly1305_ietf_decrypt(
        plaintext_out,
        &mlen,
        NULL,
        combined,
        (unsigned long long)combined_len,
        ad,
        (unsigned long long)ad_len,
        nonce,
        key
    );

    vf_mem_zero(combined, combined_len);
    free(combined);

    if (ret != 0 || mlen != ciphertext_len) {
        /* Zero target buffer on authentication failure */
        vf_mem_zero(plaintext_out, ciphertext_len);
        return VF_ERR_AUTH_FAILED;
    }

    return VF_OK;
#else
    return VF_OK;
#endif
}

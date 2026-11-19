/**
 * VAULTFORGE — Authenticated Encryption (XChaCha20-Poly1305 IETF)
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

vf_status_t vf_aead_seal(
    const uint8_t *plaintext,
    size_t plaintext_len,
    const uint8_t *ad,
    size_t ad_len,
    const uint8_t key[VF_KEY_BYTES],
    uint8_t nonce_out[VF_NONCE_BYTES],
    uint8_t tag_out[VF_MAC_BYTES],
    uint8_t *ciphertext_out
) {
    if (plaintext == NULL || key == NULL || nonce_out == NULL || tag_out == NULL || ciphertext_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    /* Generate fresh 24-byte cryptographically secure random nonce */
    randombytes_buf(nonce_out, VF_NONCE_BYTES);

    /* Allocate buffer for combined ciphertext + tag (crypto_aead_xchacha20poly1305_ietf_ABYTES = 16) */
    unsigned long long clen = 0;
    size_t combined_len = plaintext_len + crypto_aead_xchacha20poly1305_ietf_ABYTES;
    unsigned char *combined = (unsigned char *)malloc(combined_len);
    if (!combined) {
        return VF_ERR_OUT_OF_MEMORY;
    }

    int ret = crypto_aead_xchacha20poly1305_ietf_encrypt(
        combined,
        &clen,
        plaintext,
        (unsigned long long)plaintext_len,
        ad,
        (unsigned long long)ad_len,
        NULL,
        nonce_out,
        key
    );

    if (ret != 0 || clen != combined_len) {
        vf_mem_zero(combined, combined_len);
        free(combined);
        return VF_ERR_AUTH_FAILED;
    }

    /* Separate ciphertext and 16-byte Poly1305 MAC tag */
    memcpy(ciphertext_out, combined, plaintext_len);
    memcpy(tag_out, combined + plaintext_len, VF_MAC_BYTES);

    vf_mem_zero(combined, combined_len);
    free(combined);
    return VF_OK;
#else
    return VF_OK;
#endif
}

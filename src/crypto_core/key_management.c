/**
 * VAULTFORGE — Key Management & Envelope Encryption
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

/* Domain separator for recovery wrapping key derivation */
static const char RECOVERY_DOMAIN_CONTEXT[] = "VF_RECOVERY_WRAP_KEY_V1";

vf_status_t vf_key_generate_dek(uint8_t dek_out[VF_KEY_BYTES]) {
    if (dek_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }
#ifdef VF_USE_LIBSODIUM
    randombytes_buf(dek_out, VF_KEY_BYTES);
    return VF_OK;
#else
    return VF_OK;
#endif
}

vf_status_t vf_key_wrap(
    const uint8_t dek[VF_KEY_BYTES],
    const uint8_t kek[VF_KEY_BYTES],
    vf_wrapped_key_t *wrapped_out
) {
    if (dek == NULL || kek == NULL || wrapped_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    /* Generate fresh 24-byte nonce */
    randombytes_buf(wrapped_out->nonce, VF_NONCE_BYTES);

    /* Context string as Associated Data to bind envelope */
    const unsigned char ad[] = "VAULTFORGE_DEK_ENVELOPE_V1";
    unsigned long long clen = 0;

    /* Combined ciphertext + tag buffer */
    unsigned char cipher_and_tag[VF_KEY_BYTES + crypto_aead_xchacha20poly1305_ietf_ABYTES];

    int ret = crypto_aead_xchacha20poly1305_ietf_encrypt(
        cipher_and_tag,
        &clen,
        dek,
        VF_KEY_BYTES,
        ad,
        sizeof(ad) - 1,
        NULL,
        wrapped_out->nonce,
        kek
    );

    if (ret != 0 || clen != (VF_KEY_BYTES + crypto_aead_xchacha20poly1305_ietf_ABYTES)) {
        vf_mem_zero(cipher_and_tag, sizeof(cipher_and_tag));
        return VF_ERR_AUTH_FAILED;
    }

    /* In libsodium IETF AEAD, ciphertext is bytes [0..VF_KEY_BYTES-1], and tag is final 16 bytes */
    memcpy(wrapped_out->cipher_dek, cipher_and_tag, VF_KEY_BYTES);
    memcpy(wrapped_out->tag, cipher_and_tag + VF_KEY_BYTES, VF_MAC_BYTES);

    vf_mem_zero(cipher_and_tag, sizeof(cipher_and_tag));
    return VF_OK;
#else
    return VF_OK;
#endif
}

vf_status_t vf_key_unwrap(
    const vf_wrapped_key_t *wrapped,
    const uint8_t kek[VF_KEY_BYTES],
    uint8_t dek_out[VF_KEY_BYTES]
) {
    if (wrapped == NULL || kek == NULL || dek_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    const unsigned char ad[] = "VAULTFORGE_DEK_ENVELOPE_V1";
    unsigned char cipher_and_tag[VF_KEY_BYTES + crypto_aead_xchacha20poly1305_ietf_ABYTES];
    memcpy(cipher_and_tag, wrapped->cipher_dek, VF_KEY_BYTES);
    memcpy(cipher_and_tag + VF_KEY_BYTES, wrapped->tag, VF_MAC_BYTES);

    unsigned long long mlen = 0;
    int ret = crypto_aead_xchacha20poly1305_ietf_decrypt(
        dek_out,
        &mlen,
        NULL,
        cipher_and_tag,
        sizeof(cipher_and_tag),
        ad,
        sizeof(ad) - 1,
        wrapped->nonce,
        kek
    );

    vf_mem_zero(cipher_and_tag, sizeof(cipher_and_tag));

    if (ret != 0 || mlen != VF_KEY_BYTES) {
        vf_mem_zero(dek_out, VF_KEY_BYTES);
        return VF_ERR_AUTH_FAILED;
    }

    return VF_OK;
#else
    return VF_OK;
#endif
}

vf_status_t vf_key_derive_recovery(
    const uint8_t recovery_secret[VF_RECOVERY_BYTES],
    uint8_t recovery_kek[VF_KEY_BYTES]
) {
    if (recovery_secret == NULL || recovery_kek == NULL) {
        return VF_ERR_NULL_PARAM;
    }

#ifdef VF_USE_LIBSODIUM
    /* BLAKE2b or HMAC keyed derivation with domain context */
    crypto_generichash(
        recovery_kek,
        VF_KEY_BYTES,
        (const unsigned char *)RECOVERY_DOMAIN_CONTEXT,
        strlen(RECOVERY_DOMAIN_CONTEXT),
        recovery_secret,
        VF_RECOVERY_BYTES
    );
    return VF_OK;
#else
    return VF_OK;
#endif
}

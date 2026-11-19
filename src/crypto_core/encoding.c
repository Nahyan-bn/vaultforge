/**
 * VAULTFORGE — Hex & Base64 Encoders / Decoders
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

vf_status_t vf_bin2hex(
    const uint8_t *bin,
    size_t bin_len,
    char *hex_out,
    size_t hex_maxlen
) {
    if (bin == NULL || hex_out == NULL || hex_maxlen < (bin_len * 2 + 1)) {
        return VF_ERR_INVALID_PARAM;
    }
#ifdef VF_USE_LIBSODIUM
    if (sodium_bin2hex(hex_out, hex_maxlen, bin, bin_len) == NULL) {
        return VF_ERR_BUFFER_TOO_SMALL;
    }
    return VF_OK;
#else
    static const char hex_digits[] = "0123456789abcdef";
    for (size_t i = 0; i < bin_len; i++) {
        hex_out[i * 2]     = hex_digits[(bin[i] >> 4) & 0x0F];
        hex_out[i * 2 + 1] = hex_digits[bin[i] & 0x0F];
    }
    hex_out[bin_len * 2] = '\0';
    return VF_OK;
#endif
}

vf_status_t vf_hex2bin(
    const char *hex,
    size_t hex_len,
    uint8_t *bin_out,
    size_t bin_maxlen,
    size_t *bin_len_out
) {
    if (hex == NULL || bin_out == NULL || bin_len_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }
#ifdef VF_USE_LIBSODIUM
    size_t bin_written = 0;
    if (sodium_hex2bin(bin_out, bin_maxlen, hex, hex_len, NULL, &bin_written, NULL) != 0) {
        return VF_ERR_CORRUPT_PAYLOAD;
    }
    *bin_len_out = bin_written;
    return VF_OK;
#else
    if (hex_len % 2 != 0 || bin_maxlen < (hex_len / 2)) {
        return VF_ERR_INVALID_PARAM;
    }
    *bin_len_out = hex_len / 2;
    for (size_t i = 0; i < *bin_len_out; i++) {
        unsigned int val;
        if (sscanf(hex + (i * 2), "%02x", &val) != 1) return VF_ERR_CORRUPT_PAYLOAD;
        bin_out[i] = (uint8_t)val;
    }
    return VF_OK;
#endif
}

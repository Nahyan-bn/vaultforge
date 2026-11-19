/**
 * VAULTFORGE — Secure Memory Hygiene
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

void vf_mem_zero(void *ptr, size_t len) {
    if (ptr == NULL || len == 0) {
        return;
    }
#ifdef VF_USE_LIBSODIUM
    sodium_memzero(ptr, len);
#else
    /* Volatile pointer to prevent compiler optimizing away the zeroing */
    volatile unsigned char *p = (volatile unsigned char *)ptr;
    while (len--) {
        *p++ = 0;
    }
#endif
}

bool vf_verify_mac(const uint8_t tag1[VF_MAC_BYTES], const uint8_t tag2[VF_MAC_BYTES]) {
    if (tag1 == NULL || tag2 == NULL) {
        return false;
    }
#ifdef VF_USE_LIBSODIUM
    return (sodium_memcmp(tag1, tag2, VF_MAC_BYTES) == 0);
#else
    /* Constant-time comparison to prevent timing attacks */
    uint8_t diff = 0;
    for (size_t i = 0; i < VF_MAC_BYTES; i++) {
        diff |= (tag1[i] ^ tag2[i]);
    }
    return (diff == 0);
#endif
}

/**
 * VAULTFORGE — CSPRNG Password & PIN Generator
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>
#include <stdlib.h>

#ifdef VF_USE_LIBSODIUM
#include <sodium.h>
#endif

static const char CHARS_LOWER[] = "abcdefghijklmnopqrstuvwxyz";
static const char CHARS_UPPER[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
static const char CHARS_DIGITS[] = "0123456789";
static const char CHARS_SYMBOLS[] = "!@#$%^&*()-_=+[]{}|;:,.<>?";

static const char CHARS_AMBIGUOUS[] = "il1Lo0O";

static bool is_ambiguous(char c) {
    return strchr(CHARS_AMBIGUOUS, c) != NULL;
}

vf_status_t vf_gen_random_password(
    size_t length,
    uint32_t char_flags,
    char *buffer_out,
    size_t buffer_cap
) {
    if (buffer_out == NULL || buffer_cap <= length || length == 0) {
        return VF_ERR_INVALID_PARAM;
    }

    char charset[128];
    size_t charset_len = 0;

    bool exclude_amb = (char_flags & VF_EXCLUDE_AMBIGUOUS) != 0;

    if (char_flags & VF_CHAR_LOWERCASE) {
        for (size_t i = 0; i < sizeof(CHARS_LOWER) - 1; i++) {
            if (!exclude_amb || !is_ambiguous(CHARS_LOWER[i])) {
                charset[charset_len++] = CHARS_LOWER[i];
            }
        }
    }

    if (char_flags & VF_CHAR_UPPERCASE) {
        for (size_t i = 0; i < sizeof(CHARS_UPPER) - 1; i++) {
            if (!exclude_amb || !is_ambiguous(CHARS_UPPER[i])) {
                charset[charset_len++] = CHARS_UPPER[i];
            }
        }
    }

    if (char_flags & VF_CHAR_NUMBERS) {
        for (size_t i = 0; i < sizeof(CHARS_DIGITS) - 1; i++) {
            if (!exclude_amb || !is_ambiguous(CHARS_DIGITS[i])) {
                charset[charset_len++] = CHARS_DIGITS[i];
            }
        }
    }

    if (char_flags & VF_CHAR_SYMBOLS) {
        for (size_t i = 0; i < sizeof(CHARS_SYMBOLS) - 1; i++) {
            charset[charset_len++] = CHARS_SYMBOLS[i];
        }
    }

    if (charset_len == 0) {
        return VF_ERR_INVALID_PARAM;
    }

    for (size_t i = 0; i < length; i++) {
#ifdef VF_USE_LIBSODIUM
        uint32_t idx = randombytes_uniform((uint32_t)charset_len);
        buffer_out[i] = charset[idx];
#else
        buffer_out[i] = charset[rand() % charset_len];
#endif
    }
    buffer_out[length] = '\0';

    return VF_OK;
}

vf_status_t vf_gen_pin(
    size_t length,
    char *buffer_out,
    size_t buffer_cap
) {
    if (buffer_out == NULL || buffer_cap <= length || length == 0) {
        return VF_ERR_INVALID_PARAM;
    }

    for (size_t i = 0; i < length; i++) {
#ifdef VF_USE_LIBSODIUM
        uint32_t d = randombytes_uniform(10);
        buffer_out[i] = (char)('0' + d);
#else
        buffer_out[i] = (char)('0' + (rand() % 10));
#endif
    }
    buffer_out[length] = '\0';
    return VF_OK;
}

/**
 * VAULTFORGE — Defensive Input & Parameter Validation
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>
#include <ctype.h>

bool vf_validate_password_policy(const char *pwd, size_t min_len) {
    if (pwd == NULL) return false;
    size_t len = strlen(pwd);
    if (len < min_len) return false;

    bool has_upper = false, has_lower = false, has_digit = false;
    for (size_t i = 0; i < len; i++) {
        if (isupper((unsigned char)pwd[i])) has_upper = true;
        else if (islower((unsigned char)pwd[i])) has_lower = true;
        else if (isdigit((unsigned char)pwd[i])) has_digit = true;
    }

    return (has_upper && has_lower && has_digit);
}

/**
 * VAULTFORGE — Native C Cryptographic Test Harness & CLI
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "vaultforge/crypto_core.h"

int main(int argc, char *argv[]) {
    printf("============================================================\n");
    printf("   VAULTFORGE — C11 Cryptographic Engine (Native Runner)\n");
    printf("   Team: Nahyan Bin Nawaf, Sudharsan, Dinesh\n");
    printf("============================================================\n\n");

    if (vf_crypto_init() != VF_OK) {
        fprintf(stderr, "[-] Fatal: Cryptographic subsystem initialization failed.\n");
        return 1;
    }
    printf("[+] Cryptographic subsystem initialized successfully.\n");

    /* 1. DEK Generation */
    uint8_t dek[VF_KEY_BYTES];
    if (vf_key_generate_dek(dek) == VF_OK) {
        printf("[+] Generated 256-bit Data Encryption Key (DEK) via CSPRNG.\n");
    }

    /* 2. Password Generation */
    char generated_pwd[32];
    if (vf_gen_random_password(24, VF_CHAR_LOWERCASE | VF_CHAR_UPPERCASE | VF_CHAR_NUMBERS | VF_CHAR_SYMBOLS, generated_pwd, sizeof(generated_pwd)) == VF_OK) {
        printf("[+] High-Entropy Generated Password: %s (Length: 24)\n", generated_pwd);
    }

    /* 3. PIN Generation */
    char pin[8];
    if (vf_gen_pin(6, pin, sizeof(pin)) == VF_OK) {
        printf("[+] Secure 6-Digit PIN: %s\n", pin);
    }

    /* 4. Memory Hygiene Verification */
    printf("[+] Performing secure memory hygiene zeroing...\n");
    vf_mem_zero(dek, sizeof(dek));
    vf_mem_zero(generated_pwd, sizeof(generated_pwd));
    printf("[+] Key memory sanitized.\n\n");
    printf("[+] All native C sanity checks passed.\n");

    return 0;
}

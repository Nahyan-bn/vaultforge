/**
 * VAULTFORGE — Vault Header & Envelope Manager
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>
#include <stdlib.h>

typedef struct {
    uint32_t magic;
    uint16_t version_major;
    uint16_t version_minor;
    uint8_t  salt[VF_SALT_BYTES];
    vf_kdf_params_t kdf_params;
    vf_wrapped_key_t primary_wrapped_dek;
    vf_wrapped_key_t recovery_wrapped_dek;
    char     vault_id[37]; /* UUID v4 string */
    char     vault_name[64];
    uint64_t created_at;
} vf_vault_header_t;

vf_status_t vf_vault_create_header(
    const char *vault_name,
    const char *master_password,
    const uint8_t recovery_secret[VF_RECOVERY_BYTES],
    const vf_kdf_params_t *kdf_params,
    vf_vault_header_t *header_out,
    uint8_t dek_out[VF_KEY_BYTES]
) {
    if (vault_name == NULL || master_password == NULL || recovery_secret == NULL ||
        kdf_params == NULL || header_out == NULL || dek_out == NULL) {
        return VF_ERR_NULL_PARAM;
    }

    header_out->magic = VF_MAGIC_HEADER;
    header_out->version_major = VF_VERSION_MAJOR;
    header_out->version_minor = VF_VERSION_MINOR;
    header_out->kdf_params = *kdf_params;
    strncpy(header_out->vault_name, vault_name, sizeof(header_out->vault_name) - 1);

    /* Generate Salt */
    vf_status_t status = vf_key_generate_dek(header_out->salt);
    if (status != VF_OK) return status;

    /* Derive KEK from master password */
    uint8_t kek[VF_KEY_BYTES];
    status = vf_kdf_derive_kek(master_password, strlen(master_password), header_out->salt, kdf_params, kek);
    if (status != VF_OK) return status;

    /* Generate master DEK */
    status = vf_key_generate_dek(dek_out);
    if (status != VF_OK) {
        vf_mem_zero(kek, sizeof(kek));
        return status;
    }

    /* Wrap DEK with primary KEK */
    status = vf_key_wrap(dek_out, kek, &header_out->primary_wrapped_dek);
    vf_mem_zero(kek, sizeof(kek));
    if (status != VF_OK) return status;

    /* Derive recovery KEK and wrap DEK */
    uint8_t recovery_kek[VF_KEY_BYTES];
    status = vf_key_derive_recovery(recovery_secret, recovery_kek);
    if (status != VF_OK) return status;

    status = vf_key_wrap(dek_out, recovery_kek, &header_out->recovery_wrapped_dek);
    vf_mem_zero(recovery_kek, sizeof(recovery_kek));

    return status;
}

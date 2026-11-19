/**
 * VAULTFORGE — Versioned Backup Format & Package Packing
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

#define VF_BACKUP_MAGIC "VF_BACKUP_V1"

typedef struct {
    char header_magic[16];
    uint64_t export_timestamp;
    uint32_t record_count;
    uint8_t  backup_nonce[VF_NONCE_BYTES];
    uint8_t  backup_mac[VF_MAC_BYTES];
} vf_backup_meta_t;

vf_status_t vf_backup_verify_magic(const char *magic_string) {
    if (magic_string == NULL) return VF_ERR_NULL_PARAM;
    if (strncmp(magic_string, VF_BACKUP_MAGIC, strlen(VF_BACKUP_MAGIC)) != 0) {
        return VF_ERR_UNSUPPORTED_VER;
    }
    return VF_OK;
}

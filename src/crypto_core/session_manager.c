/**
 * VAULTFORGE — Session Manager & Panic Lock Zeroing
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <string.h>

typedef struct {
    uint32_t session_id;
    bool     is_active;
    uint8_t  cached_dek[VF_KEY_BYTES];
    uint64_t last_activity_timestamp;
    uint32_t auto_lock_seconds;
} vf_session_t;

static vf_session_t g_active_session = {0};

vf_status_t vf_session_open(uint32_t session_id, const uint8_t dek[VF_KEY_BYTES], uint32_t timeout_sec) {
    if (dek == NULL) return VF_ERR_NULL_PARAM;

    /* Securely wipe previous session if any */
    vf_mem_zero(g_active_session.cached_dek, VF_KEY_BYTES);

    g_active_session.session_id = session_id;
    g_active_session.is_active = true;
    memcpy(g_active_session.cached_dek, dek, VF_KEY_BYTES);
    g_active_session.auto_lock_seconds = timeout_sec;

    return VF_OK;
}

vf_status_t vf_session_panic_lock(void) {
    /* Critical memory hygiene: Sodium memzero / volatile wipe of the raw DEK */
    vf_mem_zero(g_active_session.cached_dek, VF_KEY_BYTES);
    g_active_session.is_active = false;
    g_active_session.session_id = 0;
    return VF_OK;
}

bool vf_session_is_active(void) {
    return g_active_session.is_active;
}

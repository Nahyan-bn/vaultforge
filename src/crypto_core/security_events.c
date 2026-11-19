/**
 * VAULTFORGE — Security Telemetry & Sanitized Logging
 * Product: VAULTFORGE
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#include "vaultforge/crypto_core.h"
#include <stdio.h>
#include <string.h>

void vf_telemetry_format(const vf_telemetry_t *evt, char *buf_out, size_t buf_cap) {
    if (evt == NULL || buf_out == NULL || buf_cap == 0) return;

    snprintf(
        buf_out,
        buf_cap,
        "%s() [%s] -> %s | in: %zu B, out: %zu B | %.2f ms",
        evt->function_name,
        evt->operation,
        (evt->status == VF_OK) ? "VF_OK" : "VF_ERR",
        evt->input_bytes,
        evt->output_bytes,
        (double)evt->duration_us / 1000.0
    );
}

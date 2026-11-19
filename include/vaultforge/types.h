/**
 * VAULTFORGE — Cryptographic Core Header
 * Product: VAULTFORGE (Your Digital Identity. Under Your Control.)
 * Domain: C11 / libsodium Cryptographic Architecture
 * Capstone Team: Nahyan Bin Nawaf, Sudharsan, Dinesh
 */

#ifndef VAULTFORGE_TYPES_H
#define VAULTFORGE_TYPES_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* --- Cryptographic Primitives Constants (libsodium XChaCha20-Poly1305 & Argon2id) --- */
#define VF_KEY_BYTES         32U   /* 256-bit symmetric key (KEK & DEK) */
#define VF_SALT_BYTES        16U   /* 128-bit Argon2id salt */
#define VF_NONCE_BYTES       24U   /* 192-bit XChaCha20 nonce (safe for random generation) */
#define VF_MAC_BYTES         16U   /* 128-bit Poly1305 authentication tag */
#define VF_RECOVERY_BYTES    32U   /* 256-bit recovery secret */

#define VF_VERSION_MAJOR     1U
#define VF_VERSION_MINOR     0U
#define VF_MAGIC_HEADER      0x56464F52 /* "VFOR" in ASCII */

/* --- Standardized Return / Status Codes --- */
typedef enum {
    VF_OK                    = 0,
    VF_ERR_NULL_PARAM        = -1,
    VF_ERR_INVALID_PARAM     = -2,
    VF_ERR_AUTH_FAILED       = -3,  /* Poly1305 MAC tag mismatch / tampering */
    VF_ERR_KEY_DERIVATION    = -4,  /* Argon2id pwhash failed */
    VF_ERR_OUT_OF_MEMORY     = -5,
    VF_ERR_BUFFER_TOO_SMALL  = -6,
    VF_ERR_CORRUPT_PAYLOAD   = -7,
    VF_ERR_SESSION_INVALID   = -8,
    VF_ERR_UNSUPPORTED_VER   = -9,
    VF_ERR_ENTROPY_FAILURE   = -10
} vf_status_t;

/* --- Argon2id KDF Calibration Parameters --- */
typedef struct {
    uint32_t opslimit;      /* Computational iterations */
    size_t   memlimit;      /* Memory cost in bytes */
    uint32_t algorithm;     /* libsodium crypto_pwhash_ALG_ARGON2ID13 */
} vf_kdf_params_t;

/* --- Wrapped Data Encryption Key (Envelope Encryption) --- */
typedef struct {
    uint8_t nonce[VF_NONCE_BYTES];
    uint8_t tag[VF_MAC_BYTES];
    uint8_t cipher_dek[VF_KEY_BYTES];
} vf_wrapped_key_t;

/* --- Telemetry Event Record --- */
typedef struct {
    char        function_name[32];
    char        operation[24];
    size_t      input_bytes;
    size_t      output_bytes;
    vf_status_t status;
    uint64_t    duration_us;
} vf_telemetry_t;

/* --- Password Generator Character Set Flags --- */
typedef enum {
    VF_CHAR_LOWERCASE   = (1 << 0),
    VF_CHAR_UPPERCASE   = (1 << 1),
    VF_CHAR_NUMBERS     = (1 << 2),
    VF_CHAR_SYMBOLS     = (1 << 3),
    VF_EXCLUDE_AMBIGUOUS = (1 << 4)
} vf_char_flags_t;

#ifdef __cplusplus
}
#endif

#endif /* VAULTFORGE_TYPES_H */

cmake_minimum_required(VERSION 3.15)
project(vaultforge_crypto C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

include_directories(include)

# Libsodium configuration
find_package(PkgConfig QUIET)
find_library(SODIUM_LIB sodium)

set(SOURCES
    src/crypto_core/key_derivation.c
    src/crypto_core/key_management.c
    src/crypto_core/encryption.c
    src/crypto_core/decryption.c
    src/crypto_core/password_generator.c
    src/crypto_core/secure_memory.c
    src/crypto_core/encoding.c
    src/crypto_core/vault_integrity.c
    src/crypto_core/vault_manager.c
    src/crypto_core/backup_format.c
    src/crypto_core/session_manager.c
    src/crypto_core/security_events.c
    src/crypto_core/vault_validation.c
)

add_library(vaultforge_crypto_static STATIC ${SOURCES})
target_compile_definitions(vaultforge_crypto_static PRIVATE VF_USE_LIBSODIUM)

if(SODIUM_LIB)
    target_link_libraries(vaultforge_crypto_static ${SODIUM_LIB})
endif()

# CLI Executable for verification and capstone demonstration
add_executable(vaultforge_cli src/crypto_core/main_cli.c)
target_link_libraries(vaultforge_cli vaultforge_crypto_static)
if(SODIUM_LIB)
    target_link_libraries(vaultforge_cli ${SODIUM_LIB})
endif()

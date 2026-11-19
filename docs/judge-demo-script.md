# VAULTFORGE — Five-Minute Capstone Review Demonstration Script
**Team:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Product:** VAULTFORGE Secure Password Vault  
**Audience:** Capstone Review Panel, Evaluators, Technical Judges  

---

## Timing Overview (Total: 5 Minutes)

| Segment | Time | Focus | Key Action / Screen |
|---|---|---|---|
| **1. Intro & Landing Page** | 0:00 – 0:45 | Architecture & Visual Identity | Animated Vault Mechanism, C/WASM Core Badge |
| **2. Vault Creation** | 0:45 – 1:30 | Envelope Encryption & KDF | 5-Step Setup, Argon2id calibration, 256-bit Recovery Key |
| **3. Credential CRUD** | 1:30 – 2:15 | Record Types & Sealing | Add Login, Master-Detail View, Clipboard Auto-Clear |
| **4. Dashboard & Radar** | 2:15 – 3:00 | Real Data Analytics | Multidimensional Health Radar, Reuse Detection |
| **5. Cryptography Lab** | 3:00 – 4:00 | Capstone Cryptographic Proof | Argon2id Matrix, Poly1305 Tamper Bit-Flip Drill |
| **6. Telemetry & Panic Lock**| 4:00 – 4:45 | Memory Hygiene & C Boundary | C-Engine Drawer, `Ctrl+Shift+L` Panic Lock |
| **7. Conclusion & Q&A** | 4:45 – 5:00 | Deliverables & Wrap-Up | Codebase verification, Viva readiness |

---

## Step-by-Step Demonstration Walkthrough

### 1. Landing Page (0:00 – 0:45)
- **Speaker:** "Good morning/afternoon, esteemed judges. We are Nahyan Bin Nawaf, Sudharsan, and Dinesh. We present **VAULTFORGE**, a commercial-grade local-first password vault engineered in C11 and compiled to WebAssembly."
- **Action:** 
  1. Show the landing page with the interactive rotating geometric vault mechanism.
  2. Point out the headline and the cryptographic pipeline overview diagram.
  3. Highlight: "Plaintext secrets never touch the disk or network. All encryption occurs in our WebAssembly C core."

### 2. Vault Creation (0:45 – 1:30)
- **Action:** Click **"Create Your Vault"** (or use Demo Sandbox Profile 1).
- **Showcase:**
  1. **Step 1:** Name the vault (e.g. `Capstone Production Vault`).
  2. **Step 2:** Enter master password. Note real-time password entropy calculation and the C-powered password generator button.
  3. **Step 3:** Display the 256-bit CSPRNG Emergency Recovery Key. Demonstrate copying and downloading the `.txt` key.
  4. **Step 4:** Highlight Argon2id calibration (64MB memory cost, 3 iterations) and auto-lock timeout.
  5. **Step 5:** Click "Create & Open Dashboard".

### 3. Adding a Credential & Clipboard Management (1:30 – 2:15)
- **Action:** Navigate to **Credential Vault**.
- **Showcase:**
  1. Click **"Add Credential"**.
  2. Select type: **Login** (or Payment Card, Secure Note, API Key).
  3. Enter title: `AWS Production Root`, username `admin@company.com`, click **C-Generate** for a 24-character random password.
  4. Save record: Note how the record is sealed with XChaCha20-Poly1305 using a fresh 24-byte nonce and bound associated data (`VAULTFORGE_RECORD:vaultId:recId`).
  5. Click **Copy Password**: Observe the active clipboard countdown badge (e.g., "Clearing clipboard in 30s").

### 4. Dashboard & Health Radar (2:15 – 3:00)
- **Action:** Click **Main Dashboard** and then **Health Radar**.
- **Showcase:**
  1. Point out the Security Score Orb and the 6-axis SVG Health Radar (Entropy, Uniqueness, Freshness, Strength, Envelope, Compliance).
  2. Show that statistics come directly from actual in-memory credentials—never hardcoded.
  3. Point out how cross-account password reuse is automatically identified and flagged with remediation suggestions.

### 5. Cryptography Laboratory (3:00 – 4:00) [Star Demonstration Segment]
- **Action:** Navigate to **Cryptography Lab**.
- **Showcase:**
  1. **Lab 1 (Argon2id Matrix):** Click **"Run Derivation"**. Show the animated memory block matrix allocating 32–64MB of RAM and displaying the real execution duration in milliseconds.
  2. **Lab 3 (XChaCha20 Encryption Studio):** Show the 192-bit (24-byte) nonce and 128-bit Poly1305 MAC tag generated for plaintext.
  3. **Lab 5 (Tamper Detection):** Click **"Flip Byte & Attempt Decryption"**.
     - Point out: "We deliberately flipped a single bit at byte offset 0. When the C engine evaluates the Poly1305 polynomial, authentication fails immediately with error code `VF_ERR_AUTH_FAILED (-3)`."
     - Emphasize: "This proves constant-time tamper detection in practice."

### 6. C-Engine Telemetry & Panic Lock (4:00 – 4:45)
- **Action:**
  1. Click the **C-ENGINE TELEMETRY** pill at the bottom right.
  2. Show real-time sanitized calls: `crypto_aead_xchacha20poly1305_ietf_encrypt() -> VF_OK [0.82 ms]`, `sodium_memzero() -> VF_OK [0.05 ms]`.
  3. Trigger **Panic Lock** using the red button or keyboard shortcut: <kbd>Ctrl + Shift + L</kbd>.
  4. Show the immediate session termination, zeroing of key buffers, and return to the locked screen.

### 7. Conclusion (4:45 – 5:00)
- **Speaker:** "All 13 automated unit tests pass via `npm run verify`. We have delivered a complete C codebase, full documentation, and a working production application. We are ready for your questions."

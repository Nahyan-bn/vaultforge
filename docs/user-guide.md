# VAULTFORGE — User Manual & Operations Guide
**Team Members:** Nahyan Bin Nawaf, Sudharsan, Dinesh  
**Product:** VAULTFORGE (Your Digital Identity. Under Your Control.)  

---

## 1. Getting Started

### 1.1 Creating Your First Vault
1. Launch VAULTFORGE in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
2. Click **"Create Your Vault"** on the landing page.
3. **Step 1:** Enter a recognizable name for your vault (e.g., `Personal`, `Finance`, `Engineering`) and select an accent color.
4. **Step 2:** Choose a strong Master Password. Observe the entropy gauge. You may also click **"Generate Strong"** to generate an unguessable password using the CSPRNG engine.
5. **Step 3 (Crucial):** Copy or download your 256-bit **Emergency Recovery Key**. Store this offline on physical paper or a secure external drive.
6. **Step 4:** Set your preferred automatic lock timeout (default 10 minutes) and clipboard clear delay (default 30 seconds).
7. **Step 5:** Review parameters and click **"Create & Open Dashboard"**.

---

## 2. Vault Operations

### 2.1 Unlocking the Vault
- Enter your Master Password.
- If Caps Lock is active, an indicator will appear.
- After 3 consecutive incorrect attempts, an exponential delay throttling banner will activate to protect against automated local guessing.
- If you forgot your master password, click **"Forgot Password?"** and enter your 256-bit Recovery Key.

### 2.2 Adding and Managing Credentials
- Click **"Add Credential"** in the navigation bar or Credential Vault page.
- Choose between four credential schemas:
  - **Login:** Username/email, password, website, and tags.
  - **Payment Card:** Cardholder name, 16-digit card number, expiration date, and CVV.
  - **Secure Note:** Freeform encrypted markdown or private keys.
  - **API Key:** Service name, API key, and secret token.
- Toggle between **Master-Detail View** (for deep inspection) and **Grid View** (for quick skimming).

### 2.3 Copying Passwords & Clipboard Security
- Clicking **Copy** on any credential copies the value to your operating system clipboard.
- A prominent countdown badge displays the remaining seconds before VAULTFORGE overwrites the clipboard with empty text.
- Note: Clipboard clearing operates on a best-effort basis depending on browser focus permissions.

### 2.4 Emergency Panic Lock
- If you step away from your workstation or face immediate physical observation, press:
  - **Windows / Linux:** <kbd>Ctrl + Shift + L</kbd>
  - **macOS:** <kbd>Cmd + Shift + L</kbd>
- Alternatively, click the red **"Panic Lock"** button in the header.
- This immediately invokes C `sodium_memzero()` to wipe all held encryption keys, flushes in-memory search indexes, and returns to the lock screen.

---

## 3. Advanced Features

### 3.1 Password Generator Studio
- Accessible from the sidebar or header icon.
- Three specialized generation modes:
  1. **Random Password:** Length 8 to 128 characters with toggleable character classes.
  2. **Passphrase:** 3 to 10 EFF-shortlist words joined by custom separators.
  3. **Numeric PIN:** 4 to 12 digits using uniform CSPRNG random generation.

### 3.2 Backup and Migration
- In **Backup & Restore**, click **"Download Encrypted .vfvault"**.
- This produces a portable JSON container holding your salt, wrapped DEK, and encrypted records.
- To restore on another computer, upload the file in the **Restore** panel and unlock with your master password.

import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { storageManager } from '../storage/indexedDb';
import { webAuthnService } from '../services/webAuthnService';
import { IrisScannerModal } from '../components/auth/IrisScannerModal';
import { GovernmentVerificationModal } from '../components/auth/GovernmentVerificationModal';
import {
  Settings as SettingsIcon,
  Key,
  Shield,
  Clock,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Cpu,
  Fingerprint,
  Eye,
  Building2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import type { AuthMethodType } from '../types/auth';

interface SettingsProps {
  onNavigate: (tab: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const {
    activeVault,
    preferences,
    updatePreferences,
    changeMasterPassword,
    setupPin,
    removePin,
    setupBiometrics,
    removeBiometrics,
    updateIrisConfig,
    updateGovVerification,
    clearGovVerification,
    setPreferredAuthMethod,
    isUnlocked,
    refreshVaults,
    lockVault
  } = useVaultStore();

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // PIN state
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Biometrics state
  const [hasPlatformBio, setHasPlatformBio] = useState(false);
  const [bioStatus, setBioStatus] = useState<string | null>(null);
  const [isRegisteringBio, setIsRegisteringBio] = useState(false);

  // Modals state
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);

  // Danger zone state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    webAuthnService.isPlatformAuthenticatorAvailable().then(setHasPlatformBio);
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('Passwords do not match.');
      return;
    }

    const ok = await changeMasterPassword(newPassword);
    if (ok) {
      setPasswordStatus('Master password updated. DEK re-wrapped with fresh Argon2id salt.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus('Failed to update password.');
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput)) {
      setPinStatus('PIN must be exactly 6 numeric digits (0-9).');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinStatus('PINs do not match.');
      return;
    }

    const ok = await setupPin(pinInput);
    if (ok) {
      setPinStatus('6-digit PIN envelope successfully configured with Argon2id.');
      setPinInput('');
      setConfirmPinInput('');
      setIsSettingPin(false);
    } else {
      setPinStatus('Failed to configure PIN.');
    }
  };

  const handleRegisterBiometrics = async () => {
    setIsRegisteringBio(true);
    setBioStatus(null);
    try {
      const ok = await setupBiometrics();
      if (ok) {
        setBioStatus('Biometric platform authenticator (Windows Hello / Passkey) successfully paired.');
      } else {
        setBioStatus('Biometric registration was not completed.');
      }
    } catch (e: any) {
      setBioStatus(e?.message || 'Biometric pairing error.');
    } finally {
      setIsRegisteringBio(false);
    }
  };

  const handleDeleteVault = async () => {
    if (!activeVault) return;
    if (deleteConfirmText !== activeVault.name) {
      setDeleteError(`Please type exact vault name "${activeVault.name}" to confirm.`);
      return;
    }

    await storageManager.deleteVault(activeVault.id);
    await lockVault();
    await refreshVaults();
    onNavigate('landing');
  };

  const preferredMethod = activeVault?.preferredAuthMethod || 'password';

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyber-cyan" />
          <span>Security Architecture & Vault Settings</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Configure multi-layer authentication envelopes, biometric passkeys, and statutory KYC gates
        </p>
      </div>

      {/* SECTION 1: MULTI-LAYER AUTHENTICATION CONTROLS */}
      {isUnlocked && activeVault && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyber-border/60 gap-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyber-cyan" />
                  <span>Multi-Layer Authentication Envelopes</span>
                </h2>
                <p className="text-[11px] text-cyber-muted mt-0.5">
                  Manage authorised authentication keys that unwrap the 256-bit Data Encryption Key (DEK).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-cyber-muted">Default Unlock:</span>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredAuthMethod(e.target.value as AuthMethodType)}
                  className="h-8 px-2.5 rounded-lg bg-cyber-elevated border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold focus:outline-none"
                >
                  <option value="password">Master Password</option>
                  {activeVault.pinAuth?.enabled && <option value="pin">Six-Digit PIN</option>}
                  {activeVault.biometricAuth?.enabled && <option value="biometric">Fingerprint / Passkey</option>}
                </select>
              </div>
            </div>

            {/* 1A. Six-Digit PIN Management */}
            <div className="p-4 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-cyber-cyan" />
                  <div>
                    <span className="font-bold text-white">Six-Digit Security PIN</span>
                    <span className="text-cyber-muted ml-2 text-[10px]">
                      (Argon2id Encapsulated KEK)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeVault.pinAuth?.enabled ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-success/15 border border-cyber-success/30 text-cyber-success font-bold text-[10px]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-cyber-muted/10 border border-cyber-border text-cyber-muted text-[10px]">
                      UNCONFIGURED
                    </span>
                  )}
                  {activeVault.pinAuth?.enabled ? (
                    <button
                      type="button"
                      onClick={() => removePin()}
                      className="px-2.5 py-1 rounded-lg border border-cyber-danger/30 text-cyber-danger hover:bg-cyber-danger/10 text-[10px] font-bold transition-colors"
                    >
                      Disable PIN
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSettingPin(!isSettingPin)}
                      className="px-3 py-1 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 text-white font-bold text-[10px] transition-colors"
                    >
                      {isSettingPin ? 'Cancel' : 'Set 6-Digit PIN'}
                    </button>
                  )}
                </div>
              </div>

              {activeVault.pinAuth?.enabled && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-cyber-muted">
                  <div>
                    <span>Failed Attempts: </span>
                    <strong className="text-white">{activeVault.pinAuth.failedAttempts} / {activeVault.pinAuth.maxAttempts}</strong>
                  </div>
                  <div>
                    <span>Lockout State: </span>
                    <strong className={activeVault.pinAuth.lockedUntil && activeVault.pinAuth.lockedUntil > Date.now() ? 'text-cyber-danger' : 'text-cyber-success'}>
                      {activeVault.pinAuth.lockedUntil && activeVault.pinAuth.lockedUntil > Date.now() ? 'Locked Out' : 'Clear'}
                    </strong>
                  </div>
                  <div>
                    <span>Last Updated: </span>
                    <strong className="text-white">{new Date(activeVault.pinAuth.updatedAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              )}

              {/* Set PIN Form */}
              {isSettingPin && (
                <form onSubmit={handleSavePin} className="pt-3 border-t border-cyber-border/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyber-muted mb-1 text-[11px]">Enter 6-Digit PIN:</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-3 py-1.5 rounded-lg bg-cyber-bg border border-cyber-border text-white text-xs tracking-widest text-center"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-cyber-muted mb-1 text-[11px]">Confirm 6-Digit PIN:</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-3 py-1.5 rounded-lg bg-cyber-bg border border-cyber-border text-white text-xs tracking-widest text-center"
                      />
                    </div>
                  </div>

                  {pinStatus && (
                    <div className="p-2 rounded bg-cyber-bg border border-cyber-border text-[11px] text-cyber-cyan">
                      {pinStatus}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSettingPin(false)}
                      className="px-3 py-1.5 rounded-lg border border-cyber-border text-cyber-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pinInput.length !== 6 || confirmPinInput.length !== 6}
                      className="px-4 py-1.5 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-40 text-white font-bold"
                    >
                      Save & Encrypt Envelope
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 1B. Fingerprint / Platform Biometrics Management */}
            <div className="p-4 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-4 h-4 text-cyber-cyan" />
                  <div>
                    <span className="font-bold text-white">Biometric Passkey (Windows Hello / Touch ID)</span>
                    <span className="text-cyber-muted ml-2 text-[10px]">
                      (WebAuthn FIDO2 Platform Authenticator)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeVault.biometricAuth?.enabled ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-success/15 border border-cyber-success/30 text-cyber-success font-bold text-[10px]">
                      PAIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-cyber-muted/10 border border-cyber-border text-cyber-muted text-[10px]">
                      NOT PAIRED
                    </span>
                  )}
                  {activeVault.biometricAuth?.enabled ? (
                    <button
                      type="button"
                      onClick={() => removeBiometrics()}
                      className="px-2.5 py-1 rounded-lg border border-cyber-danger/30 text-cyber-danger hover:bg-cyber-danger/10 text-[10px] font-bold transition-colors"
                    >
                      Revoke Passkey
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isRegisteringBio}
                      onClick={handleRegisterBiometrics}
                      className="px-3 py-1 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white font-bold text-[10px] transition-colors flex items-center gap-1.5"
                    >
                      {isRegisteringBio && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Pair Authenticator</span>
                    </button>
                  )}
                </div>
              </div>

              {activeVault.biometricAuth?.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 text-cyber-muted">
                  <div>
                    <span>Device: </span>
                    <strong className="text-white">{activeVault.biometricAuth.deviceLabel}</strong>
                  </div>
                  <div>
                    <span>Credential ID: </span>
                    <strong className="text-cyber-cyan font-mono">{activeVault.biometricAuth.credentialId.slice(0, 16)}...</strong>
                  </div>
                </div>
              )}

              {bioStatus && (
                <div className="p-2 rounded bg-cyber-bg border border-cyber-border text-[11px] text-cyber-cyan">
                  {bioStatus}
                </div>
              )}
            </div>

            {/* 1C. Iris / Retinal Biometrics Station */}
            <div className="p-4 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-cyber-warning" />
                  <div>
                    <span className="font-bold text-white">Iris & Retinal Biometrics Station</span>
                    <span className="text-cyber-warning ml-2 text-[10px] font-bold">
                      (DEMONSTRATION MODE)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIrisModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-cyber-elevated hover:bg-cyber-card border border-cyber-warning/40 text-cyber-warning font-bold text-[10px] transition-colors"
                >
                  Launch Scanner HUD
                </button>
              </div>

              <p className="text-[11px] text-cyber-muted leading-relaxed">
                Modular architecture supporting ISO/IEC 19794-6 external near-infrared hardware. In the absence of specialized sensors, operates in certified demonstration mode with zero raw eye image storage.
              </p>
            </div>

            {/* 1D. Government Identity Verification (Aadhaar / National ID) */}
            <div className="p-4 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-cyber-cyan" />
                  <div>
                    <span className="font-bold text-white">Government Identity Verification Hub</span>
                    <span className="text-cyber-muted ml-2 text-[10px]">
                      (UIDAI Aadhaar / National ID Sandbox)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                    activeVault.govVerification?.status === 'DEMO_VERIFIED'
                      ? 'bg-cyber-warning/15 border-cyber-warning/30 text-cyber-warning'
                      : activeVault.govVerification?.status === 'OFFICIALLY_VERIFIED'
                      ? 'bg-cyber-success/15 border-cyber-success/30 text-cyber-success'
                      : 'bg-cyber-muted/10 border-cyber-border text-cyber-muted'
                  }`}>
                    {activeVault.govVerification?.status || 'UNVERIFIED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGovModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 text-white font-bold text-[10px] transition-colors"
                  >
                    {activeVault.govVerification ? 'View Certificate' : 'Initiate KYC'}
                  </button>
                  {activeVault.govVerification && (
                    <button
                      type="button"
                      onClick={() => clearGovVerification()}
                      className="px-2 py-1 rounded-lg border border-cyber-danger/30 text-cyber-danger text-[10px]"
                      title="Clear verification record"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {activeVault.govVerification && (
                <div className="p-2.5 rounded-lg bg-cyber-bg/80 border border-cyber-border/70 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Masked Identifier:</span>
                    <span className="text-cyber-cyan font-bold font-mono">{activeVault.govVerification.maskedIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Transaction ID:</span>
                    <span className="text-white font-mono">{activeVault.govVerification.verificationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Receipt Hash (BLAKE2b):</span>
                    <span className="text-cyber-muted font-mono text-[10px] truncate max-w-xs">{activeVault.govVerification.certificateDigestHex}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CHANGE MASTER PASSWORD (DEK RE-WRAPPING) */}
      {isUnlocked && activeVault && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-cyber-violet" />
            <span>Change Master Password (DEK Re-Wrapping)</span>
          </h2>
          <p className="text-cyber-muted font-sans text-xs leading-relaxed">
            Changing your master password derives a fresh Key Encryption Key (KEK) and re-wraps the Data Encryption Key (DEK). Stored records do not need to be decrypted or re-encrypted.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-cyber-muted mb-1 uppercase">New Master Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-cyber-muted mb-1 uppercase">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                />
              </div>
            </div>

            {passwordStatus && (
              <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border text-cyber-cyan text-xs">
                {passwordStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-cyber-violet hover:bg-cyber-violet/90 disabled:opacity-50 text-white font-bold text-xs transition-colors"
            >
              Update Password & Re-Wrap Envelope
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: INACTIVITY & CLIPBOARD TIMEOUTS */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-cyan" />
          <span>Session Inactivity & Clipboard Settings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-cyber-muted mb-2 uppercase">
              Auto-Lock Inactivity Period ({preferences.autoLockMinutes} minutes)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((m) => (
                <button
                  key={m}
                  onClick={() => updatePreferences({ autoLockMinutes: m })}
                  className={`py-2 rounded-lg border text-center transition-colors ${
                    preferences.autoLockMinutes === m
                      ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-cyan font-bold'
                      : 'bg-cyber-bg border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-cyber-muted mb-2 uppercase">
              Clipboard Clearing Delay ({preferences.clipboardClearSeconds} seconds)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((s) => (
                <button
                  key={s}
                  onClick={() => updatePreferences({ clipboardClearSeconds: s })}
                  className={`py-2 rounded-lg border text-center transition-colors ${
                    preferences.clipboardClearSeconds === s
                      ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-cyan font-bold'
                      : 'bg-cyber-bg border-cyber-border text-cyber-muted hover:text-white'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PERMANENT DELETION DANGER ZONE */}
      {activeVault && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-danger/30 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-cyber-danger">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Permanent Vault Deletion
            </h2>
          </div>
          <p className="text-cyber-muted font-sans text-xs leading-relaxed">
            Permanently destroys this vault, all its encrypted records, and its audit history from local IndexedDB storage. This action cannot be reversed.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-cyber-danger/10 border border-cyber-danger/40 text-cyber-danger">
              {deleteError}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-cyber-muted">
              Type exact vault name <strong className="text-white">"{activeVault.name}"</strong> to confirm:
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={activeVault.name}
                className="flex-1 px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
              />
              <button
                onClick={handleDeleteVault}
                disabled={deleteConfirmText !== activeVault.name}
                className="px-5 py-2 rounded-xl bg-cyber-danger hover:bg-cyber-danger/90 disabled:opacity-40 text-white font-bold text-xs transition-colors shrink-0"
              >
                Permanently Destroy Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Iris Scanner Modal */}
      <IrisScannerModal
        isOpen={isIrisModalOpen}
        onClose={() => setIsIrisModalOpen(false)}
        onScanComplete={(res) => {
          updateIrisConfig({
            driverType: 'SIMULATED_DEMO_OPTICAL',
            allowSimulationDemo: true,
            lastScanResult: res,
            updatedAt: Date.now()
          });
        }}
      />

      {/* Government Verification Modal */}
      <GovernmentVerificationModal
        isOpen={isGovModalOpen}
        onClose={() => setIsGovModalOpen(false)}
        onVerified={(record) => {
          updateGovVerification(record);
        }}
      />
    </div>
  );
};

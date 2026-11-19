import React, { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { storageManager } from '../storage/indexedDb';
import {
  Settings as SettingsIcon,
  Key,
  Shield,
  Clock,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Cpu
} from 'lucide-react';

interface SettingsProps {
  onNavigate: (tab: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { activeVault, preferences, updatePreferences, changeMasterPassword, isUnlocked, refreshVaults, lockVault } = useVaultStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      setPasswordStatus('Master password changed successfully. DEK re-wrapped with fresh salt.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus('Failed to update password.');
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

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyber-cyan" />
          <span>Vault Preferences & Security Settings</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Configure security timeouts, Argon2id calibration, and cryptographic envelope
        </p>
      </div>

      {/* Vault Metadata Card */}
      {activeVault && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3 text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-cyan" />
            <span>Vault Specification & KDF Metadata</span>
          </h2>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between py-1 border-b border-cyber-border/40">
              <span className="text-cyber-muted">Vault Identifier:</span>
              <span className="text-white select-all font-mono">{activeVault.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyber-border/40">
              <span className="text-cyber-muted">KDF Algorithm:</span>
              <span className="text-cyber-cyan font-bold">Argon2id13</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cyber-border/40">
              <span className="text-cyber-muted">Memory Allocation:</span>
              <span className="text-white font-bold">{activeVault.kdfParams.memlimit / 1024 / 1024} MB RAM</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-cyber-muted">Iterations (opslimit):</span>
              <span className="text-white font-bold">{activeVault.kdfParams.opslimit} passes</span>
            </div>
          </div>
        </div>
      )}

      {/* Change Master Password (DEK Re-wrapping) */}
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

      {/* Inactivity & Clipboard Timeouts */}
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

      {/* Permanent Deletion Danger Zone */}
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
    </div>
  );
};

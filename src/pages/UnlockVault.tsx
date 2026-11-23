import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { VaultForgeLogo } from '../components/common/VaultForgeLogo';
import { PinKeypad } from '../components/auth/PinKeypad';
import { IrisScannerModal } from '../components/auth/IrisScannerModal';
import { webAuthnService } from '../services/webAuthnService';
import {
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Shield,
  LifeBuoy,
  Clock,
  Sparkles,
  Fingerprint,
  RefreshCw,
  HelpCircle,
  Binary
} from 'lucide-react';
import type { AuthMethodType } from '../types/auth';

interface UnlockVaultProps {
  onNavigate: (tab: string) => void;
}

export const UnlockVault: React.FC<UnlockVaultProps> = ({ onNavigate }) => {
  const {
    availableVaults,
    unlockVault,
    unlockWithRecoveryKey,
    unlockWithPin,
    unlockWithBiometrics,
    refreshVaults,
    isDemoMode,
    setDemoMode
  } = useVaultStore();

  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [activeTab, setActiveTab] = useState<AuthMethodType>('password');

  // Password State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsOn, setIsCapsOn] = useState(false);

  // Throttling for Password
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(0);

  // Recovery Key State
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');

  // Biometrics & Iris State
  const [hasPlatformBio, setHasPlatformBio] = useState(false);
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);

  // General Status
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    refreshVaults();
    webAuthnService.isPlatformAuthenticatorAvailable().then(setHasPlatformBio);
  }, [refreshVaults]);

  useEffect(() => {
    if (availableVaults.length > 0 && !selectedVaultId) {
      setSelectedVaultId(availableVaults[0].id);
    }
  }, [availableVaults, selectedVaultId]);

  const selectedVault = availableVaults.find((v) => v.id === selectedVaultId);

  // Auto-switch to vault's preferred method if configured
  useEffect(() => {
    if (selectedVault?.preferredAuthMethod) {
      if (selectedVault.preferredAuthMethod === 'pin' && selectedVault.pinAuth?.enabled) {
        setActiveTab('pin');
      } else if (selectedVault.preferredAuthMethod === 'biometric' && selectedVault.biometricAuth?.enabled) {
        setActiveTab('biometric');
      }
    }
  }, [selectedVault]);

  // Throttling countdown timer for repeated failed password attempts
  useEffect(() => {
    if (delaySeconds > 0) {
      const timer = setTimeout(() => setDelaySeconds(delaySeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [delaySeconds]);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setIsCapsOn(e.getModifierState('CapsLock'));
  };

  // Master Password Unlock
  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delaySeconds > 0) return;

    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      const success = await unlockVault(selectedVaultId, password);
      if (success) {
        onNavigate('dashboard');
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setDelaySeconds(Math.min(30, Math.pow(2, nextAttempts - 2)));
        }
        setErrorMsg('Authentication failed: Master password incorrect or envelope corrupted.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setIsUnlocking(false);
    }
  };

  // 6-Digit PIN Unlock
  const handlePinUnlock = async (pin: string) => {
    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      const success = await unlockWithPin(selectedVaultId, pin);
      if (success) {
        onNavigate('dashboard');
      } else {
        // Refresh vault to get updated attempt counter
        await refreshVaults();
        setErrorMsg('Authentication failed: Incorrect PIN.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'PIN unlock failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Biometric Unlock (WebAuthn / Windows Hello)
  const handleBiometricUnlock = async () => {
    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      const success = await unlockWithBiometrics(selectedVaultId);
      if (success) {
        onNavigate('dashboard');
      } else {
        setErrorMsg('Biometric verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Biometric authentication cancelled or rejected');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Recovery Key Unlock
  const handleRecoveryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      const cleanRecoveryKey = recoveryKeyInput.replace(/[- ]/g, '').toLowerCase();
      const success = await unlockWithRecoveryKey(selectedVaultId, cleanRecoveryKey);
      if (success) {
        onNavigate('dashboard');
      } else {
        setErrorMsg('Invalid recovery key. Cryptographic authentication failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Recovery key error');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 font-mono">
      <div className="text-center mb-6">
        <VaultForgeLogo size="lg" className="justify-center mb-3" />
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Unlock Encrypted Vault
        </h2>
        <p className="text-xs text-cyber-muted mt-1">
          Multi-layer envelope decryption & authenticated key unwrap
        </p>
      </div>

      <div className="p-6 sm:p-7 rounded-2xl bg-cyber-card border border-cyber-border shadow-cyber relative">
        {/* Caps Lock warning */}
        {isCapsOn && activeTab === 'password' && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-cyber-warning/15 border border-cyber-warning/40 text-cyber-warning text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Caps Lock is ON</span>
          </div>
        )}

        {/* Delay countdown notice */}
        {delaySeconds > 0 && activeTab === 'password' && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-cyber-danger/15 border border-cyber-danger/40 text-cyber-danger text-xs font-mono">
            <Clock className="w-4 h-4 shrink-0 animate-spin" />
            <span>Throttling active: wait {delaySeconds}s before retrying</span>
          </div>
        )}

        {/* Vault Selector (if multiple exist) */}
        {availableVaults.length > 1 && (
          <div className="mb-5 space-y-1.5">
            <label className="text-[11px] font-bold text-cyber-muted uppercase tracking-wider">
              Select Vault:
            </label>
            <select
              value={selectedVaultId}
              onChange={(e) => {
                setSelectedVaultId(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full h-10 px-3 bg-cyber-bgSecondary border border-cyber-border rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
            >
              {availableVaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.id.slice(0, 10)}...)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Authentication Layer Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-cyber-bgSecondary/90 rounded-xl border border-cyber-border mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'password'
                ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                : 'text-cyber-muted hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Password</span>
          </button>

          <button
            type="button"
            disabled={!selectedVault?.pinAuth?.enabled}
            onClick={() => {
              setActiveTab('pin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none ${
              activeTab === 'pin'
                ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                : 'text-cyber-muted hover:text-white'
            }`}
            title={selectedVault?.pinAuth?.enabled ? 'Unlock with 6-digit PIN' : 'PIN unconfigured'}
          >
            <Lock className="w-4 h-4" />
            <span>6-PIN</span>
          </button>

          <button
            type="button"
            disabled={!selectedVault?.biometricAuth?.enabled && !hasPlatformBio}
            onClick={() => {
              setActiveTab('biometric');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none ${
              activeTab === 'biometric'
                ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                : 'text-cyber-muted hover:text-white'
            }`}
            title="Biometric passkey unlock"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Biometric</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('iris');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              activeTab === 'iris'
                ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                : 'text-cyber-muted hover:text-white'
            }`}
            title="Iris & Retinal Biometrics Station"
          >
            <Eye className="w-4 h-4" />
            <span>Iris</span>
          </button>
        </div>

        {/* TAB 1: MASTER PASSWORD */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Master Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('recovery')}
                  className="text-[11px] text-cyber-cyan hover:underline"
                >
                  Lost password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  onKeyUp={handleKeyUp}
                  placeholder="Enter vault master password..."
                  required
                  disabled={delaySeconds > 0 || isUnlocking}
                  className="w-full h-11 px-4 pr-11 bg-cyber-bgSecondary border border-cyber-border rounded-xl text-xs font-mono text-white placeholder-cyber-muted/40 focus:outline-none focus:border-cyber-cyan transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUnlocking || !password || delaySeconds > 0}
              className="w-full h-11 bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-cyber transition-all"
            >
              {isUnlocking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Deriving Argon2id Key...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Vault (KEK Unwrap)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SIX-DIGIT PIN */}
        {activeTab === 'pin' && selectedVault?.pinAuth && (
          <div className="py-2">
            <PinKeypad
              onComplete={handlePinUnlock}
              disabled={isUnlocking}
              failedAttempts={selectedVault.pinAuth.failedAttempts || 0}
              maxAttempts={selectedVault.pinAuth.maxAttempts || 5}
              lockedUntil={selectedVault.pinAuth.lockedUntil || 0}
              title="Enter 6-Digit PIN"
              subtitle="Decrypts PIN Envelope with Argon2id"
            />
          </div>
        )}

        {/* TAB 3: BIOMETRIC / WEBAUTHN */}
        {activeTab === 'biometric' && (
          <div className="py-4 text-center space-y-5">
            <div className="relative w-24 h-24 mx-auto rounded-full bg-cyber-card border-2 border-cyber-cyan/40 flex items-center justify-center shadow-[0_0_30px_rgba(34,227,255,0.2)]">
              <div className="absolute inset-1 rounded-full border border-dashed border-cyber-cyan/30 animate-spin" style={{ animationDuration: '8s' }} />
              <Fingerprint className="w-12 h-12 text-cyber-cyan animate-pulse drop-shadow-[0_0_10px_#22E3FF]" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">
                Platform Biometrics
              </h3>
              <p className="text-xs text-cyber-muted mt-1 max-w-xs mx-auto">
                Windows Hello / Touch ID / FIDO2 Authenticator
              </p>
            </div>

            <button
              type="button"
              disabled={isUnlocking}
              onClick={handleBiometricUnlock}
              className="w-full h-11 bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-cyber transition-all"
            >
              {isUnlocking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Awaiting Biometric Assertion...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Touch Sensor / Windows Hello</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 4: IRIS & RETINAL SCANNER */}
        {activeTab === 'iris' && (
          <div className="py-4 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto rounded-full bg-cyber-card border-2 border-cyber-warning/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Eye className="w-12 h-12 text-cyber-warning animate-pulse drop-shadow-[0_0_10px_#F59E0B]" />
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-cyber-warning/20 border border-cyber-warning/40 text-cyber-warning text-[10px] font-bold uppercase mb-1">
                Demonstration Mode
              </div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">
                Iris & Retinal Biometrics Station
              </h3>
              <p className="text-[11px] text-cyber-muted mt-1 leading-relaxed">
                Optical pupil localization and Gabor wavelet texture matching demonstration.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsIrisModalOpen(true)}
              className="w-full h-11 bg-cyber-elevated hover:bg-cyber-card border border-cyber-warning/50 text-cyber-warning font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-cyber-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Iris Optical Scanner HUD</span>
            </button>
          </div>
        )}

        {/* TAB 5: EMERGENCY RECOVERY KEY */}
        {activeTab === 'recovery' && (
          <form onSubmit={handleRecoveryUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-cyber-warning uppercase tracking-wider flex items-center gap-1.5">
                  <LifeBuoy className="w-3.5 h-3.5 text-cyber-warning" />
                  <span>256-Bit Emergency Recovery Key</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('password')}
                  className="text-[11px] text-cyber-cyan hover:underline"
                >
                  Use password
                </button>
              </div>

              <textarea
                value={recoveryKeyInput}
                onChange={(e) => {
                  setRecoveryKeyInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Paste your 64-character hex or hyphenated recovery key..."
                rows={3}
                required
                className="w-full p-3 bg-cyber-bgSecondary border border-cyber-border rounded-xl text-xs font-mono text-white placeholder-cyber-muted/40 focus:outline-none focus:border-cyber-warning transition-colors resize-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isUnlocking || !recoveryKeyInput}
              className="w-full h-11 bg-cyber-warning hover:bg-cyber-warning/80 disabled:opacity-50 text-black font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-cyber transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Unwrap with Recovery Key</span>
            </button>
          </form>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-cyber-danger/10 border border-cyber-danger/40 text-cyber-danger text-xs font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-cyber-border/60 flex items-center justify-between text-[11px] text-cyber-muted font-mono">
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="hover:text-cyber-cyan transition-colors"
          >
            Create new vault
          </button>
          <span className="flex items-center gap-1 text-cyber-cyan">
            <Shield className="w-3 h-3" />
            <span>XChaCha20-Poly1305</span>
          </span>
        </div>
      </div>

      {/* Iris Scanner Modal */}
      <IrisScannerModal
        isOpen={isIrisModalOpen}
        onClose={() => setIsIrisModalOpen(false)}
        onScanComplete={() => {
          setIsIrisModalOpen(false);
        }}
      />
    </div>
  );
};

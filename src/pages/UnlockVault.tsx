import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { VaultForgeLogo } from '../components/common/VaultForgeLogo';
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
  Sparkles
} from 'lucide-react';

interface UnlockVaultProps {
  onNavigate: (tab: string) => void;
}

export const UnlockVault: React.FC<UnlockVaultProps> = ({ onNavigate }) => {
  const { availableVaults, unlockVault, unlockWithRecoveryKey, refreshVaults, isDemoMode, setDemoMode } = useVaultStore();

  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsOn, setIsCapsOn] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(0);

  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    refreshVaults();
  }, [refreshVaults]);

  useEffect(() => {
    if (availableVaults.length > 0 && !selectedVaultId) {
      setSelectedVaultId(availableVaults[0].id);
    }
  }, [availableVaults, selectedVaultId]);

  // Throttling countdown timer for repeated failed attempts
  useEffect(() => {
    if (delaySeconds > 0) {
      const timer = setTimeout(() => setDelaySeconds(delaySeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [delaySeconds]);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setIsCapsOn(e.getModifierState('CapsLock'));
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delaySeconds > 0) return;

    setIsUnlocking(true);
    setErrorMsg(null);

    try {
      if (useRecovery) {
        // Strip dashes and spaces
        const cleanRecoveryKey = recoveryKeyInput.replace(/[- ]/g, '').toLowerCase();
        const success = await unlockWithRecoveryKey(selectedVaultId, cleanRecoveryKey);
        if (success) {
          onNavigate('dashboard');
        } else {
          setErrorMsg('Invalid recovery key. Authentication failed.');
        }
      } else {
        const success = await unlockVault(selectedVaultId, password);
        if (success) {
          onNavigate('dashboard');
        } else {
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          if (nextAttempts >= 3) {
            setDelaySeconds(Math.min(30, Math.pow(2, nextAttempts - 2)));
          }
          setErrorMsg('Authentication failed: Master password incorrect or vault corrupted.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setIsUnlocking(false);
    }
  };

  const selectedVault = availableVaults.find((v) => v.id === selectedVaultId);

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <VaultForgeLogo size="lg" className="justify-center mb-3" />
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Unlock Encrypted Vault
        </h2>
        <p className="text-xs text-cyber-muted font-mono mt-1">
          Memory-hard Argon2id key derivation & authenticated envelope
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border shadow-cyber relative">
        {/* Caps Lock warning */}
        {isCapsOn && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-cyber-warning/15 border border-cyber-warning/40 text-cyber-warning text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Caps Lock is ON</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-cyber-danger/10 border border-cyber-danger/40 text-cyber-danger text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Failed attempt delay throttling banner */}
        {delaySeconds > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-cyber-danger/15 border border-cyber-danger/40 text-cyber-danger text-xs font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Throttled: Please wait {delaySeconds}s before retrying.</span>
          </div>
        )}

        {availableVaults.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-xs text-cyber-muted font-mono">
              No local vaults found on this browser profile.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white font-mono text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <span>Create New Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="pt-2">
              <button
                onClick={() => setDemoMode(true, 'healthy')}
                className="text-xs font-mono text-cyber-cyan hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Demo Sandbox</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="space-y-5">
            {/* Vault selector if multiple vaults exist */}
            {availableVaults.length > 1 && (
              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Select Vault
                </label>
                <select
                  value={selectedVaultId}
                  onChange={(e) => setSelectedVaultId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono focus:border-cyber-cyan focus:outline-none"
                >
                  {availableVaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Created {new Date(v.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!useRecovery ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-cyber-muted uppercase tracking-wider">
                    Master Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseRecovery(true)}
                    className="text-[11px] font-mono text-cyber-cyan hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyUp}
                    placeholder="Enter vault master password"
                    disabled={delaySeconds > 0}
                    className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white font-mono text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>Emergency Recovery Key</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseRecovery(false)}
                    className="text-[11px] font-mono text-cyber-muted hover:underline"
                  >
                    Use Password
                  </button>
                </div>
                <textarea
                  value={recoveryKeyInput}
                  onChange={(e) => setRecoveryKeyInput(e.target.value)}
                  placeholder="Paste 256-bit recovery key (64 hex characters or hyphenated blocks)"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white font-mono text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isUnlocking || delaySeconds > 0 || (!password && !recoveryKeyInput)}
              className="w-full py-3.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-cyber hover:shadow-cyber-glow"
            >
              {isUnlocking ? (
                <span>Deriving Key & Unwrapping DEK...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{useRecovery ? 'Recover & Unlock' : 'Unlock Vault'}</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-cyber-muted border-t border-cyber-border/40">
              <button
                type="button"
                onClick={() => onNavigate('create')}
                className="hover:text-cyber-cyan transition-colors"
              >
                + Create Another Vault
              </button>
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="hover:text-white transition-colors"
              >
                Back to Home
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

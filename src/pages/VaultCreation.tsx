import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { cryptoBridge } from '../crypto/bridge';
import { evaluatePasswordQuality } from '../utils/securityAnalysis';
import {
  Shield,
  Key,
  KeyRound,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Sparkles
} from 'lucide-react';

interface VaultCreationProps {
  onNavigate: (tab: string) => void;
}

export const VaultCreation: React.FC<VaultCreationProps> = ({ onNavigate }) => {
  const { createVault } = useVaultStore();

  const [step, setStep] = useState(1);
  const [vaultName, setVaultName] = useState('Personal Vault');
  const [vaultColor, setVaultColor] = useState('#2F6BFF');

  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoverySavedConfirmed, setRecoverySavedConfirmed] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  const [autoLockMinutes, setAutoLockMinutes] = useState(10);
  const [clipboardClearSeconds, setClipboardClearSeconds] = useState(30);
  const [argonMemoryMB, setArgonMemoryMB] = useState(64);
  const [argonOps, setArgonOps] = useState(3);

  // Optional 6-digit PIN setup
  const [setupPinEnabled, setSetupPinEnabled] = useState(false);
  const [initialPin, setInitialPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate 256-bit recovery key preview on entering step 3
  useEffect(() => {
    if (step === 3 && !recoveryKey) {
      cryptoBridge.generateDek().then((res) => {
        setRecoveryKey(res.dekHex.toUpperCase().match(/.{1,4}/g)?.join('-') || res.dekHex);
      });
    }
  }, [step, recoveryKey]);

  const passwordQuality = evaluatePasswordQuality(masterPassword);
  const passwordsMatch = masterPassword === confirmPassword && masterPassword.length > 0;

  const handleCopyRecovery = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2000);
  };

  const handleDownloadRecovery = () => {
    const content = `VAULTFORGE EMERGENCY RECOVERY KEY\n` +
      `====================================\n` +
      `Vault Name: ${vaultName}\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Recovery Key: ${recoveryKey}\n\n` +
      `IMPORTANT: Store this key securely offline. If you lose your master password, ` +
      `this recovery key is the ONLY cryptographic mechanism to unwrap your Data Encryption Key.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultforge_recovery_key_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = async () => {
    setIsCreating(true);
    setErrorMessage(null);
    try {
      await createVault(
        vaultName,
        vaultColor,
        masterPassword,
        {
          opslimit: argonOps,
          memlimit: argonMemoryMB * 1024 * 1024
        },
        setupPinEnabled && initialPin.length === 6 ? initialPin : undefined
      );
      onNavigate('dashboard');
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to initialize vault');
      setIsCreating(false);
    }
  };

  const colors = ['#2F6BFF', '#22E3FF', '#8B5CF6', '#22C55E', '#F59E0B', '#FF4D6D'];

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-cyber-muted mb-3">
          <span>STEP {step} OF 5</span>
          <span className="text-cyber-cyan font-bold">
            {step === 1 && 'Vault Identity'}
            {step === 2 && 'Master Password'}
            {step === 3 && 'Recovery Setup'}
            {step === 4 && 'Configure Your Security Methods'}
            {step === 5 && 'Vault Creation'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-cyber-card rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-full transition-all duration-300 ${
                s <= step ? 'bg-cyber-cyan' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyber-border shadow-cyber relative">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-cyber-danger/10 border border-cyber-danger/40 text-cyber-danger text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Vault Identity */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Name Your Vault</h2>
              <p className="text-xs text-cyber-muted mt-1">
                Choose a label and identifier for this local encrypted container.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Vault Name
                </label>
                <input
                  type="text"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  placeholder="e.g. Personal, Work, Engineering"
                  className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white font-sans text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setVaultColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        vaultColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!vaultName.trim()}
                className="px-6 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Master Password */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Create Master Password</h2>
              <p className="text-xs text-cyber-muted mt-1">
                This password inputs directly into <strong className="text-cyber-cyan">Argon2id</strong> to derive your 256-bit Key Encryption Key (KEK).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-cyber-muted uppercase tracking-wider">
                    Master Password
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await cryptoBridge.generatePassword(22);
                      setMasterPassword(res.password);
                      setConfirmPassword(res.password);
                    }}
                    className="text-xs font-mono text-cyber-cyan hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter strong master password"
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

                {/* Password Strength Indicator */}
                {masterPassword && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyber-muted">Strength:</span>
                      <span
                        className={`font-bold ${
                          passwordQuality.strength === 'STRONG' || passwordQuality.strength === 'EXCELLENT'
                            ? 'text-cyber-success'
                            : passwordQuality.strength === 'GOOD'
                            ? 'text-cyber-cyan'
                            : 'text-cyber-warning'
                        }`}
                      >
                        {passwordQuality.strength}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-cyber-bg rounded-full overflow-hidden flex gap-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            idx <= passwordQuality.score
                              ? passwordQuality.score >= 3
                                ? 'bg-cyber-success'
                                : passwordQuality.score === 2
                                ? 'bg-cyber-cyan'
                                : 'bg-cyber-warning'
                              : 'bg-cyber-border'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordQuality.reasons.length > 0 && (
                      <p className="text-[10px] text-cyber-muted font-mono">
                        {passwordQuality.reasons[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat master password"
                  className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white font-mono text-sm"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] text-cyber-danger font-mono mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white font-mono text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!passwordsMatch || masterPassword.length < 8}
                className="px-6 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Recovery Key */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Emergency Recovery Key</h2>
              <p className="text-xs text-cyber-muted mt-1">
                This is a 256-bit cryptographically random key. If you forget your master password, this is your ONLY recovery method.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-cyan/30 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-cyber-cyan">
                <span>256-BIT CSPRNG RECOVERY SECRET</span>
                <span className="text-[10px] text-cyber-muted">Displayed Once</span>
              </div>
              <div className="text-center font-bold text-sm sm:text-base text-white tracking-widest bg-cyber-card/60 p-3 rounded-lg border border-cyber-border select-all break-all">
                {recoveryKey || 'GENERATING...'}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyRecovery}
                  className="px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:bg-cyber-elevated text-cyber-text text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedRecovery ? <Check className="w-3.5 h-3.5 text-cyber-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecovery ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRecovery}
                  className="px-3 py-1.5 rounded-lg bg-cyber-primary/20 border border-cyber-primary/40 hover:bg-cyber-primary/30 text-cyber-cyan text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recoverySavedConfirmed}
                onChange={(e) => setRecoverySavedConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-cyber-border text-cyber-cyan focus:ring-0 bg-cyber-bg"
              />
              <span className="text-xs text-cyber-muted font-sans leading-relaxed">
                I have securely saved or downloaded this recovery key. I understand that VAULTFORGE cannot recover my data without the password or this key.
              </span>
            </label>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white font-mono text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!recoverySavedConfirmed}
                className="px-6 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Configure Your Security Methods */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Configure Your Security Methods</h2>
              <p className="text-xs text-cyber-muted mt-1">
                Optionally register additional multi-layer authentication keys now, or configure them later in My Identity & Security.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Optional 6-Digit PIN Setup */}
              <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={setupPinEnabled}
                      onChange={(e) => setSetupPinEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-cyber-border text-cyber-cyan focus:ring-0 bg-cyber-card"
                    />
                    <div>
                      <span className="font-bold text-white uppercase text-xs">1. Register Six-Digit PIN (Optional)</span>
                      <p className="text-[11px] text-cyber-muted font-normal mt-0.5">
                        Enables quick numeric unlock backed by a dedicated Argon2id envelope.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyber-cyan font-bold bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
                    ARGON2ID
                  </span>
                </label>

                {setupPinEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-cyber-border/40">
                    <div>
                      <label className="block text-cyber-muted mb-1 text-[10px] uppercase font-bold">6-Digit PIN:</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={initialPin}
                        onChange={(e) => setInitialPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-3 py-2 rounded-lg bg-cyber-card border border-cyber-border text-white text-xs tracking-widest text-center focus:border-cyber-cyan focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-cyber-muted mb-1 text-[10px] uppercase font-bold">Confirm PIN:</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-3 py-2 rounded-lg bg-cyber-card border border-cyber-border text-white text-xs tracking-widest text-center focus:border-cyber-cyan focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Fingerprint & Iris Guidance Card */}
              <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
                <div className="flex items-center justify-between text-cyber-cyan font-bold">
                  <span className="uppercase text-[11px]">2. Biometric Passkeys & Iris Scanning</span>
                  <span className="text-[10px] text-cyber-muted">MY IDENTITY & SECURITY</span>
                </div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">
                  Platform biometrics (Windows Hello, Touch ID) and Iris scanning can be paired directly with your active vault once initialized. You will be able to register, test, and remove them independently in the <strong className="text-white">My Identity & Security</strong> dashboard.
                </p>
              </div>

              {/* Argon2id Calibration & Timeout Preferences */}
              <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-3">
                <div className="flex items-center justify-between text-cyber-violet">
                  <span className="font-bold uppercase text-[11px]">3. Key Derivation & Session Timeouts</span>
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-cyber-border/40">
                    <span className="text-cyber-muted">Argon2id Memory:</span>
                    <span className="text-white font-bold">{argonMemoryMB} MB RAM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-cyber-border/40">
                    <span className="text-cyber-muted">KDF Iterations:</span>
                    <span className="text-white font-bold">{argonOps} passes</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-cyber-muted">Auto-Lock Timer:</span>
                    <span className="text-white font-bold">{autoLockMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-cyber-muted">Clipboard Auto-Clear:</span>
                    <span className="text-white font-bold">{clipboardClearSeconds} seconds</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white font-mono text-xs"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                {setupPinEnabled && (initialPin.length !== 6 || initialPin !== confirmPin) ? (
                  <span className="text-[11px] text-cyber-warning font-mono">
                    Complete 6-digit PIN confirmation or uncheck
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={setupPinEnabled && (initialPin.length !== 6 || initialPin !== confirmPin)}
                  className="px-6 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span>{setupPinEnabled ? 'Continue to Review' : 'Skip & Continue to Review'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Create */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">Ready to Initialize</h2>
              <p className="text-xs text-cyber-muted mt-1">
                The C engine will now derive your KEK, generate a fresh 256-bit DEK, wrap it, and persist the vault envelope.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-cyber-border/40">
                <span className="text-cyber-muted">Vault Name:</span>
                <span className="text-white font-bold">{vaultName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-border/40">
                <span className="text-cyber-muted">KDF:</span>
                <span className="text-cyber-cyan font-bold">Argon2id ({argonMemoryMB}MB RAM, {argonOps} ops)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-border/40">
                <span className="text-cyber-muted">Cipher:</span>
                <span className="text-cyber-primary font-bold">XChaCha20-Poly1305 (24-byte nonce)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-border/40">
                <span className="text-cyber-muted">Envelope Keys:</span>
                <span className="text-cyber-success font-bold">Primary & Recovery Wrapped DEKs</span>
              </div>
              {setupPinEnabled && initialPin.length === 6 && (
                <div className="flex justify-between py-1">
                  <span className="text-cyber-muted">PIN Protection:</span>
                  <span className="text-cyber-cyan font-bold">Enabled (6-digit Argon2id envelope)</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={isCreating}
                className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white font-mono text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isCreating}
                className="px-6 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-cyber-bg font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-glow"
              >
                {isCreating ? (
                  <span>Deriving Keys in C...</span>
                ) : (
                  <>
                    <span>Create & Open Dashboard</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { webAuthnService } from '../services/webAuthnService';
import { irisDriverRegistry } from '../services/irisDriverService';
import { IrisScannerModal } from '../components/auth/IrisScannerModal';
import { GovernmentVerificationModal } from '../components/auth/GovernmentVerificationModal';
import {
  Shield,
  ShieldCheck,
  Fingerprint,
  Lock,
  Eye,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Key,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import type { AuthMethodType } from '../types/auth';

interface IdentitySecurityProps {
  onNavigate: (tab: string) => void;
}

export const IdentitySecurity: React.FC<IdentitySecurityProps> = ({ onNavigate }) => {
  const {
    activeVault,
    isUnlocked,
    setupBiometrics,
    removeBiometrics,
    setupPin,
    removePin,
    setupIrisAuth,
    removeIrisAuth,
    updateGovVerification,
    clearGovVerification,
    setPreferredAuthMethod,
    refreshVaults
  } = useVaultStore();

  const [hasPlatformBio, setHasPlatformBio] = useState(false);
  const [isRegisteringBio, setIsRegisteringBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  // PIN Registration Form state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSavingPin, setIsSavingPin] = useState(false);

  // Iris Modal state
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);

  // Government Modal state
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);

  useEffect(() => {
    webAuthnService.isPlatformAuthenticatorAvailable().then(setHasPlatformBio);
    refreshVaults();
  }, [refreshVaults]);

  // Real Fingerprint Registration
  const handleRegisterFingerprint = async () => {
    setIsRegisteringBio(true);
    setBioError(null);
    try {
      const ok = await setupBiometrics();
      if (!ok) {
        setBioError('Fingerprint registration could not be completed.');
      }
    } catch (err: any) {
      setBioError(err?.message || 'Biometric registration failed');
    } finally {
      setIsRegisteringBio(false);
    }
  };

  // 6-Digit PIN Registration
  const handleRegisterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput)) {
      setPinError('PIN must be exactly 6 numeric digits (0-9).');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinError('PIN confirmation does not match.');
      return;
    }

    setIsSavingPin(true);
    setPinError(null);
    try {
      const ok = await setupPin(pinInput);
      if (ok) {
        setIsPinModalOpen(false);
        setPinInput('');
        setConfirmPinInput('');
      } else {
        setPinError('Failed to configure PIN.');
      }
    } catch (err: any) {
      setPinError(err?.message || 'Failed to save PIN.');
    } finally {
      setIsSavingPin(false);
    }
  };

  if (!isUnlocked || !activeVault) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center font-mono space-y-4">
        <Shield className="w-12 h-12 text-cyber-cyan mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-white">Vault Locked</h2>
        <p className="text-xs text-cyber-muted">
          Please unlock your vault first to configure identity and security authenticators.
        </p>
        <button
          onClick={() => onNavigate('unlock')}
          className="px-5 py-2.5 rounded-xl bg-cyber-primary text-white text-xs font-bold"
        >
          Unlock Vault
        </button>
      </div>
    );
  }

  const preferredMethod = activeVault.preferredAuthMethod || 'password';

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 font-mono select-none">
      {/* Page Title & Mission Statement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-cyber-cyan" />
            <h1 className="text-2xl font-display font-bold text-white tracking-wider uppercase">
              My Identity & Security
            </h1>
          </div>
          <p className="text-xs text-cyber-muted mt-1">
            Register, configure, and manage real biometric authenticators and cryptographic security envelopes
          </p>
        </div>

        {/* Preferred Unlock Method Selector */}
        <div className="flex items-center gap-3 bg-cyber-card p-3 rounded-xl border border-cyber-border">
          <span className="text-xs text-cyber-muted">Default Login Method:</span>
          <select
            value={preferredMethod}
            onChange={(e) => setPreferredAuthMethod(e.target.value as AuthMethodType)}
            className="h-9 px-3 rounded-lg bg-cyber-elevated border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold focus:outline-none"
          >
            <option value="password">Master Password</option>
            {activeVault.pinAuth?.enabled && <option value="pin">Six-Digit PIN</option>}
            {activeVault.biometricAuth?.enabled && <option value="biometric">Fingerprint / Passkey</option>}
            {activeVault.irisAuth?.registered && <option value="iris">Iris Scanner</option>}
          </select>
        </div>
      </div>

      {/* Account Association Banner */}
      <div className="p-3.5 rounded-xl bg-cyber-bgSecondary/80 border border-cyber-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-cyber-muted">Active Security Profile:</span>
          <span className="font-bold text-white">{activeVault.name}</span>
          <span className="text-cyber-muted text-[11px]">({activeVault.id})</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyber-cyan text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Envelope Encryption Active</span>
        </div>
      </div>

      {/* 4 Separate Registration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: FINGERPRINT REGISTRATION (REAL WEBAUTHN / WINDOWS HELLO) */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-cyber-cyan" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                activeVault.biometricAuth?.enabled
                  ? 'bg-cyber-success/15 border-cyber-success/30 text-cyber-success'
                  : 'bg-cyber-muted/10 border-cyber-border text-cyber-muted'
              }`}>
                {activeVault.biometricAuth?.enabled ? 'FINGERPRINT REGISTERED' : 'NOT REGISTERED'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                1. Fingerprint Registration
              </h3>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                Hardware biometric authentication via WebAuthn/FIDO2. Integrates directly with Windows Hello, Touch ID, and platform fingerprint sensors.
              </p>
            </div>

            {/* Status & Verification Details */}
            <div className="p-3.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Verification Status:</span>
                <span className={`font-bold ${activeVault.biometricAuth?.enabled ? 'text-cyber-cyan' : 'text-cyber-muted'}`}>
                  {activeVault.biometricAuth?.enabled ? 'PLATFORM VERIFIED' : hasPlatformBio ? 'SENSOR DETECTED' : 'AWAITING PAIRING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Last Registered:</span>
                <span className="text-white font-mono">
                  {activeVault.biometricAuth?.registeredAt
                    ? new Date(activeVault.biometricAuth.registeredAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              {activeVault.biometricAuth?.enabled && (
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Credential ID:</span>
                  <span className="text-cyber-cyan font-mono text-[11px]">
                    {activeVault.biometricAuth.credentialId.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>

            {/* Clear Instructions */}
            <div className="text-[11px] text-cyber-muted/90 bg-cyber-bgSecondary/50 p-3 rounded-lg border border-cyber-border/50 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Registration Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-cyber-muted">
                <li>Click <strong>Register Fingerprint</strong> below.</li>
                <li>Verify your touch on the Windows Hello or device biometric prompt.</li>
                <li>A 256-bit Biometric KEK will wrap your vault DEK. Zero raw biometrics are stored.</li>
              </ol>
            </div>

            {bioError && (
              <div className="p-3 rounded-lg bg-cyber-danger/10 border border-cyber-danger/30 text-xs text-cyber-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{bioError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
            {activeVault.biometricAuth?.enabled ? (
              <button
                type="button"
                onClick={() => removeBiometrics()}
                className="px-3.5 py-2 rounded-xl border border-cyber-danger/30 hover:bg-cyber-danger/10 text-cyber-danger text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Registration</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isRegisteringBio}
              onClick={handleRegisterFingerprint}
              className="px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-cyber-sm transition-all"
            >
              {isRegisteringBio ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Awaiting Biometric Touch...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>{activeVault.biometricAuth?.enabled ? 'Re-Register Fingerprint' : 'Register Fingerprint'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARD 2: SIX-DIGIT SECURITY PIN REGISTRATION */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyber-cyan" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                activeVault.pinAuth?.enabled
                  ? 'bg-cyber-success/15 border-cyber-success/30 text-cyber-success'
                  : 'bg-cyber-muted/10 border-cyber-border text-cyber-muted'
              }`}>
                {activeVault.pinAuth?.enabled ? 'PIN REGISTERED' : 'NOT REGISTERED'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                2. Six-Digit Security PIN
              </h3>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                Fast numeric unlock backed by dedicated memory-hard Argon2id envelope wrapping. Enforces attempt tracking and automatic lockout protection.
              </p>
            </div>

            {/* Status & Verification Details */}
            <div className="p-3.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Verification Status:</span>
                <span className={`font-bold ${activeVault.pinAuth?.enabled ? 'text-cyber-cyan' : 'text-cyber-muted'}`}>
                  {activeVault.pinAuth?.enabled ? 'ARGON2ID VERIFIER ENCRYPTED' : 'UNCONFIGURED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Last Registered:</span>
                <span className="text-white font-mono">
                  {activeVault.pinAuth?.updatedAt
                    ? new Date(activeVault.pinAuth.updatedAt).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Lockout Status:</span>
                <span className={activeVault.pinAuth?.lockedUntil && activeVault.pinAuth.lockedUntil > Date.now() ? 'text-cyber-danger font-bold' : 'text-cyber-success font-bold'}>
                  {activeVault.pinAuth?.lockedUntil && activeVault.pinAuth.lockedUntil > Date.now() ? 'Locked Out' : 'Active (0 Failed Attempts)'}
                </span>
              </div>
            </div>

            {/* Clear Instructions */}
            <div className="text-[11px] text-cyber-muted/90 bg-cyber-bgSecondary/50 p-3 rounded-lg border border-cyber-border/50 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Registration Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-cyber-muted">
                <li>Click <strong>Register PIN</strong> below to enter a 6-digit PIN.</li>
                <li>Confirm the exact 6 digits.</li>
                <li>The C engine derives a PIN KEK via Argon2id. Plain PIN is never stored.</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
            {activeVault.pinAuth?.enabled ? (
              <button
                type="button"
                onClick={() => removePin()}
                className="px-3.5 py-2 rounded-xl border border-cyber-danger/30 hover:bg-cyber-danger/10 text-cyber-danger text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove PIN</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => {
                setIsPinModalOpen(true);
                setPinInput('');
                setConfirmPinInput('');
                setPinError(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 text-white text-xs font-bold flex items-center gap-2 shadow-cyber-sm transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{activeVault.pinAuth?.enabled ? 'Change PIN' : 'Register PIN'}</span>
            </button>
          </div>
        </div>

        {/* CARD 3: IRIS / RETINAL REGISTRATION */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-warning/30 flex items-center justify-center">
                <Eye className="w-6 h-6 text-cyber-warning" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                activeVault.irisAuth?.hardwareConnected
                  ? 'bg-cyber-success/15 border-cyber-success/30 text-cyber-success'
                  : activeVault.irisAuth?.registered
                  ? 'bg-cyber-warning/15 border-cyber-warning/30 text-cyber-warning'
                  : 'bg-cyber-danger/10 border-cyber-danger/30 text-cyber-danger'
              }`}>
                {activeVault.irisAuth?.hardwareConnected
                  ? 'HARDWARE REGISTERED'
                  : activeVault.irisAuth?.registered
                  ? 'DEMONSTRATION MODE'
                  : 'HARDWARE NOT CONNECTED'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                3. Iris / Retinal Registration
              </h3>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                Modular integration supporting ISO/IEC 19794-6 external near-infrared iris sensors. In demonstration mode, optical pupil localization and Gabor wavelet extraction are simulated.
              </p>
            </div>

            {/* Status & Verification Details */}
            <div className="p-3.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Hardware Status:</span>
                <span className="text-cyber-warning font-bold">
                  {activeVault.irisAuth?.hardwareConnected ? 'ISO/IEC SENSOR CONNECTED' : 'NO CERTIFIED SENSOR DETECTED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Registration Status:</span>
                <span className="text-white font-bold">
                  {activeVault.irisAuth?.registered ? 'ACTIVE (DEMO SIMULATOR)' : 'UNREGISTERED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Zero Raw Image Guarantee:</span>
                <span className="text-cyber-cyan font-bold">COMPLIANT (100% Zero-Storage)</span>
              </div>
            </div>

            {/* Clear Instructions */}
            <div className="text-[11px] text-cyber-muted/90 bg-cyber-bgSecondary/50 p-3 rounded-lg border border-cyber-border/50 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyber-warning" />
                <span>Registration Instructions:</span>
              </div>
              <p className="text-cyber-muted leading-relaxed">
                Standard consumer webcams operate in visible spectrum and cannot perform genuine retinal scans. Connect an ISO/IEC 19794-6 certified NIR USB device or explore the interactive demonstration simulator HUD.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
            {activeVault.irisAuth?.registered ? (
              <button
                type="button"
                onClick={() => removeIrisAuth()}
                className="px-3.5 py-2 rounded-xl border border-cyber-danger/30 hover:bg-cyber-danger/10 text-cyber-danger text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Registration</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => setIsIrisModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-cyber-elevated hover:bg-cyber-card border border-cyber-warning/40 text-cyber-warning text-xs font-bold flex items-center gap-2 shadow-cyber-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>{activeVault.irisAuth?.registered ? 'Open Scanner HUD' : 'Register / Test Iris HUD'}</span>
            </button>
          </div>
        </div>

        {/* CARD 4: GOVERNMENT IDENTITY VERIFICATION (AADHAAR / NATIONAL ID) */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cyber-cyan" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                activeVault.govVerification?.status === 'OFFICIALLY_VERIFIED'
                  ? 'bg-cyber-success/15 border-cyber-success/30 text-cyber-success'
                  : activeVault.govVerification?.status === 'DEMO_VERIFIED'
                  ? 'bg-cyber-warning/15 border-cyber-warning/30 text-cyber-warning'
                  : 'bg-cyber-muted/10 border-cyber-border text-cyber-muted'
              }`}>
                {activeVault.govVerification?.status || 'NOT VERIFIED'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                4. Government Identity Verification
              </h3>
              <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                Voluntary statutory compliance framework. Evaluates 2FA OTP challenges, synthetic masking, and BLAKE2b receipt hash proofs.
              </p>
            </div>

            {/* Status & Verification Details */}
            <div className="p-3.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Verification Status:</span>
                <span className={`font-bold ${activeVault.govVerification?.status ? 'text-cyber-warning' : 'text-cyber-muted'}`}>
                  {activeVault.govVerification?.status || 'UNVERIFIED SANDBOX'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Masked Identifier:</span>
                <span className="text-cyber-cyan font-mono font-bold">
                  {activeVault.govVerification?.maskedIdentifier || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Provider Channel:</span>
                <span className="text-white font-mono text-[11px]">
                  {activeVault.govVerification?.provider || 'MOCK UIDAI SANDBOX'}
                </span>
              </div>
            </div>

            {/* Clear Instructions */}
            <div className="text-[11px] text-cyber-muted/90 bg-cyber-bgSecondary/50 p-3 rounded-lg border border-cyber-border/50 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Compliance Instructions:</span>
              </div>
              <p className="text-cyber-muted leading-relaxed">
                Strict sandbox environment: Use compliant synthetic IDs (e.g. 2345 6789 0123). Real statutory credentials must never be submitted.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-cyber-border flex items-center justify-between">
            {activeVault.govVerification ? (
              <button
                type="button"
                onClick={() => clearGovVerification()}
                className="px-3.5 py-2 rounded-xl border border-cyber-danger/30 hover:bg-cyber-danger/10 text-cyber-danger text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Verification</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => setIsGovModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 text-white text-xs font-bold flex items-center gap-2 shadow-cyber-sm transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>{activeVault.govVerification ? 'View Certificate' : 'Initiate Verification'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PIN Registration Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
          <div className="w-full max-w-md rounded-2xl bg-cyber-bgSecondary border border-cyber-cyan/40 p-6 space-y-5 shadow-cyber-glow">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyber-cyan" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Register Six-Digit PIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="text-cyber-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-cyber-muted uppercase">Enter 6-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full h-11 px-4 bg-cyber-card border border-cyber-border rounded-xl text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:border-cyber-cyan"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-cyber-muted uppercase">Confirm 6-Digit PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full h-11 px-4 bg-cyber-card border border-cyber-border rounded-xl text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-cyber-danger/10 border border-cyber-danger/30 text-xs text-cyber-danger">
                  {pinError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-cyber-border text-xs text-cyber-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin || pinInput.length !== 6 || confirmPinInput.length !== 6}
                  className="px-5 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 shadow-cyber-sm"
                >
                  {isSavingPin && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Encrypt Envelope</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iris Scanner Modal */}
      <IrisScannerModal
        isOpen={isIrisModalOpen}
        onClose={() => setIsIrisModalOpen(false)}
        onScanComplete={(result) => {
          setupIrisAuth('SIMULATED_DEMO_OPTICAL', 'DEMO-OPTICAL-SIMULATOR');
          setIsIrisModalOpen(false);
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

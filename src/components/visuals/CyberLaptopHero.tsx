import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Fingerprint,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  LifeBuoy,
  RefreshCw,
  AlertTriangle,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { useVaultStore } from '../../store/vaultStore';
import { PinKeypad } from '../auth/PinKeypad';
import { IrisScannerModal } from '../auth/IrisScannerModal';
import type { AuthMethodType } from '../../types/auth';

interface CyberLaptopHeroProps {
  isEnteringLogin: boolean;
  onCloseLogin: () => void;
  onLoginSuccess: () => void;
  onOpenLogin: () => void;
}

export const CyberLaptopHero: React.FC<CyberLaptopHeroProps> = ({
  isEnteringLogin,
  onCloseLogin,
  onLoginSuccess,
  onOpenLogin
}) => {
  const {
    availableVaults,
    unlockVault,
    unlockWithRecoveryKey,
    unlockWithPin,
    unlockWithBiometrics,
    unlockWithIris,
    refreshVaults
  } = useVaultStore();

  // Mouse tilt coordinates for 3D parallax
  const [tilt, setTilt] = useState({ rotateX: 12, rotateY: -16 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Authentication State inside the Laptop Screen
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [activeAuthTab, setActiveAuthTab] = useState<AuthMethodType>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);

  useEffect(() => {
    refreshVaults();
  }, [refreshVaults]);

  useEffect(() => {
    if (availableVaults.length > 0 && !selectedVaultId) {
      setSelectedVaultId(availableVaults[0].id);
    }
  }, [availableVaults, selectedVaultId]);

  const selectedVault = availableVaults.find((v) => v.id === selectedVaultId);

  // Auto-switch to vault's preferred method if registered
  useEffect(() => {
    if (selectedVault?.preferredAuthMethod) {
      if (selectedVault.preferredAuthMethod === 'pin' && selectedVault.pinAuth?.enabled) {
        setActiveAuthTab('pin');
      } else if (selectedVault.preferredAuthMethod === 'biometric' && selectedVault.biometricAuth?.enabled) {
        setActiveAuthTab('biometric');
      }
    }
  }, [selectedVault]);

  // Handle 3D Parallax Tilt based on mouse position (only when in hero view, not when zoomed in)
  useEffect(() => {
    if (isEnteringLogin) {
      setTilt({ rotateX: 0, rotateY: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Subtle, refined 3D tilt
      setTilt({
        rotateX: 10 - y * 9,
        rotateY: -14 + x * 12
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isEnteringLogin]);

  // Auth Handlers inside laptop
  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isUnlocking) return;
    setIsUnlocking(true);
    setAuthError(null);
    try {
      const ok = await unlockVault(selectedVaultId, password);
      if (ok) {
        onLoginSuccess();
      } else {
        setAuthError('Master password incorrect or corrupted envelope.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePinUnlock = async (pin: string) => {
    setIsUnlocking(true);
    setAuthError(null);
    try {
      const ok = await unlockWithPin(selectedVaultId, pin);
      if (ok) {
        onLoginSuccess();
      } else {
        setAuthError('Incorrect PIN.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'PIN unlock failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setIsUnlocking(true);
    setAuthError(null);
    try {
      const ok = await unlockWithBiometrics(selectedVaultId);
      if (ok) {
        onLoginSuccess();
      } else {
        setAuthError('Biometric verification failed.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Biometric authentication cancelled');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleRecoveryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput || isUnlocking) return;
    setIsUnlocking(true);
    setAuthError(null);
    try {
      const clean = recoveryInput.replace(/[- ]/g, '').toLowerCase();
      const ok = await unlockWithRecoveryKey(selectedVaultId, clean);
      if (ok) {
        onLoginSuccess();
      } else {
        setAuthError('Invalid emergency recovery key.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Recovery unwrap failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Registered methods for current account
  const hasBiometric = !!selectedVault?.biometricAuth?.enabled;
  const hasPin = !!selectedVault?.pinAuth?.enabled;
  const hasIris = !!selectedVault?.irisAuth?.registered;

  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-all duration-700 flex items-center justify-center ${
        isEnteringLogin
          ? 'fixed inset-0 z-50 bg-[#02050E]/95 backdrop-blur-xl p-4 sm:p-8'
          : 'h-[500px] lg:h-[580px]'
      }`}
      style={{ perspective: isEnteringLogin ? 1800 : 1300 }}
    >
      {/* Background ambient glow pulse behind laptop */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-1000 ${
          isEnteringLogin
            ? 'w-[850px] h-[850px] bg-gradient-to-tr from-cyber-primary/20 via-cyber-cyan/15 to-cyber-violet/25 blur-3xl opacity-80'
            : 'w-[480px] h-[340px] bg-gradient-to-tr from-cyber-primary/30 via-cyber-cyan/20 to-cyber-violet/30 blur-3xl opacity-60'
        }`}
      />

      {/* FLOATING 3D CARDS (Only visible in Hero Mode, fade out smoothly on Login Zoom) */}
      <AnimatePresence>
        {!isEnteringLogin && (
          <>
            {/* Card 1: Floating Encrypted Password Card (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              exit={{ opacity: 0, scale: 0.8, x: -60 }}
              transition={{
                y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
                duration: 0.6
              }}
              className="absolute left-2 sm:left-6 lg:left-10 top-14 sm:top-18 z-20 p-3 sm:p-4 rounded-2xl bg-cyber-bgSecondary/85 backdrop-blur-md border border-cyber-cyan/30 shadow-[0_0_25px_rgba(34,227,255,0.18)] max-w-[210px] sm:max-w-[240px] font-mono pointer-events-none"
            >
              <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2 mb-2">
                <span className="text-[10px] text-cyber-muted font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyber-cyan" />
                  <span>Encrypted Payload</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-cyber-success shadow-[0_0_6px_#22C55E]" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white">GitHub Enterprise Key</div>
                <div className="text-[11px] text-cyber-cyan tracking-widest">••••••••••••••••</div>
                <div className="text-[9px] text-cyber-muted truncate font-mono bg-cyber-bg p-1 rounded border border-cyber-border/40">
                  AEAD Tag: 9f4b6a6...0123
                </div>
              </div>
            </motion.div>

            {/* Card 2: Floating Rotating Biometric Fingerprint (Right) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
              exit={{ opacity: 0, scale: 0.8, x: 60 }}
              transition={{
                y: { repeat: Infinity, duration: 5.2, ease: 'easeInOut' },
                duration: 0.6
              }}
              className="absolute right-2 sm:right-6 lg:right-12 top-10 sm:top-14 z-20 p-4 rounded-2xl bg-cyber-bgSecondary/85 backdrop-blur-md border border-cyber-violet/40 shadow-[0_0_30px_rgba(139,92,246,0.22)] font-mono pointer-events-none text-center"
            >
              <div className="relative w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-cyber-violet/50 animate-spin" style={{ animationDuration: '9s' }} />
                <Fingerprint className="w-8 h-8 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#22E3FF]" />
              </div>
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">WebAuthn Active</div>
              <div className="text-[9px] text-cyber-violet mt-0.5">Windows Hello / Passkeys</div>
            </motion.div>

            {/* Card 3: Floating Holographic Security Shield Badge (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{
                y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut', delay: 0.5 },
                duration: 0.6
              }}
              className="absolute right-4 sm:right-16 bottom-8 sm:bottom-12 z-20 px-3.5 py-2.5 rounded-xl bg-cyber-bgSecondary/90 backdrop-blur-md border border-cyber-cyan/30 shadow-[0_0_20px_rgba(34,227,255,0.15)] font-mono text-[10px] flex items-center gap-2.5 pointer-events-none"
            >
              <Shield className="w-4 h-4 text-cyber-cyan shrink-0 animate-pulse" />
              <div>
                <div className="font-bold text-white">XChaCha20-Poly1305</div>
                <div className="text-[9px] text-cyber-muted">256-Bit Authenticated DEK</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3D FUTURISTIC COMPUTER / LAPTOP CONTAINER */}
      <motion.div
        animate={{
          rotateX: isEnteringLogin ? 0 : tilt.rotateX,
          rotateY: isEnteringLogin ? 0 : tilt.rotateY,
          scale: isEnteringLogin ? 1 : 0.94,
          z: isEnteringLogin ? 80 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: isEnteringLogin ? 75 : 90,
          damping: isEnteringLogin ? 18 : 22
        }}
        className={`relative transition-all duration-700 ${
          isEnteringLogin
            ? 'w-full max-w-2xl h-[560px] sm:h-[600px] z-50'
            : 'w-[90%] max-w-[620px] sm:max-w-[720px] cursor-pointer group'
        }`}
        onClick={() => {
          if (!isEnteringLogin) onOpenLogin();
        }}
      >
        {/* LAPTOP SCREEN LID */}
        <div
          className={`relative rounded-t-2xl sm:rounded-t-3xl border-2 transition-all duration-700 overflow-hidden ${
            isEnteringLogin
              ? 'rounded-b-2xl sm:rounded-b-3xl border-cyber-cyan/50 shadow-[0_0_60px_rgba(34,227,255,0.25)] h-full bg-[#050A18]'
              : 'border-cyber-cyan/30 group-hover:border-cyber-cyan/60 shadow-[0_0_40px_rgba(34,227,255,0.18)] bg-[#070D1F] h-[330px] sm:h-[390px]'
          }`}
        >
          {/* Top Screen Bezel & Web Camera Dot */}
          <div className="h-6 sm:h-7 bg-[#060B1A] border-b border-cyber-border/60 px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-danger/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-warning/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-success/70" />
            </div>

            {/* Camera Lens */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0F1B35] border border-cyber-cyan/40 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-cyber-cyan animate-pulse" />
              </div>
              <span className="text-[9px] font-mono font-bold text-cyber-muted/80 tracking-widest uppercase hidden sm:inline">
                VAULTFORGE STATION v2.0
              </span>
            </div>

            {/* Back to Home Button when in Login Mode */}
            {isEnteringLogin ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseLogin();
                }}
                className="text-[10px] font-mono text-cyber-cyan hover:text-white flex items-center gap-1 bg-cyber-elevated/70 px-2 py-0.5 rounded border border-cyber-cyan/30 hover:border-cyber-cyan transition-all"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Home</span>
              </button>
            ) : (
              <div className="text-[10px] font-mono text-cyber-cyan font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyber-cyan" />
                <span>SECURE</span>
              </div>
            )}
          </div>

          {/* SCREEN SCANNING LASER SWEEP (Triggered on login transition) */}
          {isEnteringLogin && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_20px_#22E3FF] pointer-events-none z-30"
            />
          )}

          {/* ======================================================== */}
          {/* VIEW A: HERO LAPTOP DISPLAY (When on Landing Page)       */}
          {/* ======================================================== */}
          {!isEnteringLogin && (
            <div className="p-4 sm:p-6 h-[calc(100%-28px)] flex flex-col justify-between font-mono select-none relative overflow-hidden bg-gradient-to-b from-[#080E24] via-[#050A18] to-[#040713]">
              {/* Subtle background matrix lines */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#22E3FF_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Screen Top Bar */}
              <div className="flex items-center justify-between text-[11px] border-b border-cyber-border/40 pb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                  <span className="text-white font-bold tracking-wider">C11 CRYPTOGRAPHIC WORKSTATION</span>
                </div>
                <span className="text-cyber-cyan text-[10px] bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
                  AES-256 / XCHACHA20
                </span>
              </div>

              {/* Console Data Stream & Live Telemetry Mock */}
              <div className="space-y-2 relative z-10 py-1">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-cyber-bg/80 border border-cyber-border/60">
                    <span className="text-cyber-muted block">Argon2id KDF:</span>
                    <span className="text-cyber-cyan font-bold">64 MB RAM • 3 Passes</span>
                  </div>
                  <div className="p-2 rounded-lg bg-cyber-bg/80 border border-cyber-border/60">
                    <span className="text-cyber-muted block">Active DEK Key:</span>
                    <span className="text-cyber-success font-bold">WRAPPED & PERSISTED</span>
                  </div>
                </div>

                {/* Simulated Cryptographic Visualizer */}
                <div className="p-3 rounded-xl bg-cyber-bg/90 border border-cyber-cyan/30 shadow-[inset_0_0_15px_rgba(34,227,255,0.06)] space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-cyber-muted">ENCRYPTION PIPELINE:</span>
                    <span className="text-cyber-cyan font-bold">IDB REPOSITORIES SYNCED</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {['VF_INIT', 'PWHASH', 'DEK_GEN', 'POLY1305', 'IDB_SEAL'].map((block, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-cyber-elevated text-[9px] font-bold text-cyber-cyan border border-cyber-cyan/30 shrink-0"
                      >
                        {block}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Screen Hint to click & zoom */}
              <div className="p-2.5 rounded-xl bg-cyber-primary/20 border border-cyber-primary/50 text-center relative z-10 group-hover:bg-cyber-primary/30 transition-all flex items-center justify-center gap-2 text-xs font-bold text-white shadow-cyber-sm">
                <span>Click Laptop to Enter Encrypted Vault</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW B: CINEMATIC LOGIN INTERFACE (INSIDE LAPTOP SCREEN) */}
          {/* ======================================================== */}
          {isEnteringLogin && (
            <div className="p-5 sm:p-7 h-[calc(100%-28px)] flex flex-col justify-between font-mono select-none overflow-y-auto bg-gradient-to-b from-[#080E24] via-[#050A18] to-[#030612]">
              <div className="space-y-4">
                {/* Header inside screen */}
                <div className="text-center space-y-1 border-b border-cyber-border/50 pb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[10px] font-bold uppercase mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Vault Authentication</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                    Welcome Back to VAULTFORGE
                  </h3>
                  <p className="text-[11px] text-cyber-muted">
                    Authenticate to unwrap your 256-bit Data Encryption Key
                  </p>
                </div>

                {/* Vault Selection if multiple vaults exist */}
                {availableVaults.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-cyber-muted font-bold uppercase tracking-wider">
                      Select Vault:
                    </label>
                    <select
                      value={selectedVaultId}
                      onChange={(e) => {
                        setSelectedVaultId(e.target.value);
                        setAuthError(null);
                      }}
                      className="w-full h-9 px-3 bg-cyber-bgSecondary border border-cyber-border rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
                    >
                      {availableVaults.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.id.slice(0, 8)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Authentication Method Switcher Tabs (Only showing registered methods) */}
                <div className="flex gap-1.5 p-1 bg-cyber-bgSecondary/90 rounded-xl border border-cyber-border">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAuthTab('password');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeAuthTab === 'password'
                        ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                        : 'text-cyber-muted hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </button>

                  {hasPin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuthTab('pin');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeAuthTab === 'pin'
                          ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                          : 'text-cyber-muted hover:text-white'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>6-PIN</span>
                    </button>
                  )}

                  {hasBiometric && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuthTab('biometric');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeAuthTab === 'biometric'
                          ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                          : 'text-cyber-muted hover:text-white'
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Fingerprint</span>
                    </button>
                  )}

                  {hasIris && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAuthTab('iris');
                        setAuthError(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeAuthTab === 'iris'
                          ? 'bg-cyber-card text-cyber-cyan border border-cyber-cyan/30 shadow-cyber-sm'
                          : 'text-cyber-muted hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Iris</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: MASTER PASSWORD */}
                {activeAuthTab === 'password' && (
                  <form onSubmit={handlePasswordUnlock} className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-cyber-muted uppercase font-bold">Master Password</span>
                        <button
                          type="button"
                          onClick={() => setActiveAuthTab('recovery')}
                          className="text-cyber-cyan hover:underline"
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
                            setAuthError(null);
                          }}
                          placeholder="Enter your master password..."
                          required
                          className="w-full h-10 px-3 pr-10 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs focus:border-cyber-cyan focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUnlocking || !password}
                      className="w-full h-11 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-cyber-sm transition-all"
                    >
                      {isUnlocking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Deriving Argon2id Key...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Unlock Vault (KEK Unwrap)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* TAB 2: SIX-DIGIT PIN */}
                {activeAuthTab === 'pin' && selectedVault?.pinAuth && (
                  <div className="py-1">
                    <PinKeypad
                      onComplete={handlePinUnlock}
                      disabled={isUnlocking}
                      failedAttempts={selectedVault.pinAuth.failedAttempts || 0}
                      maxAttempts={selectedVault.pinAuth.maxAttempts || 5}
                      lockedUntil={selectedVault.pinAuth.lockedUntil || 0}
                      title="Enter 6-Digit PIN"
                      subtitle="Unwraps DEK with Argon2id PIN Envelope"
                    />
                  </div>
                )}

                {/* TAB 3: FINGERPRINT (WEBAUTHN) */}
                {activeAuthTab === 'biometric' && (
                  <div className="py-4 text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto rounded-full bg-cyber-card border-2 border-cyber-cyan/40 flex items-center justify-center shadow-[0_0_25px_rgba(34,227,255,0.2)]">
                      <Fingerprint className="w-10 h-10 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#22E3FF]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase">Platform Biometrics</div>
                      <div className="text-[11px] text-cyber-muted mt-0.5">Windows Hello / Touch ID / Passkey</div>
                    </div>
                    <button
                      type="button"
                      disabled={isUnlocking}
                      onClick={handleBiometricUnlock}
                      className="w-full h-11 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-cyber transition-all"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>Authenticate Biometric Sensor</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: IRIS SCANNER */}
                {activeAuthTab === 'iris' && (
                  <div className="py-4 text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto rounded-full bg-cyber-card border-2 border-cyber-warning/40 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                      <Eye className="w-10 h-10 text-cyber-warning animate-pulse drop-shadow-[0_0_8px_#F59E0B]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase">Iris Biometrics Station</div>
                      <div className="text-[11px] text-cyber-muted mt-0.5">Optical pupil segmentation HUD</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsIrisModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-cyber-elevated hover:bg-cyber-card border border-cyber-warning/40 text-cyber-warning font-bold text-xs flex items-center justify-center gap-2 shadow-cyber-sm transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Launch Optical Scanner HUD</span>
                    </button>
                  </div>
                )}

                {/* TAB 5: RECOVERY KEY */}
                {activeAuthTab === 'recovery' && (
                  <form onSubmit={handleRecoveryUnlock} className="space-y-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-cyber-warning uppercase font-bold">Emergency Recovery Key</span>
                      <button
                        type="button"
                        onClick={() => setActiveAuthTab('password')}
                        className="text-cyber-cyan hover:underline"
                      >
                        Use password
                      </button>
                    </div>
                    <textarea
                      value={recoveryInput}
                      onChange={(e) => {
                        setRecoveryInput(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Paste 64-char hex or hyphenated recovery key..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono focus:border-cyber-warning focus:outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isUnlocking || !recoveryInput}
                      className="w-full h-10 rounded-xl bg-cyber-warning hover:bg-cyber-warning/90 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-cyber transition-all"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Unwrap with Recovery Key</span>
                    </button>
                  </form>
                )}

                {authError && (
                  <div className="p-2.5 rounded-lg bg-cyber-danger/10 border border-cyber-danger/30 text-xs text-cyber-danger flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              {/* Bottom Screen Bar */}
              <div className="pt-3 border-t border-cyber-border/40 flex items-center justify-between text-[10px] text-cyber-muted">
                <span className="text-cyber-cyan">Protected by C11 libsodium</span>
                <button
                  type="button"
                  onClick={onCloseLogin}
                  className="hover:text-white transition-colors underline"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LAPTOP KEYBOARD BASE & TRACKPAD (Only visible in Hero Mode) */}
        {!isEnteringLogin && (
          <div className="relative">
            {/* Hinge bar */}
            <div className="h-3.5 sm:h-4 mx-8 sm:mx-14 bg-gradient-to-r from-[#0C152B] via-[#142347] to-[#0C152B] border-x border-cyber-cyan/30" />

            {/* Laptop Base Deck */}
            <div className="h-10 sm:h-14 bg-gradient-to-b from-[#101C38] via-[#0C162D] to-[#060B17] rounded-b-2xl sm:rounded-b-3xl border-2 border-t-0 border-cyber-cyan/30 shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative flex items-center justify-center">
              {/* Recessed Trackpad */}
              <div className="w-24 sm:w-32 h-6 sm:h-8 rounded-lg bg-[#080E20] border border-cyber-border/60 shadow-inner" />

              {/* Front Lip LED Glow Strip */}
              <div className="absolute bottom-1 inset-x-12 sm:inset-x-24 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_10px_#22E3FF]" />
            </div>
          </div>
        )}
      </motion.div>

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

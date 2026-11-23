import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { VaultForgeLogo } from '../components/common/VaultForgeLogo';
import { CursorBackground } from '../components/visuals/CursorBackground';
import { CyberLaptopHero } from '../components/visuals/CyberLaptopHero';
import {
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  Database,
  KeyRound,
  FlaskConical,
  Zap,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileCode2,
  Fingerprint,
  Eye,
  Building2,
  Shield,
  Layers,
  Terminal,
  Activity,
  HardDrive,
  ExternalLink,
  ChevronDown,
  Key
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { availableVaults, setDemoMode, addRecord } = useVaultStore();

  const [isEnteringLogin, setIsEnteringLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchScenario = async (scenario: string) => {
    setDemoMenuOpen(false);
    await setDemoMode(true, scenario);

    if (scenario === 'healthy') {
      await useVaultStore.getState().createVault(
        'Demo Enterprise Vault',
        '#2F6BFF',
        'MasterPassword123!',
        { opslimit: 2, memlimit: 32 * 1024 * 1024 },
        '482910'
      );
      await addRecord({
        type: 'login',
        title: 'Google Cloud Platform',
        username: 'devops-lead@company.internal',
        password: 'K8s#Secure99!_ProdClusterForge',
        website: 'https://console.cloud.google.com',
        category: 'Infrastructure',
        tags: ['Production', 'Cloud'],
        isFavorite: true,
        isDeleted: false
      });
      await addRecord({
        type: 'login',
        title: 'GitHub Enterprise',
        username: 'nahyan_crypto_dev',
        password: 'GH-Token_99348!xAlphaBetaGamma',
        website: 'https://github.com',
        category: 'Development',
        tags: ['Git', 'Code'],
        isFavorite: true,
        isDeleted: false
      });
      await addRecord({
        type: 'api_key',
        title: 'OpenAI Production API',
        service: 'OpenAI GPT-4',
        apiKey: 'sk-proj-7832849284920492849204820492',
        category: 'AI Services',
        tags: ['API', 'Production'],
        isFavorite: false,
        isDeleted: false
      });
    }

    onNavigate('dashboard');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <CursorBackground>
      {/* ======================================================== */}
      {/* 1. STICKY TRANSPARENT-TO-GLASS NAVIGATION BAR            */}
      {/* ======================================================== */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 font-mono ${
          isScrolled
            ? 'bg-[#040813]/85 backdrop-blur-md border-b border-cyber-border shadow-cyber-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VaultForgeLogo size="sm" />
            <div className="hidden sm:block">
              <span className="text-[10px] text-cyber-cyan font-bold tracking-widest block uppercase">
                CYBERSECURITY PLATFORM
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-cyber-muted">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-cyber-cyan transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="hover:text-cyber-cyan transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('authentication')}
              className="hover:text-cyber-cyan transition-colors"
            >
              Biometrics
            </button>
            <button
              onClick={() => scrollToSection('ecosystem')}
              className="hover:text-cyber-cyan transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-cyber-cyan transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="hover:text-cyber-cyan transition-colors"
            >
              Technology
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Demo Sandbox Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-3 py-1.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 text-[11px] font-bold text-cyber-muted hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>Demo Profiles</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyber-cyan" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-cyber-bgSecondary border border-cyber-cyan/40 p-2 shadow-cyber-glow text-xs space-y-1 z-50">
                  <div className="px-2 py-1 text-[10px] text-cyber-muted uppercase font-bold border-b border-cyber-border/60">
                    Load Pre-Configured Sandbox
                  </div>
                  <button
                    onClick={() => handleLaunchScenario('healthy')}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-cyber-primary/20 text-white font-bold transition-colors"
                  >
                    Enterprise Vault (Healthy)
                  </button>
                  <button
                    onClick={() => onNavigate('lab')}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-cyber-violet/20 text-cyber-violet font-bold transition-colors"
                  >
                    Open Crypto Laboratory
                  </button>
                </div>
              )}
            </div>

            {/* SIGN IN BUTTON (Triggers the Cinematic Computer Zoom!) */}
            <button
              type="button"
              onClick={() => setIsEnteringLogin(true)}
              className="px-3.5 py-1.5 rounded-xl border border-cyber-cyan/40 hover:border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,227,255,0.12)]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            {/* GET STARTED BUTTON */}
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="px-4 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primary/80 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-cyber-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION WITH 3D COMPUTER & CINEMATIC TRANSITION */}
      {/* ======================================================== */}
      <section className="relative pt-28 sm:pt-36 pb-16 lg:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content Heading */}
          <div className="max-w-3xl mx-auto text-center space-y-5 mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-[11px] font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(34,227,255,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>C11 Cryptography · Biometric Passkeys · Zero-Knowledge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.12]">
              YOUR DIGITAL IDENTITY.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-primary to-cyber-violet">
                PROTECTED BEYOND PASSWORDS.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-cyber-muted font-sans max-w-2xl mx-auto leading-relaxed">
              Take control of your digital security with an advanced encrypted password vault powered by C11 cryptography, biometric authentication and intelligent identity protection.
            </p>

            {/* Hero CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 font-mono">
              {/* ACCESS YOUR VAULT -> TRIGGERS COMPUTER ZOOM */}
              <button
                type="button"
                onClick={() => setIsEnteringLogin(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-primary via-cyber-primary to-cyber-cyan text-white text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(47,107,255,0.4)] hover:shadow-[0_0_40px_rgba(34,227,255,0.6)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-cyber-cyan" />
                <span>ACCESS YOUR VAULT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* EXPLORE VAULTFORGE */}
              <button
                type="button"
                onClick={() => scrollToSection('architecture')}
                className="px-6 py-3 rounded-xl bg-cyber-card/80 hover:bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-cyber-sm"
              >
                <span>EXPLORE VAULTFORGE</span>
                <ChevronRight className="w-4 h-4 text-cyber-cyan" />
              </button>
            </div>
          </div>

          {/* 3D COMPUTER WORKSTATION HERO VISUAL & CINEMATIC LOGIN ELEMENT */}
          <div className="relative w-full flex justify-center">
            <CyberLaptopHero
              isEnteringLogin={isEnteringLogin}
              onCloseLogin={() => setIsEnteringLogin(false)}
              onLoginSuccess={() => onNavigate('dashboard')}
              onOpenLogin={() => setIsEnteringLogin(true)}
            />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION A — SECURITY ARCHITECTURE                     */}
      {/* ======================================================== */}
      <section id="architecture" className="py-20 px-4 sm:px-6 relative border-t border-cyber-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyber-cyan tracking-widest uppercase">
              CRYPTOGRAPHIC FOUNDATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              SECURITY IS NOT AN OPTION. IT'S OUR FOUNDATION.
            </h2>
            <p className="text-xs sm:text-sm text-cyber-muted font-sans">
              Engineered using audited low-level C11 cryptographic primitives, eliminating vulnerabilities present in high-level interpreted scripts.
            </p>
          </div>

          {/* Three Technology Visualizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {/* Visual 1: Argon2id */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition-all flex flex-col justify-between space-y-5 shadow-cyber-sm group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-violet/30 flex items-center justify-center text-cyber-violet group-hover:scale-105 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] text-cyber-violet font-bold uppercase tracking-wider">
                    KEY DERIVATION FUNCTION
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">ARGON2ID</h3>
                  <p className="text-xs text-cyber-muted mt-2 font-sans leading-relaxed">
                    Winner of the Password Hashing Competition. Memory-hard algorithm filling 64MB RAM across 3 passes, rendering ASIC/GPU brute-force clusters ineffective.
                  </p>
                </div>
              </div>

              {/* Animated Matrix Blocks Simulation */}
              <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border/70 space-y-1.5 text-[10px]">
                <div className="flex justify-between text-cyber-muted">
                  <span>RAM ALLOCATION:</span>
                  <span className="text-cyber-cyan font-bold">67,108,864 BYTES</span>
                </div>
                <div className="grid grid-cols-6 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6].map((b) => (
                    <div
                      key={b}
                      className="h-3 rounded bg-cyber-violet/30 border border-cyber-violet/50 animate-pulse"
                      style={{ animationDelay: `${b * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Visual 2: XChaCha20-Poly1305 */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition-all flex flex-col justify-between space-y-5 shadow-cyber-sm group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] text-cyber-cyan font-bold uppercase tracking-wider">
                    AUTHENTICATED ENVELOPE
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">XCHACHA20-POLY1305</h3>
                  <p className="text-xs text-cyber-muted mt-2 font-sans leading-relaxed">
                    192-bit extended nonce prevents catastrophic nonce reuse attacks. 128-bit Poly1305 MAC tag detects single-bit tampering with instant rejection.
                  </p>
                </div>
              </div>

              {/* Nonce & MAC breakdown simulation */}
              <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border/70 space-y-1.5 text-[10px]">
                <div className="flex justify-between text-cyber-muted">
                  <span>NONCE ENTROPY:</span>
                  <span className="text-cyber-cyan font-bold">192 BITS (CSPRNG)</span>
                </div>
                <div className="flex justify-between text-cyber-muted">
                  <span>POLY1305 MAC:</span>
                  <span className="text-cyber-success font-bold">AUTHENTICATED SEAL</span>
                </div>
              </div>
            </div>

            {/* Visual 3: C11 / WebAssembly */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 transition-all flex flex-col justify-between space-y-5 shadow-cyber-sm group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyber-elevated border border-cyber-primary/30 flex items-center justify-center text-cyber-primary group-hover:scale-105 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] text-cyber-primary font-bold uppercase tracking-wider">
                    CRYPTOGRAPHIC CORE
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">C11 / WEBASSEMBLY</h3>
                  <p className="text-xs text-cyber-muted mt-2 font-sans leading-relaxed">
                    Low-level C11 security engine compiled to WebAssembly running inside an isolated dedicated Web Worker. Features volatile pointer zeroization (<code className="text-cyber-cyan">sodium_memzero</code>).
                  </p>
                </div>
              </div>

              {/* Memory Hygiene Pill */}
              <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border/70 space-y-1.5 text-[10px]">
                <div className="flex justify-between text-cyber-muted">
                  <span>MEMORY HYGIENE:</span>
                  <span className="text-cyber-success font-bold">ZERO-RESIDUE WIPE</span>
                </div>
                <div className="flex justify-between text-cyber-muted">
                  <span>WORKER THREAD:</span>
                  <span className="text-cyber-cyan font-bold">ISOLATED PROCESS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION B — ADVANCED AUTHENTICATION                   */}
      {/* ======================================================== */}
      <section id="authentication" className="py-20 px-4 sm:px-6 relative bg-[#030611] border-t border-cyber-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyber-cyan tracking-widest uppercase">
              MULTI-LAYER IDENTITY GATES
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              YOUR IDENTITY IS YOUR KEY.
            </h2>
            <p className="text-xs sm:text-sm text-cyber-muted font-sans">
              Authenticate via WebAuthn passkeys, memory-hard numeric PINs, or certified biometric sensors without compromising master vault encryption.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono">
            {/* Card 1: Fingerprint */}
            <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-cyber-success/15 border border-cyber-success/30 text-cyber-success text-[10px] font-bold">
                  ACTIVE WEBAUTHN
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">Fingerprint Authentication</h4>
                <p className="text-xs text-cyber-muted font-sans mt-1 leading-relaxed">
                  Hardware-backed passkeys via Windows Hello and Touch ID. Zero raw biometric storage.
                </p>
              </div>
            </div>

            {/* Card 2: Six-Digit PIN */}
            <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan text-[10px] font-bold">
                  ARGON2ID ENVELOPE
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">Six-Digit Security PIN</h4>
                <p className="text-xs text-cyber-muted font-sans mt-1 leading-relaxed">
                  Fast numeric keypad login with calibrated memory passes and 5-attempt lockout security.
                </p>
              </div>
            </div>

            {/* Card 3: Iris Scanner */}
            <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-warning/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-warning/30 flex items-center justify-center text-cyber-warning">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-cyber-warning/15 border border-cyber-warning/30 text-cyber-warning text-[10px] font-bold">
                  DEMO / ISO HARDWARE
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">Iris / Retinal Scanning</h4>
                <p className="text-xs text-cyber-muted font-sans mt-1 leading-relaxed">
                  ISO/IEC 19794-6 driver architecture with interactive pupil contour & Gabor wavelet simulation.
                </p>
              </div>
            </div>

            {/* Card 4: Government Verification */}
            <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-cyber-warning/15 border border-cyber-warning/30 text-cyber-warning text-[10px] font-bold">
                  MOCK SANDBOX KYC
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">Government ID Verification</h4>
                <p className="text-xs text-cyber-muted font-sans mt-1 leading-relaxed">
                  Aadhaar 2FA OTP simulation with synthetic masking and BLAKE2b receipt hash proofs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION C — DIGITAL SECURITY ECOSYSTEM                */}
      {/* ======================================================== */}
      <section id="ecosystem" className="py-20 px-4 sm:px-6 relative border-t border-cyber-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyber-cyan tracking-widest uppercase">
              COMPLETE DIGITAL WORKSPACE
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              A UNIFIED CYBERSECURITY SUITE.
            </h2>
            <p className="text-xs sm:text-sm text-cyber-muted font-sans">
              All tools share the same zero-knowledge envelope encryption engine, persistent across sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
            {[
              {
                icon: Database,
                title: 'Password Vault',
                tag: 'CRUD & ENVELOPE',
                desc: 'Store credentials, API tokens, and payment cards sealed with individual 192-bit CSPRNG nonces.'
              },
              {
                icon: FileCode2,
                title: 'Secure Notes & Wallet',
                tag: 'AUTHENTICATED DATA',
                desc: 'Client-side AES/XChaCha encrypted notes with automatic clipboard sanitization timers.'
              },
              {
                icon: KeyRound,
                title: 'Password Studio',
                tag: 'CSPRNG ENTROPY',
                desc: 'Uniform unbiased random generators, EFF large wordlist passphrases, and secure PIN generation.'
              },
              {
                icon: ShieldCheck,
                title: 'Health Radar',
                tag: 'LOCAL HEURISTICS',
                desc: 'Calculates Shannon entropy, cross-account reuse, and password age entirely offline.'
              },
              {
                icon: Activity,
                title: 'Attack Lab & Modeling',
                tag: 'SEARCH SPACE LAB',
                desc: 'Combinatoric search-space modeling comparing online, GPU cluster, and Argon2id brute-force times.'
              },
              {
                icon: HardDrive,
                title: 'Backup & Recovery',
                tag: 'VIRTUAL CONTAINERS',
                desc: 'Export encrypted .vfvault containers or restore via 256-bit emergency recovery secrets.'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-border flex items-center justify-center text-cyber-cyan">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-cyber-muted font-bold tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-cyber-muted font-sans leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION D — HOW IT WORKS (3-STAGE PROCESS)            */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 relative bg-[#030611] border-t border-cyber-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyber-cyan tracking-widest uppercase">
              ZERO-KNOWLEDGE ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              HOW VAULTFORGE PROTECTS YOU
            </h2>
            <p className="text-xs sm:text-sm text-cyber-muted font-sans">
              From vault initialization to instant panic lockdown, your cryptographic keys remain under your sovereign control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {[
              {
                step: '01',
                title: 'CREATE YOUR VAULT',
                sub: 'Argon2id Master Derivation',
                desc: 'Choose your master password. The C engine generates salt, derives a 256-bit KEK, generates a random DEK, and seals it with envelope encryption.'
              },
              {
                step: '02',
                title: 'CONFIGURE YOUR SECURITY',
                sub: 'Multi-Layer Authentication',
                desc: 'Pair Windows Hello fingerprint passkeys, create a 6-digit numeric PIN, and safely store your 256-bit emergency recovery key offline.'
              },
              {
                step: '03',
                title: 'PROTECT YOUR DIGITAL WORLD',
                sub: 'Continuous Zero-Residue Sealing',
                desc: 'Records are encrypted per-item. Auto-lock timers and panic wipe immediately scrub keys from memory using sodium_memzero.'
              }
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all space-y-4 relative overflow-hidden"
              >
                <div className="text-3xl font-display font-extrabold text-cyber-cyan/40">
                  {s.step}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white uppercase">{s.title}</h4>
                  <div className="text-[11px] text-cyber-cyan font-bold mt-0.5">{s.sub}</div>
                  <p className="text-xs text-cyber-muted font-sans mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. SECTION E — TECHNOLOGY STACK                          */}
      {/* ======================================================== */}
      <section id="technology" className="py-20 px-4 sm:px-6 relative border-t border-cyber-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-cyber-cyan tracking-widest uppercase">
              PROVEN STANDARDS
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              INTERACTIVE TECHNOLOGY SPECIFICATION
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono text-center">
            {[
              { label: 'C11', desc: 'ISO Standard' },
              { label: 'WebAssembly', desc: 'Near-Native VM' },
              { label: 'libsodium', desc: 'Upstream Sumo' },
              { label: 'Argon2id', desc: 'RFC 9106' },
              { label: 'XChaCha20', desc: 'IETF Draft' },
              { label: 'IndexedDB', desc: 'Encrypted Store' }
            ].map((tech, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-colors"
              >
                <div className="text-sm font-bold text-white">{tech.label}</div>
                <div className="text-[10px] text-cyber-cyan font-bold mt-1">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. SECTION F — FINAL CTA & FOOTER                        */}
      {/* ======================================================== */}
      <section className="py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#030611] via-[#050A19] to-[#02040B] border-t border-cyber-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            YOUR DIGITAL WORLD DESERVES BETTER PROTECTION.
          </h2>
          <p className="text-sm sm:text-base text-cyber-muted font-sans max-w-xl mx-auto leading-relaxed">
            Experience a smarter way to protect your digital identity with sovereign cryptographic control.
          </p>

          <div className="pt-2 flex justify-center font-mono">
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-primary to-cyber-cyan text-white text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_35px_rgba(34,227,255,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>CREATE YOUR VAULT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 bg-[#02040B] border-t border-cyber-border/40 font-mono text-xs text-cyber-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VaultForgeLogo size="sm" />
            <span>VAULTFORGE v2.0 · Digital Identity & Encrypted Storage</span>
          </div>

          <div className="text-[11px] text-cyber-muted text-center sm:text-right">
            Capstone Project · Applied Cryptography & Systems Architecture
            <div className="text-cyber-cyan text-[10px] mt-0.5">
              Nahyan Bin Nawaf · Sudharsan · Dinesh
            </div>
          </div>
        </div>
      </footer>
    </CursorBackground>
  );
};

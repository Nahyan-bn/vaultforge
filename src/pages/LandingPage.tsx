import React from 'react';
import { VaultMechanism } from '../components/visuals/VaultMechanism';
import { EncryptionPipeline } from '../components/visuals/EncryptionPipeline';
import { useVaultStore } from '../store/vaultStore';
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
  AlertOctagon
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { availableVaults, setDemoMode, addRecord } = useVaultStore();

  const handleLaunchScenario = async (scenario: string) => {
    await setDemoMode(true, scenario);

    // Populate scenario test data
    if (scenario === 'healthy') {
      await useVaultStore.getState().createVault('Demo Enterprise Vault', '#2F6BFF', 'MasterPassword123!', { opslimit: 2, memlimit: 32 * 1024 * 1024 });
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
        category: 'API Tokens',
        tags: ['AI', 'LLM'],
        isFavorite: false,
        isDeleted: false
      });
    } else if (scenario === 'weak_reused') {
      await useVaultStore.getState().createVault('Vulnerable Audit Vault', '#FF4D6D', 'Password123!', { opslimit: 2, memlimit: 32 * 1024 * 1024 });
      await addRecord({
        type: 'login',
        title: 'Internal Jenkins CI',
        username: 'admin',
        password: 'password123',
        category: 'Build',
        tags: ['Vulnerable'],
        isFavorite: false,
        isDeleted: false
      });
      await addRecord({
        type: 'login',
        title: 'Staging Database MySQL',
        username: 'root',
        password: 'password123',
        category: 'Database',
        tags: ['Vulnerable'],
        isFavorite: false,
        isDeleted: false
      });
      await addRecord({
        type: 'login',
        title: 'Corporate VPN Access',
        username: 'contractor',
        password: 'password123',
        category: 'Network',
        tags: ['Vulnerable'],
        isFavorite: false,
        isDeleted: false
      });
      await addRecord({
        type: 'login',
        title: 'Legacy FTP Backup',
        username: 'backup_user',
        password: '123456',
        category: 'Backup',
        tags: ['Critical'],
        isFavorite: false,
        isDeleted: false
      });
    }

    onNavigate('dashboard');
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-cyan text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            <span>C11 / WebAssembly Cryptographic Core Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
            Your Digital Identity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-primary to-cyber-violet">
              Under Your Control.
            </span>
          </h1>

          <p className="text-cyber-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            VAULTFORGE is a commercial-grade, local-first password vault engineered in C and compiled to WebAssembly.
            Defend your secrets with <strong className="text-cyber-text">Argon2id</strong> memory-hard key derivation,
            <strong className="text-cyber-text"> XChaCha20-Poly1305</strong> envelope authenticated encryption, and constant-time tamper detection.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('create')}
              className="px-6 py-3.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white font-mono font-bold text-sm transition-all duration-200 flex items-center gap-2 shadow-cyber hover:shadow-cyber-glow group"
            >
              <span>Create Your Vault</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {availableVaults.length > 0 ? (
              <button
                onClick={() => onNavigate('unlock')}
                className="px-6 py-3.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/50 text-cyber-cyan font-mono font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Existing ({availableVaults.length})</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('lab')}
                className="px-6 py-3.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-violet/50 text-cyber-violet font-mono font-bold text-sm transition-colors flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Open Crypto Lab</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cyber-border/60 max-w-lg">
            <div>
              <div className="font-mono text-xs text-cyber-muted">KEY DERIVATION</div>
              <div className="font-display font-bold text-lg text-cyber-cyan">Argon2id</div>
              <div className="font-mono text-[10px] text-cyber-muted">Memory-hard KDF</div>
            </div>
            <div>
              <div className="font-mono text-xs text-cyber-muted">AEAD CIPHER</div>
              <div className="font-display font-bold text-lg text-cyber-primary">XChaCha20</div>
              <div className="font-mono text-[10px] text-cyber-muted">192-bit Nonce + MAC</div>
            </div>
            <div>
              <div className="font-mono text-xs text-cyber-muted">CORE RUNTIME</div>
              <div className="font-display font-bold text-lg text-cyber-violet">C11 / WASM</div>
              <div className="font-mono text-[10px] text-cyber-muted">Native libsodium</div>
            </div>
          </div>
        </div>

        {/* Hero Vault Visual Mechanism */}
        <div className="lg:col-span-5 flex justify-center py-6">
          <VaultMechanism
            isLocked={true}
            onToggle={() => onNavigate('create')}
          />
        </div>
      </div>

      {/* Demo Sandbox Quick Scenarios Section */}
      <div className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyber-cyan" />
              <span>Interactive Capstone Demo Scenarios</span>
            </h2>
            <p className="text-xs sm:text-sm text-cyber-muted">
              Instantly test pre-configured scenarios inside an isolated sandbox database. Real vault data is never touched.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyber-card border border-cyber-border text-cyber-muted self-start sm:self-auto">
            5 Sandbox Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            {
              id: 'healthy',
              title: '1. Healthy Vault',
              desc: 'High entropy, zero reuse, perfect 100/100 score.',
              color: 'border-cyber-success/30 hover:border-cyber-success',
              badge: 'OPTIMAL',
              badgeColor: 'text-cyber-success bg-cyber-success/10'
            },
            {
              id: 'weak_reused',
              title: '2. Weak & Reused',
              desc: 'Vulnerable passwords, reuse detection on radar.',
              color: 'border-cyber-danger/30 hover:border-cyber-danger',
              badge: 'ATTACK TARGET',
              badgeColor: 'text-cyber-danger bg-cyber-danger/10'
            },
            {
              id: 'tamper',
              title: '3. Tamper Detection',
              desc: 'Simulate flipped ciphertext byte and watch AEAD fail.',
              color: 'border-cyber-warning/30 hover:border-cyber-warning',
              badge: 'POLY1305',
              badgeColor: 'text-cyber-warning bg-cyber-warning/10'
            },
            {
              id: 'panic',
              title: '4. Panic & Recovery',
              desc: 'Test emergency zeroing and recovery key restore.',
              color: 'border-cyber-primary/30 hover:border-cyber-primary',
              badge: 'HYGIENE',
              badgeColor: 'text-cyber-primary bg-cyber-primary/10'
            },
            {
              id: 'crypto_tour',
              title: '5. Crypto Tour',
              desc: 'Inspect Argon2id matrix and XChaCha20 telemetry.',
              color: 'border-cyber-violet/30 hover:border-cyber-violet',
              badge: 'C-ENGINE',
              badgeColor: 'text-cyber-violet bg-cyber-violet/10'
            }
          ].map((sc) => (
            <div
              key={sc.id}
              onClick={() => {
                if (sc.id === 'tamper' || sc.id === 'crypto_tour') {
                  onNavigate('lab');
                } else {
                  handleLaunchScenario(sc.id);
                }
              }}
              className={`p-4 rounded-xl bg-cyber-card/70 border ${sc.color} cursor-pointer hover:bg-cyber-elevated transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyber-muted group-hover:text-cyber-cyan group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display font-bold text-sm text-cyber-text group-hover:text-cyber-cyan transition-colors">
                  {sc.title}
                </h3>
                <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-cyber-border/40 text-[11px] font-mono text-cyber-cyan font-bold flex items-center gap-1">
                <span>Launch Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic Architecture Pipeline Showpiece */}
      <div className="space-y-4 pt-6 border-t border-cyber-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            Envelope Cryptographic Architecture
          </h2>
          <p className="text-xs sm:text-sm text-cyber-muted">
            Zero master secrets ever touch persistent disk. The Master Password derives a temporary KEK which wraps the Data Encryption Key.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card/50 border border-cyber-border">
          <EncryptionPipeline activeStep={4} />
        </div>
      </div>

      {/* Security Principles & Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="p-3 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            Argon2id Memory Hardness
          </h3>
          <p className="text-xs text-cyber-muted leading-relaxed">
            Resistant to GPU and ASIC offline brute-force attacks. Every vault derivation utilizes calibrated memory buffers (up to 64MB) and cryptographic salts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="p-3 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            Authenticated AEAD Storage
          </h3>
          <p className="text-xs text-cyber-muted leading-relaxed">
            XChaCha20 with Poly1305 guarantees both confidentiality and ciphertext integrity. Any disk corruption or deliberate bit flipping immediately aborts decryption.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="p-3 rounded-xl bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger w-fit">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            Memory Hygiene & Panic Lock
          </h3>
          <p className="text-xs text-cyber-muted leading-relaxed">
            Keys are explicitly cleared using C <code className="text-cyber-cyan">sodium_memzero</code>. Activate Panic Lock anytime via <kbd className="px-1.5 py-0.5 rounded bg-cyber-bg border border-cyber-border font-mono text-[10px]">Ctrl+Shift+L</kbd>.
          </p>
        </div>
      </div>
    </div>
  );
};

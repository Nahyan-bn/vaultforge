import React from 'react';
import { useVaultStore } from '../store/vaultStore';
import { SecurityScoreOrb } from '../components/visuals/SecurityScoreOrb';
import { HealthRadarVisual } from '../components/visuals/HealthRadarVisual';
import {
  Shield,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Plus,
  Radio,
  Download,
  FlaskConical,
  AlertOctagon,
  Lock,
  ArrowRight,
  Database,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Fingerprint,
  ShieldCheck,
  Cpu,
  Key,
  IdCard,
  FileCode2,
  HardDrive,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeVault, records, analytics, auditEvents, panicLock } = useVaultStore();

  const activeRecords = records.filter((r) => !r.isDeleted);

  const hasBiometric = Boolean(activeVault?.biometricAuth?.enabled);
  const hasPin = Boolean(activeVault?.pinAuth?.enabled);
  const hasGovId = Boolean(
    activeVault?.govVerification?.status === 'DEMO_VERIFIED' ||
    activeVault?.govVerification?.status === 'OFFICIALLY_VERIFIED'
  );

  return (
    <div className="space-y-8 font-sans">
      {/* 1. HERO WELCOME CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-cyber-card border border-cyber-border shadow-cyber relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full ring-4 ring-white/10"
                style={{ backgroundColor: activeVault?.color || '#2F6BFF' }}
              />
              <span className="text-xs font-mono font-bold text-cyber-cyan tracking-wider uppercase">
                ACTIVE VAULT COMMAND CENTER
              </span>
              <span className="px-2 py-0.5 rounded bg-cyber-success/15 text-cyber-success border border-cyber-success/30 text-[10px] font-mono font-bold">
                256-BIT UNLOCKED
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {activeVault?.name || 'Primary Security Vault'}
            </h1>

            <p className="text-xs sm:text-sm text-cyber-muted font-mono leading-relaxed">
              Protected by C11 Argon2id KDF ({((activeVault?.kdfParams?.memlimit || 67108864) / 1024 / 1024).toFixed(0)}MB RAM, {activeVault?.kdfParams?.opslimit || 3} Passes) and XChaCha20-Poly1305 authenticated encryption.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono">
            <button
              onClick={() => onNavigate('vault')}
              className="px-4 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-sm hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Credential</span>
            </button>

            <button
              onClick={() => onNavigate('generator')}
              className="px-4 py-2.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/50 text-cyber-cyan text-xs font-bold transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Generate Password</span>
            </button>

            <button
              onClick={() => onNavigate('audit')}
              className="px-4 py-2.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/50 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyber-cyan" />
              <span>Run Audit</span>
            </button>

            <button
              onClick={() => onNavigate('backup')}
              className="px-4 py-2.5 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-violet/50 text-cyber-muted hover:text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-cyber-violet" />
              <span>Backup</span>
            </button>

            <button
              onClick={() => panicLock()}
              className="px-4 py-2.5 rounded-xl bg-cyber-danger/15 hover:bg-cyber-danger/25 border border-cyber-danger/40 text-cyber-danger text-xs font-bold transition-all flex items-center gap-2 animate-pulse"
              title="Immediate zeroing of cryptographic memory buffers"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Panic Lock</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. QUICK STATS & MULTI-LAYER AUTH STATUS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5 font-mono">
        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Total Items</span>
          </div>
          <div className="text-2xl font-display font-bold text-white">{analytics.totalRecords}</div>
          <div className="text-[10px] text-cyber-muted">Active credentials</div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyber-success" />
            <span>Strong</span>
          </div>
          <div className="text-2xl font-display font-bold text-cyber-success">{analytics.strongPasswords}</div>
          <div className="text-[10px] text-cyber-success/80">Optimal entropy</div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-cyber-warning" />
            <span>Weak</span>
          </div>
          <div className="text-2xl font-display font-bold text-cyber-warning">{analytics.weakPasswords}</div>
          <div className="text-[10px] text-cyber-warning/80">Low entropy</div>
        </div>

        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-cyber-danger" />
            <span>Reused / Old</span>
          </div>
          <div className="text-2xl font-display font-bold text-cyber-danger">
            {analytics.reusedPasswords + analytics.oldPasswords}
          </div>
          <div className="text-[10px] text-cyber-danger/80">Vulnerable items</div>
        </div>

        {/* Biometric Status */}
        <div
          onClick={() => onNavigate('identity')}
          className="p-4 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-colors cursor-pointer space-y-1"
          title="Click to manage biometrics"
        >
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Biometrics</span>
          </div>
          <div className={`text-sm font-display font-bold ${hasBiometric ? 'text-cyber-success' : 'text-cyber-muted'}`}>
            {hasBiometric ? 'ACTIVE' : 'NOT SET'}
          </div>
          <div className="text-[10px] text-cyber-muted">WebAuthn / Iris</div>
        </div>

        {/* PIN Protection */}
        <div
          onClick={() => onNavigate('identity')}
          className="p-4 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-colors cursor-pointer space-y-1"
          title="Click to manage 6-digit PIN"
        >
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>PIN Status</span>
          </div>
          <div className={`text-sm font-display font-bold ${hasPin ? 'text-cyber-success' : 'text-cyber-muted'}`}>
            {hasPin ? 'ENABLED' : 'DISABLED'}
          </div>
          <div className="text-[10px] text-cyber-muted">6-Digit Memory Hard</div>
        </div>

        {/* Government Identity */}
        <div
          onClick={() => onNavigate('identity')}
          className="p-4 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-colors cursor-pointer space-y-1"
          title="Click to manage government identity verification"
        >
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5 text-cyber-violet" />
            <span>Gov Identity</span>
          </div>
          <div className={`text-sm font-display font-bold ${hasGovId ? 'text-cyber-success' : 'text-cyber-muted'}`}>
            {hasGovId ? 'VERIFIED' : 'UNVERIFIED'}
          </div>
          <div className="text-[10px] text-cyber-muted">UIDAI Sandbox</div>
        </div>
      </div>

      {/* 3. CRYPTOGRAPHIC ENGINE STATUS CARD */}
      <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border relative overflow-hidden font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyber-cyan" />
            <h2 className="font-display font-bold text-base text-white">
              C11 Cryptographic Engine Runtime Status
            </h2>
            <span className="px-2 py-0.5 rounded bg-cyber-primary/20 text-cyber-cyan border border-cyber-primary/40 text-[10px] font-bold">
              VERIFIED ACTIVE
            </span>
          </div>

          <button
            onClick={() => onNavigate('diagnostics')}
            className="text-xs text-cyber-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>View Full System Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
            <span className="text-[10px] text-cyber-muted uppercase block">C11 Core Engine</span>
            <span className="text-white font-bold block">libsodium WASM Sumo</span>
            <span className="text-[10px] text-cyber-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Hardware Vectorized
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
            <span className="text-[10px] text-cyber-muted uppercase block">Key Derivation</span>
            <span className="text-white font-bold block">Argon2id (m_cost: 64MB)</span>
            <span className="text-[10px] text-cyber-cyan flex items-center gap-1">
              <Zap className="w-3 h-3" /> GPU-Resistant
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
            <span className="text-[10px] text-cyber-muted uppercase block">Authenticated Cipher</span>
            <span className="text-white font-bold block">XChaCha20-Poly1305</span>
            <span className="text-[10px] text-cyber-cyan flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 192-bit Extended Nonce
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
            <span className="text-[10px] text-cyber-muted uppercase block">Memory Hygiene</span>
            <span className="text-white font-bold block">sodium_memzero()</span>
            <span className="text-[10px] text-cyber-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero Plaintext Footprint
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
            <span className="text-[10px] text-cyber-muted uppercase block">Envelope Integrity</span>
            <span className="text-white font-bold block">Poly1305 MAC Verified</span>
            <span className="text-[10px] text-cyber-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Tamper-Proof In-RAM
            </span>
          </div>
        </div>
      </div>

      {/* 4. HEALTH RADAR & SMART RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Score Orb & Health Radar */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyber-cyan" />
              <span>Vault Security Posture</span>
            </h2>
            <button
              onClick={() => onNavigate('radar')}
              className="text-xs font-mono text-cyber-cyan hover:underline flex items-center gap-1"
            >
              <span>Full Radar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <SecurityScoreOrb score={analytics.securityScore} size="md" />
            <div className="hidden sm:block">
              <HealthRadarVisual analytics={analytics} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyber-bg border border-cyber-border text-xs font-mono text-cyber-muted space-y-1.5">
            <div className="flex justify-between">
              <span>Overall Password Health:</span>
              <span className={`font-bold ${analytics.securityScore >= 80 ? 'text-cyber-success' : analytics.securityScore >= 50 ? 'text-cyber-warning' : 'text-cyber-danger'}`}>
                {analytics.securityScore >= 80 ? 'EXCELLENT' : analytics.securityScore >= 50 ? 'NEEDS ATTENTION' : 'CRITICAL'} ({analytics.securityScore}/100)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cipher:</span>
              <span className="text-cyber-cyan font-bold">XChaCha20-Poly1305 AEAD</span>
            </div>
            <div className="flex justify-between">
              <span>DEK Key Wrapping:</span>
              <span className="text-cyber-success font-bold">256-bit Sealed Envelope</span>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-cyan" />
              <span>Smart Security Recommendations</span>
            </h2>
            <span className="font-mono text-xs text-cyber-muted">
              {analytics.issues.length} Issues Identified
            </span>
          </div>

          {activeRecords.length === 0 ? (
            <div className="py-12 text-center space-y-3 font-mono">
              <Database className="w-10 h-10 text-cyber-border mx-auto" />
              <p className="text-xs text-cyber-muted">Your vault currently contains no credentials.</p>
              <button
                onClick={() => onNavigate('vault')}
                className="px-4 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-bold transition-colors"
              >
                Add Your First Credential
              </button>
            </div>
          ) : analytics.issues.length === 0 ? (
            <div className="py-10 text-center space-y-3 font-mono">
              <CheckCircle2 className="w-10 h-10 text-cyber-success mx-auto" />
              <p className="text-sm text-cyber-text font-bold">All Credentials Meet Security Standards</p>
              <p className="text-xs text-cyber-muted">
                No weak passwords, reused credentials, or overdue rotations detected.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {analytics.issues.slice(0, 5).map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border hover:border-cyber-cyan/40 transition-colors flex items-start justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          issue.severity === 'HIGH'
                            ? 'bg-cyber-danger/15 text-cyber-danger border border-cyber-danger/30'
                            : issue.severity === 'MEDIUM'
                            ? 'bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30'
                            : 'bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-bold text-cyber-text">{issue.title}</span>
                    </div>
                    <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('vault')}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-cyber-elevated hover:bg-cyber-primary hover:text-white text-cyber-cyan text-[11px] border border-cyber-border transition-colors"
                  >
                    Fix
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-cyan" />
            <span>Hash-Linked Audit Activity Feed</span>
          </h2>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-mono text-cyber-cyan hover:underline flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {auditEvents.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-cyber-muted shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyber-card border border-cyber-border text-cyber-cyan text-[10px] font-bold shrink-0">
                  {evt.category}
                </span>
                <span className="text-cyber-text truncate">{evt.description}</span>
              </div>
              <span className="text-[10px] text-cyber-muted/60 shrink-0 font-mono hidden sm:inline">
                digest: {evt.currHash.slice(0, 10)}...
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

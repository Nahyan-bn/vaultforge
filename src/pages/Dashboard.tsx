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
  Fingerprint
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activeVault, records, analytics, auditEvents, panicLock } = useVaultStore();

  const activeRecords = records.filter((r) => !r.isDeleted);

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-cyber relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeVault?.color || '#2F6BFF' }}
            />
            <h1 className="text-2xl font-display font-bold text-white">
              {activeVault?.name || 'Vault Dashboard'}
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyber-primary/20 text-cyber-cyan border border-cyber-primary/40 text-[10px] font-mono font-bold">
              UNLOCKED & ACTIVE
            </span>
          </div>
          <p className="text-xs text-cyber-muted font-mono">
            Encrypted with 256-bit DEK • Argon2id KDF ({((activeVault?.kdfParams?.memlimit || 67108864) / 1024 / 1024).toFixed(0)}MB RAM)
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => onNavigate('vault')}
            className="px-3.5 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-cyber-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Credential</span>
          </button>

          <button
            onClick={() => onNavigate('generator')}
            className="px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => onNavigate('auth')}
            className="px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 text-cyber-cyan text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Auth Layers</span>
          </button>

          <button
            onClick={() => onNavigate('lab')}
            className="px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-violet/40 text-cyber-violet text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Crypto Lab</span>
          </button>

          <button
            onClick={() => panicLock()}
            className="px-3.5 py-2 rounded-xl bg-cyber-danger/15 hover:bg-cyber-danger/25 border border-cyber-danger/40 text-cyber-danger text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
            title="Immediate session wipe"
          >
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Panic</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Total Items</div>
          <div className="text-2xl font-display font-bold text-white">{analytics.totalRecords}</div>
          <div className="text-[10px] text-cyber-muted">In active store</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Strong Passwords</div>
          <div className="text-2xl font-display font-bold text-cyber-success">{analytics.strongPasswords}</div>
          <div className="text-[10px] text-cyber-success/80">Optimal entropy</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Weak Passwords</div>
          <div className="text-2xl font-display font-bold text-cyber-warning">{analytics.weakPasswords}</div>
          <div className="text-[10px] text-cyber-warning/80">Low entropy</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Reused Passwords</div>
          <div className="text-2xl font-display font-bold text-cyber-danger">{analytics.reusedPasswords}</div>
          <div className="text-[10px] text-cyber-danger/80">Cross-service risk</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Old (&gt;90d)</div>
          <div className="text-2xl font-display font-bold text-cyber-muted">{analytics.oldPasswords}</div>
          <div className="text-[10px] text-cyber-muted">Requires review</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
          <div className="text-[10px] text-cyber-muted uppercase tracking-wider">Security Score</div>
          <div className={`text-2xl font-display font-bold ${analytics.securityScore >= 80 ? 'text-cyber-success' : analytics.securityScore >= 50 ? 'text-cyber-warning' : 'text-cyber-danger'}`}>
            {analytics.securityScore}
          </div>
          <div className="text-[10px] text-cyber-muted">Formula-driven</div>
        </div>
      </div>

      {/* Main Visuals & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Score Orb & Health Radar */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
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

          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border text-xs font-mono text-cyber-muted space-y-1">
            <div className="flex justify-between">
              <span>Integrity Algorithm:</span>
              <span className="text-cyber-text font-bold">Poly1305 (16-byte MAC)</span>
            </div>
            <div className="flex justify-between">
              <span>Cipher:</span>
              <span className="text-cyber-cyan font-bold">XChaCha20 (24-byte Nonce)</span>
            </div>
            <div className="flex justify-between">
              <span>Envelope Status:</span>
              <span className="text-cyber-success font-bold">Verified In-Memory</span>
            </div>
          </div>
        </div>

        {/* Smart Recommendations based on real vault data */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
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

      {/* Recent Activity Timeline */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
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

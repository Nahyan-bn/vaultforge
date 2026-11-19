import React from 'react';
import { useVaultStore } from '../store/vaultStore';
import { HealthRadarVisual } from '../components/visuals/HealthRadarVisual';
import { SecurityScoreOrb } from '../components/visuals/SecurityScoreOrb';
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Info,
  Lock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface HealthRadarProps {
  onNavigate: (tab: string) => void;
}

export const HealthRadar: React.FC<HealthRadarProps> = ({ onNavigate }) => {
  const { analytics, records } = useVaultStore();

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-cyber-cyan" />
          <span>Vault Health Radar</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Real-time offline vulnerability analysis & cross-credential password reuse detection
        </p>
      </div>

      {/* Overview Cards & Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col items-center justify-between space-y-6">
          <h2 className="text-xs uppercase tracking-wider text-cyber-muted font-bold self-start">
            Multidimensional Posture
          </h2>

          <div className="flex flex-col items-center justify-center gap-4">
            <SecurityScoreOrb score={analytics.securityScore} size="lg" />
            <HealthRadarVisual analytics={analytics} />
          </div>

          <div className="w-full p-3.5 rounded-xl bg-cyber-bg border border-cyber-border text-xs text-cyber-muted space-y-1.5">
            <div className="flex justify-between">
              <span>Scoring Model:</span>
              <span className="text-cyber-text font-bold">Local Heuristic v1.0</span>
            </div>
            <div className="flex justify-between">
              <span>External Leakage:</span>
              <span className="text-cyber-success font-bold">ZERO (100% Offline)</span>
            </div>
          </div>
        </div>

        {/* Detailed Findings & Explanations */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-cyan" />
              <span>Vulnerability Findings ({analytics.issues.length})</span>
            </h2>
            <span className="text-xs text-cyber-muted">
              {analytics.weakPasswords} Weak • {analytics.reusedPasswords} Reused
            </span>
          </div>

          {analytics.issues.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-cyber-success mx-auto" />
              <p className="text-base font-display font-bold text-white">No Vulnerabilities Detected</p>
              <p className="text-xs text-cyber-muted max-w-sm mx-auto leading-relaxed">
                All stored credentials in your vault pass entropy thresholds and contain no cross-account reuse.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {analytics.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl bg-cyber-bg border border-cyber-border hover:border-cyber-cyan/40 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          issue.severity === 'HIGH'
                            ? 'bg-cyber-danger/15 text-cyber-danger border border-cyber-danger/30'
                            : issue.severity === 'MEDIUM'
                            ? 'bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30'
                            : 'bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-bold text-white text-sm">{issue.title}</span>
                    </div>

                    <button
                      onClick={() => onNavigate('vault')}
                      className="px-2.5 py-1 rounded-lg bg-cyber-primary/20 hover:bg-cyber-primary text-cyber-cyan hover:text-white border border-cyber-primary/30 text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Remediate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-cyber-muted text-xs leading-relaxed font-sans">
                    {issue.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-cyber-card/60 border border-cyber-border/60 text-[11px] text-cyber-cyan/90 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Recommendation: {issue.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documented Scoring Methodology */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3 text-xs">
        <h3 className="font-display font-bold text-sm text-white">
          Documented Health Scoring Formula & Methodology
        </h3>
        <p className="text-cyber-muted leading-relaxed font-sans text-xs">
          The VAULTFORGE security score is computed deterministically in memory. Base score starts at <strong className="text-white">100</strong>.
          Deductions are applied as: <code className="text-cyber-danger">-15 points</code> per weak or short password;
          <code className="text-cyber-danger">-12 points</code> per reused credential instance;
          <code className="text-cyber-warning">-4 points</code> per unrotated credential older than the configured threshold (default 90 days).
          Scores are clamped between 10 and 100.
        </p>
      </div>
    </div>
  );
};

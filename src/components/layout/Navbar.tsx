import React, { useEffect, useState } from 'react';
import { VaultForgeLogo } from '../common/VaultForgeLogo';
import { useVaultStore } from '../../store/vaultStore';
import { useTelemetryStore } from '../../store/telemetryStore';
import {
  Lock,
  Unlock,
  AlertOctagon,
  KeyRound,
  Terminal,
  Clock,
  LogOut,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentTab }) => {
  const {
    activeVault,
    isUnlocked,
    lockVault,
    panicLock,
    autoLockRemainingSeconds,
    isDemoMode,
    exitDemoMode,
    updateActivity
  } = useVaultStore();

  const { toggleDrawer, logs } = useTelemetryStore();
  const [secondsLeft, setSecondsLeft] = useState(autoLockRemainingSeconds);

  useEffect(() => {
    setSecondsLeft(autoLockRemainingSeconds);
  }, [autoLockRemainingSeconds]);

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-cyber-bg/90 border-b border-cyber-border backdrop-blur-md">
      {/* Persistent Demo Sandbox Banner */}
      {isDemoMode && (
        <div className="w-full bg-cyber-violet/20 border-b border-cyber-violet/40 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-cyber-violet">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="font-bold tracking-wider uppercase">
              DEMO SANDBOX ACTIVE — ISOLATED TEST ENVIRONMENT
            </span>
            <span className="text-cyber-muted text-[11px] hidden sm:inline">
              (No production vault data will be touched)
            </span>
          </div>
          <button
            onClick={exitDemoMode}
            className="px-2 py-0.5 rounded bg-cyber-violet text-white font-bold text-[10px] hover:bg-cyber-violet/80 transition-colors uppercase tracking-wider"
          >
            Exit & Wipe Demo Data
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => onNavigate(isUnlocked ? 'dashboard' : 'landing')}
          className="cursor-pointer flex items-center gap-3 shrink-0"
        >
          <VaultForgeLogo size="md" />
        </div>

        {/* Center / Status indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          {isUnlocked && activeVault && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-card border border-cyber-border">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeVault.color || '#2F6BFF' }}
              />
              <span className="font-semibold text-cyber-text truncate max-w-[140px]">
                {activeVault.name}
              </span>
              <span className="text-cyber-muted text-[10px]">
                [Argon2id KDF]
              </span>
            </div>
          )}

          {isUnlocked && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] ${
                secondsLeft < 60
                  ? 'bg-cyber-danger/10 border-cyber-danger/40 text-cyber-danger animate-pulse'
                  : 'bg-cyber-card border-cyber-border text-cyber-muted'
              }`}
              title="Automatic lock timer (resets on user interaction)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Auto-lock: {formatTime(secondsLeft)}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* C-Telemetry Drawer Button */}
          <button
            onClick={toggleDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 text-cyber-muted hover:text-cyber-cyan text-xs font-mono transition-colors"
            title="Toggle C-Engine Telemetry Drawer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="hidden lg:inline">Telemetry</span>
            <span className="px-1 py-0.2 rounded bg-cyber-primary/20 text-cyber-cyan text-[10px] font-bold">
              {logs.length}
            </span>
          </button>

          {isUnlocked ? (
            <>
              {/* Quick Password Generator */}
              <button
                onClick={() => onNavigate('generator')}
                className={`p-2 rounded-lg border transition-colors ${
                  currentTab === 'generator'
                    ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-cyan'
                    : 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
                }`}
                title="Quick Password Generator"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              {/* Standard Lock */}
              <button
                onClick={() => lockVault()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-elevated border border-cyber-border text-cyber-muted hover:text-cyber-text text-xs font-mono transition-colors"
                title="Lock Vault"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>

              {/* Panic Lock Button */}
              <button
                onClick={() => panicLock()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-danger/15 hover:bg-cyber-danger/25 border border-cyber-danger/40 text-cyber-danger font-mono text-xs font-bold transition-all shadow-cyber-sm hover:shadow-[0_0_15px_rgba(255,77,109,0.3)]"
                title="Panic Lock: Immediate zeroing of key buffers and session wipe (Ctrl+Shift+L)"
              >
                <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                <span>Panic Lock</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('unlock')}
                className="px-3.5 py-1.5 rounded-lg bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 shadow-cyber-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Vault</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

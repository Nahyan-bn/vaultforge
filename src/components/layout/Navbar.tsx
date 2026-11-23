import React, { useEffect, useState, useRef } from 'react';
import { VaultForgeLogo } from '../common/VaultForgeLogo';
import { useVaultStore } from '../../store/vaultStore';
import { useTelemetryStore } from '../../store/telemetryStore';
import type { LoginCredential } from '../../types/vault';
import {
  Lock,
  Unlock,
  AlertOctagon,
  KeyRound,
  Terminal,
  Clock,
  Sparkles,
  Search,
  ShieldCheck,
  User,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Cpu,
  Key,
  X,
  Plus
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentTab }) => {
  const {
    availableVaults,
    activeVault,
    isUnlocked,
    records,
    lockVault,
    panicLock,
    autoLockRemainingSeconds,
    isDemoMode,
    exitDemoMode
  } = useVaultStore();

  const { toggleDrawer, logs } = useTelemetryStore();
  const [secondsLeft, setSecondsLeft] = useState(autoLockRemainingSeconds);

  // Command Palette / Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSecondsLeft(autoLockRemainingSeconds);
  }, [autoLockRemainingSeconds]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isUnlocked) {
          setIsSearchOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Search Results
  const filteredRecords = searchQuery.trim()
    ? records
        .filter((r) => !r.isDeleted)
        .filter((r) => {
          const q = searchQuery.toLowerCase();
          const title = r.title.toLowerCase();
          const cat = (r.category || '').toLowerCase();
          const user = r.type === 'login' ? (r as LoginCredential).username.toLowerCase() : '';
          const tags = (r.tags || []).join(' ').toLowerCase();
          return title.includes(q) || cat.includes(q) || user.includes(q) || tags.includes(q);
        })
        .slice(0, 8)
    : [];

  const handleCopyUsername = (username: string, id: string) => {
    navigator.clipboard.writeText(username);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-cyber-bg/90 border-b border-cyber-border backdrop-blur-md select-none">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div
            onClick={() => onNavigate(isUnlocked ? 'dashboard' : 'landing')}
            className="cursor-pointer flex items-center gap-3 shrink-0"
          >
            <VaultForgeLogo size="md" />
          </div>

          {/* Center: Search & Vault Info */}
          {isUnlocked && (
            <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-3">
              {/* Active Vault Badge */}
              {activeVault && (
                <div
                  onClick={() => onNavigate('dashboard')}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-colors shrink-0 text-xs font-mono"
                  title="Active Encrypted Vault"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeVault.color || '#2F6BFF' }}
                  />
                  <span className="font-semibold text-white truncate max-w-[120px]">
                    {activeVault.name}
                  </span>
                  <span className="text-cyber-cyan text-[10px] font-bold hidden lg:inline">
                    [Argon2id KDF]
                  </span>
                </div>
              )}

              {/* Global Search Trigger Bar */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-cyber-card/70 hover:bg-cyber-card border border-cyber-border hover:border-cyber-cyan/50 text-cyber-muted text-xs font-mono transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-3.5 h-3.5 text-cyber-muted group-hover:text-cyber-cyan transition-colors" />
                  <span className="truncate group-hover:text-cyber-text transition-colors">
                    Search decrypted vault...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyber-bg text-[10px] text-cyber-muted font-bold border border-cyber-border">
                  ⌘K
                </kbd>
              </button>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Security Status Badge */}
            {isUnlocked && (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-success/10 border border-cyber-success/30 text-cyber-success text-[10px] font-mono font-bold tracking-wider"
                title="XChaCha20-Poly1305 AEAD authenticated envelope. Memory sanitized with sodium_memzero."
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-pulse" />
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-BIT ENCRYPTED · ZERO-LEAK</span>
              </div>
            )}

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

                {/* Auto-lock countdown */}
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                    secondsLeft < 60
                      ? 'bg-cyber-danger/10 border-cyber-danger/40 text-cyber-danger animate-pulse font-bold'
                      : 'bg-cyber-card border-cyber-border text-cyber-muted'
                  }`}
                  title="Automatic lock timer (resets on user interaction)"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(secondsLeft)}</span>
                </div>

                {/* Standard Lock */}
                <button
                  onClick={() => lockVault()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyber-card hover:bg-cyber-elevated border border-cyber-border text-cyber-muted hover:text-cyber-text text-xs font-mono transition-colors"
                  title="Lock Vault"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>

                {/* Panic Lock Button */}
                <button
                  onClick={() => panicLock()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-danger/15 hover:bg-cyber-danger/25 border border-cyber-danger/40 text-cyber-danger font-mono text-xs font-bold transition-all shadow-cyber-sm hover:shadow-[0_0_15px_rgba(255,77,109,0.3)] animate-pulse"
                  title="Panic Lock: Immediate zeroing of key buffers and session wipe (Ctrl+Shift+L)"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Panic Lock</span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 transition-colors"
                    title="User Profile & Security Status"
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyber-primary to-cyber-cyan flex items-center justify-center text-white text-[11px] font-bold font-mono">
                      {activeVault?.name?.charAt(0) || 'V'}
                    </div>
                    <ChevronDown className="w-3 h-3 text-cyber-muted" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-cyber-bgSecondary border border-cyber-border shadow-2xl backdrop-blur-xl p-3 space-y-3 z-50 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-cyber-muted uppercase">Security Tier</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyber-primary/20 text-cyber-cyan border border-cyber-primary/40 font-bold">
                            MIL-SPEC C11
                          </span>
                        </div>
                        <div className="font-bold text-white truncate">
                          {activeVault?.name || 'Default Vault'}
                        </div>
                        <div className="text-[10px] text-cyber-muted truncate">
                          Argon2id (m: 64MB, t: 3, p: 1)
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('identity');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyber-elevated text-cyber-text transition-colors text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
                          <span>Identity & Multi-Auth</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('diagnostics');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyber-elevated text-cyber-text transition-colors text-left"
                        >
                          <Cpu className="w-4 h-4 text-cyber-violet" />
                          <span>System Diagnostics</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onNavigate('settings');
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-cyber-elevated text-cyber-text transition-colors text-left"
                        >
                          <Key className="w-4 h-4 text-cyber-muted" />
                          <span>Vault Preferences</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-cyber-border flex items-center justify-between">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            lockVault();
                          }}
                          className="text-cyber-muted hover:text-white text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Lock Vault</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            panicLock();
                          }}
                          className="text-cyber-danger hover:underline text-[11px] font-bold"
                        >
                          Panic Wipe
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Global Command Palette / Fuzzy Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-cyber-bgSecondary border border-cyber-cyan/40 shadow-2xl backdrop-blur-2xl overflow-hidden font-mono flex flex-col max-h-[540px]">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-cyber-border bg-cyber-bg/80">
              <Search className="w-5 h-5 text-cyber-cyan" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search credentials by title, username, category or tag..."
                autoFocus
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-cyber-muted/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded hover:bg-cyber-card text-cyber-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-0.5 rounded bg-cyber-card text-[10px] text-cyber-muted border border-cyber-border">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {searchQuery.trim() === '' ? (
                <div className="py-10 text-center space-y-2">
                  <Search className="w-8 h-8 text-cyber-muted/40 mx-auto" />
                  <p className="text-xs text-cyber-muted">Type to search decrypted vault items in real time</p>
                  <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-cyber-muted">
                    <span className="px-2 py-0.5 rounded bg-cyber-card border border-cyber-border">⌘K to Open</span>
                    <span className="px-2 py-0.5 rounded bg-cyber-card border border-cyber-border">ESC to Close</span>
                  </div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-12 text-center text-xs text-cyber-muted">
                  No decrypted credentials match "<span className="text-cyber-cyan">{searchQuery}</span>".
                </div>
              ) : (
                filteredRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-cyber-bg hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => {
                        setIsSearchOpen(false);
                        onNavigate('vault');
                      }}
                      className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-center text-cyber-cyan shrink-0">
                        {r.type === 'login' ? <KeyRound className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">{r.title}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyber-card border border-cyber-border text-cyber-muted">
                            {r.category || 'General'}
                          </span>
                        </div>
                        {r.type === 'login' && (
                          <span className="text-[11px] text-cyber-muted truncate block">
                            {(r as LoginCredential).username}
                          </span>
                        )}
                      </div>
                    </div>

                    {r.type === 'login' && (
                      <button
                        onClick={() => handleCopyUsername((r as LoginCredential).username, r.id)}
                        className="px-2 py-1 rounded bg-cyber-card hover:bg-cyber-elevated border border-cyber-border text-[11px] text-cyber-muted hover:text-cyber-cyan transition-colors flex items-center gap-1 shrink-0"
                        title="Copy Username"
                      >
                        {copiedId === r.id ? (
                          <>
                            <Check className="w-3 h-3 text-cyber-success" />
                            <span className="text-cyber-success">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy User</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-cyber-border bg-cyber-bg/90 flex items-center justify-between text-xs text-cyber-muted">
              <span className="text-[11px]">
                Showing {filteredRecords.length} matching items
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    onNavigate('vault');
                  }}
                  className="hover:text-cyber-cyan transition-colors"
                >
                  Open Vault View →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

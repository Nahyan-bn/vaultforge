import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  KeyRound,
  FlaskConical,
  Database,
  History,
  CheckCircle2,
  Lock,
  Download,
  Settings,
  BookOpen,
  Radio,
  FileCode2,
  Fingerprint,
  ShieldCheck,
  Star,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Binary,
  PanelLeftClose,
  PanelLeftOpen,
  IdCard,
  Key
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isUnlocked: boolean;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  requiresUnlock: boolean;
  description?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isUnlocked,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('vaultforge_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('vaultforge_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'CORE',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          requiresUnlock: true,
          description: 'Overview metrics, health score & quick actions'
        },
        {
          id: 'vault',
          label: 'Password Vault',
          icon: Database,
          requiresUnlock: true,
          description: 'All logins, secure notes, cards & identities'
        },
        {
          id: 'favorites',
          label: 'Favorites',
          icon: Star,
          requiresUnlock: true,
          description: 'Starred credentials & quick access'
        },
        {
          id: 'generator',
          label: 'Password Studio',
          icon: KeyRound,
          requiresUnlock: false,
          description: 'CSPRNG generator & entropy visualizer'
        },
        {
          id: 'audit',
          label: 'Security Center',
          icon: Radio,
          badge: 'RADAR',
          badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30',
          requiresUnlock: true,
          description: 'Breach monitor, weak password & reuse audit'
        },
        {
          id: 'identity-biometric',
          label: 'Biometric Identity',
          icon: Fingerprint,
          badge: 'WEBAUTHN',
          badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30',
          requiresUnlock: true,
          description: 'Windows Hello passkey & iris scanner'
        },
        {
          id: 'identity-pin',
          label: 'PIN Security',
          icon: Key,
          badge: '6-DIGIT',
          badgeColor: 'bg-cyber-primary/20 text-cyber-cyan border-cyber-primary/30',
          requiresUnlock: true,
          description: 'Hardware-independent Argon2id 6-digit PIN'
        },
        {
          id: 'identity-gov',
          label: 'Digital Identity',
          icon: IdCard,
          badge: 'KYC',
          badgeColor: 'bg-cyber-violet/20 text-cyber-violet border-cyber-violet/30',
          requiresUnlock: true,
          description: 'Government UIDAI / DigiLocker verification sandbox'
        }
      ]
    },
    {
      title: 'CRYPTOGRAPHY (CAPSTONE)',
      items: [
        {
          id: 'lab',
          label: 'Cryptography Lab',
          icon: FlaskConical,
          badge: 'C-CORE',
          badgeColor: 'bg-cyber-violet/20 text-cyber-violet border-cyber-violet/30',
          requiresUnlock: false,
          description: 'Live interactive C11 primitives testbed'
        },
        {
          id: 'attacks',
          label: 'Attack Simulation',
          icon: ShieldAlert,
          badge: 'WORKER',
          badgeColor: 'bg-cyber-warning/20 text-cyber-warning border-cyber-warning/30',
          requiresUnlock: false,
          description: 'Brute-force & GPU cracking cost calculator'
        },
        {
          id: 'integrity',
          label: 'Integrity Monitor',
          icon: CheckCircle2,
          requiresUnlock: true,
          description: 'Poly1305 MAC tamper detection & verification'
        },
        {
          id: 'audit-logs',
          label: 'Security Ops (Audit)',
          icon: History,
          requiresUnlock: true,
          description: 'Hash-linked tamper-evident audit event trail'
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'backup',
          label: 'Backup & Restore',
          icon: Download,
          requiresUnlock: true,
          description: 'Encrypted JSON envelope export & import'
        },
        {
          id: 'diagnostics',
          label: 'System Diagnostics',
          icon: Cpu,
          badge: 'TELEMETRY',
          badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30',
          requiresUnlock: false,
          description: 'WASM heap monitor, C vs JS benchmark & logs'
        },
        {
          id: 'learn',
          label: 'Learn & Viva Guide',
          icon: BookOpen,
          badge: 'VIVA',
          badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30',
          requiresUnlock: false,
          description: 'Capstone viva defense guide & algorithm cards'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          requiresUnlock: false,
          description: 'Vault preferences, timeouts & security tuning'
        }
      ]
    }
  ];

  return (
    <aside
      className={`bg-cyber-bgSecondary/95 border-r border-cyber-border flex flex-col shrink-0 select-none transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Collapse/Expand Toggle Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-cyber-border/60">
        {!isCollapsed && (
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyber-cyan uppercase">
            NAVIGATION
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          className={`p-1.5 rounded-lg bg-cyber-card hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-cyan border border-cyber-border transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-cyber-muted/70 uppercase">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                // Active calculation matches current tab or parent alias
                const isActive =
                  currentTab === item.id ||
                  (item.id.startsWith('identity') && currentTab === 'identity') ||
                  (item.id === 'audit-logs' && currentTab === 'audit');
                const isLockedOut = item.requiresUnlock && !isUnlocked;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => {
                        if (isLockedOut) {
                          onNavigate('unlock');
                        } else {
                          onNavigate(item.id);
                        }
                      }}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                      } py-2 rounded-lg text-xs font-mono transition-all duration-150 ${
                        isActive
                          ? 'bg-cyber-primary/20 text-cyber-cyan font-bold border border-cyber-primary/40 shadow-cyber-sm'
                          : isLockedOut
                          ? 'text-cyber-muted/50 hover:bg-cyber-card/30 hover:text-cyber-muted cursor-pointer'
                          : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-cyber-cyan'
                              : isLockedOut
                              ? 'text-cyber-muted/40'
                              : 'text-cyber-muted group-hover:text-cyber-text'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLockedOut && <Lock className="w-3 h-3 text-cyber-muted/40" />}
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="fixed left-20 z-50 ml-2 hidden group-hover:flex flex-col p-2.5 rounded-xl bg-cyber-bgSecondary border border-cyber-cyan/40 shadow-2xl backdrop-blur-md pointer-events-none min-w-[180px] max-w-[240px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[8px] px-1 py-0.2 rounded border font-bold ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[10px] text-cyber-muted mt-1 font-sans">
                            {item.description}
                          </p>
                        )}
                        {isLockedOut && (
                          <span className="text-[9px] text-cyber-warning flex items-center gap-1 mt-1 font-mono">
                            <Lock className="w-2.5 h-2.5" /> Requires Vault Unlock
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info: Team Attribution */}
      <div className="p-3 border-t border-cyber-border bg-cyber-bg/60 text-[10px] font-mono text-cyber-muted space-y-1">
        {isCollapsed ? (
          <div className="flex justify-center" title="Nahyan Bin Nawaf • Sudharsan • Dinesh (C11/WASM)">
            <Shield className="w-4 h-4 text-cyber-cyan" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-cyber-cyan font-bold">CAPSTONE TEAM</span>
              <span className="px-1 rounded bg-cyber-card border border-cyber-border text-[9px]">C11/WASM</span>
            </div>
            <div className="text-[11px] text-cyber-text font-sans truncate">
              Nahyan Bin Nawaf • Sudharsan • Dinesh
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

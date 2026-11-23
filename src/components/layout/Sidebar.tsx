import React from 'react';
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
  Fingerprint
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isUnlocked: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isUnlocked,
  className = ''
}) => {
  const navSections = [
    {
      title: 'CORE VAULT',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, requiresUnlock: true },
        { id: 'auth', label: 'Auth Dashboard', icon: Fingerprint, badge: 'MULTI-LAYER', badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30', requiresUnlock: false },
        { id: 'vault', label: 'Credential Vault', icon: Database, requiresUnlock: true },
        { id: 'generator', label: 'Password Studio', icon: KeyRound, requiresUnlock: false },
        { id: 'radar', label: 'Health Radar', icon: Radio, requiresUnlock: true },
      ]
    },
    {
      title: 'CAPSTONE CRYPTOGRAPHY',
      items: [
        { id: 'lab', label: 'Cryptography Lab', icon: FlaskConical, badge: 'C-CORE', badgeColor: 'bg-cyber-violet/20 text-cyber-violet border-cyber-violet/30', requiresUnlock: false },
        { id: 'attacks', label: 'Attack Simulation', icon: ShieldAlert, badge: 'WORKER', badgeColor: 'bg-cyber-warning/20 text-cyber-warning border-cyber-warning/30', requiresUnlock: false },
        { id: 'integrity', label: 'Integrity Monitor', icon: CheckCircle2, requiresUnlock: true },
        { id: 'audit', label: 'Security Ops (Audit)', icon: History, requiresUnlock: true },
      ]
    },
    {
      title: 'SYSTEM & DELIVERABLES',
      items: [
        { id: 'backup', label: 'Backup & Restore', icon: Download, requiresUnlock: true },
        { id: 'settings', label: 'Settings', icon: Settings, requiresUnlock: false },
        { id: 'learn', label: 'Learn & Viva Guide', icon: BookOpen, badge: 'VIVA', badgeColor: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30', requiresUnlock: false },
      ]
    }
  ];

  return (
    <aside className={`w-64 bg-cyber-bgSecondary/95 border-r border-cyber-border flex flex-col shrink-0 select-none ${className}`}>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-cyber-muted/70 uppercase">
              {section.title}
            </div>

            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const isLockedOut = item.requiresUnlock && !isUnlocked;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isLockedOut) {
                        onNavigate('unlock');
                      } else {
                        onNavigate(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 group ${
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
                      <span className="truncate">{item.label}</span>
                    </div>

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
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info: Team Attribution */}
      <div className="p-3 border-t border-cyber-border bg-cyber-bg/60 text-[10px] font-mono text-cyber-muted space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-cyber-cyan font-bold">CAPSTONE TEAM</span>
          <span className="px-1 rounded bg-cyber-card border border-cyber-border text-[9px]">C11/WASM</span>
        </div>
        <div className="text-[11px] text-cyber-text font-sans truncate">
          Nahyan Bin Nawaf • Sudharsan • Dinesh
        </div>
      </div>
    </aside>
  );
};

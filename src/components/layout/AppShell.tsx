import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TelemetryDrawer } from '../telemetry/TelemetryDrawer';
import { useVaultStore } from '../../store/vaultStore';
import { Menu, X, ShieldAlert } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentTab, onNavigate }) => {
  const { isUnlocked, panicLock, lockVault, autoLockRemainingSeconds, updateActivity, refreshVaults } = useVaultStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPanicBanner, setShowPanicBanner] = useState(false);

  // Initialize vault store list on mount
  useEffect(() => {
    refreshVaults();
  }, [refreshVaults]);

  // Global user activity detection
  useEffect(() => {
    const handleActivity = () => {
      if (isUnlocked) {
        updateActivity();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isUnlocked, updateActivity]);

  // Auto-lock countdown ticker
  useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(() => {
      useVaultStore.setState((state) => {
        if (state.autoLockRemainingSeconds <= 1) {
          state.lockVault();
          return { autoLockRemainingSeconds: 0 };
        }
        return { autoLockRemainingSeconds: state.autoLockRemainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Global Keyboard Shortcuts (Ctrl+Shift+L / Cmd+Shift+L for Panic Lock)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        panicLock();
        setShowPanicBanner(true);
        setTimeout(() => setShowPanicBanner(false), 4000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicLock]);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans selection:bg-cyber-primary/30 selection:text-cyber-cyan">
      <Navbar onNavigate={onNavigate} currentTab={currentTab} />

      {/* Panic Lock Activation Confirmation Toast */}
      {showPanicBanner && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-cyber-danger/90 border border-cyber-danger text-white shadow-2xl backdrop-blur-lg animate-bounce">
          <ShieldAlert className="w-5 h-5" />
          <div className="font-mono text-xs">
            <p className="font-bold">PANIC LOCK TRIGGERED</p>
            <p className="text-[11px] opacity-90">Session terminated, memory zeroed via sodium_memzero.</p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-cyber-bgSecondary border-b border-cyber-border">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-mono text-cyber-cyan p-1.5 rounded-lg bg-cyber-card border border-cyber-border"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>NAVIGATION MENU</span>
        </button>
        <span className="text-xs font-mono text-cyber-muted capitalize">
          {currentTab.replace('-', ' ')}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={(tab) => {
            onNavigate(tab);
            setMobileMenuOpen(false);
          }}
          isUnlocked={isUnlocked}
          className="hidden lg:flex"
        />

        {/* Mobile Sidebar Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <Sidebar
              currentTab={currentTab}
              onNavigate={(tab) => {
                onNavigate(tab);
                setMobileMenuOpen(false);
              }}
              isUnlocked={isUnlocked}
              className="relative z-50 w-72"
            />
          </div>
        )}

        {/* Main Application Viewport */}
        <main className="flex-1 overflow-y-auto bg-cyber-bg p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Realtime C-Engine Telemetry Drawer */}
      <TelemetryDrawer />
    </div>
  );
};

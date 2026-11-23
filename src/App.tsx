import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { VaultCreation } from './pages/VaultCreation';
import { UnlockVault } from './pages/UnlockVault';
import { Dashboard } from './pages/Dashboard';
import { CredentialVault } from './pages/CredentialVault';
import { PasswordGenerator } from './pages/PasswordGenerator';
import { HealthRadar } from './pages/HealthRadar';
import { CryptoLab } from './pages/CryptoLab';
import { AttackLab } from './pages/AttackLab';
import { SecurityCenter } from './pages/SecurityCenter';
import { IntegrityMonitor } from './pages/IntegrityMonitor';
import { BackupRestore } from './pages/BackupRestore';
import { Settings } from './pages/Settings';
import { LearnCenter } from './pages/LearnCenter';
import { AuthDashboard } from './components/auth/AuthDashboard';
import { useVaultStore } from './store/vaultStore';

export const App: React.FC = () => {
  const { isUnlocked } = useVaultStore();
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Handle navigation
  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell currentTab={currentTab} onNavigate={handleNavigate}>
      {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentTab === 'create' && <VaultCreation onNavigate={handleNavigate} />}
      {currentTab === 'unlock' && <UnlockVault onNavigate={handleNavigate} />}
      {currentTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentTab === 'auth' && <AuthDashboard onNavigate={handleNavigate} onOpenSettings={() => handleNavigate('settings')} />}
      {currentTab === 'vault' && <CredentialVault onNavigate={handleNavigate} />}
      {currentTab === 'generator' && <PasswordGenerator onNavigate={handleNavigate} />}
      {currentTab === 'radar' && <HealthRadar onNavigate={handleNavigate} />}
      {currentTab === 'lab' && <CryptoLab />}
      {currentTab === 'attacks' && <AttackLab />}
      {currentTab === 'integrity' && <IntegrityMonitor />}
      {currentTab === 'audit' && <SecurityCenter />}
      {currentTab === 'backup' && <BackupRestore />}
      {currentTab === 'settings' && <Settings onNavigate={handleNavigate} />}
      {currentTab === 'learn' && <LearnCenter />}
    </AppShell>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Fingerprint,
  Lock,
  Eye,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useVaultStore } from '../../store/vaultStore';
import { webAuthnService } from '../../services/webAuthnService';
import { IrisScannerModal } from './IrisScannerModal';
import { GovernmentVerificationModal } from './GovernmentVerificationModal';
import type { AuthMethodType } from '../../types/auth';

interface AuthDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenSettings?: () => void;
}

export const AuthDashboard: React.FC<AuthDashboardProps> = ({
  onNavigate,
  onOpenSettings
}) => {
  const {
    activeVault,
    isUnlocked,
    setPreferredAuthMethod,
    updateGovVerification,
    updateIrisConfig
  } = useVaultStore();

  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState(false);
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);

  useEffect(() => {
    webAuthnService.isPlatformAuthenticatorAvailable().then(setHasPlatformAuthenticator);
  }, []);

  const preferredMethod = activeVault?.preferredAuthMethod || 'password';

  const authLayers = [
    {
      id: 'password',
      name: 'Master Password',
      category: 'PRIMARY AUTHENTICATION',
      icon: Key,
      description: 'Argon2id Memory-Hard Key Derivation (C11 Core) wrapping 256-bit DEK.',
      status: 'ACTIVE_PRIMARY',
      badge: 'C-CORE ACTIVE',
      badgeClass: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30',
      isConfigured: true,
      canSetPreferred: true,
      actionLabel: 'Manage in Settings',
      onAction: () => onOpenSettings ? onOpenSettings() : onNavigate?.('settings')
    },
    {
      id: 'biometric',
      name: 'Fingerprint / Windows Hello',
      category: 'BIOMETRIC PASSKEY',
      icon: Fingerprint,
      description: 'Hardware platform authenticator (Touch ID, Windows Hello, FIDO2 Passkeys) with zero raw biometric storage.',
      status: activeVault?.biometricAuth?.enabled
        ? 'REGISTERED'
        : hasPlatformAuthenticator
        ? 'AVAILABLE'
        : 'HARDWARE_REQUIRED',
      badge: activeVault?.biometricAuth?.enabled
        ? 'PASSKEY REGISTERED'
        : hasPlatformAuthenticator
        ? 'READY TO PAIR'
        : 'TPM / BIO REQUIRED',
      badgeClass: activeVault?.biometricAuth?.enabled
        ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/30'
        : hasPlatformAuthenticator
        ? 'bg-cyber-primary/20 text-cyber-primary border-cyber-primary/40'
        : 'bg-cyber-muted/10 text-cyber-muted border-cyber-border',
      isConfigured: !!activeVault?.biometricAuth?.enabled,
      canSetPreferred: !!activeVault?.biometricAuth?.enabled,
      actionLabel: activeVault?.biometricAuth?.enabled ? 'Manage Passkey' : 'Register Biometrics',
      onAction: () => onOpenSettings ? onOpenSettings() : onNavigate?.('settings')
    },
    {
      id: 'pin',
      name: 'Six-Digit Security PIN',
      category: 'NUMERIC ENVELOPE',
      icon: Lock,
      description: 'Fast numeric unlock backed by dedicated Argon2id KEK envelope with 5-attempt brute-force lockout.',
      status: activeVault?.pinAuth?.enabled ? 'CONFIGURED' : 'NOT_CONFIGURED',
      badge: activeVault?.pinAuth?.enabled ? 'ENVELOPE ACTIVE' : 'UNCONFIGURED',
      badgeClass: activeVault?.pinAuth?.enabled
        ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/30'
        : 'bg-cyber-muted/10 text-cyber-muted border-cyber-border',
      isConfigured: !!activeVault?.pinAuth?.enabled,
      canSetPreferred: !!activeVault?.pinAuth?.enabled,
      actionLabel: activeVault?.pinAuth?.enabled ? 'Configure PIN' : 'Set 6-Digit PIN',
      onAction: () => onOpenSettings ? onOpenSettings() : onNavigate?.('settings')
    },
    {
      id: 'iris',
      name: 'Iris / Retinal Scanning',
      category: 'EXPERIMENTAL BIOMETRIC',
      icon: Eye,
      description: 'Pluggable ISO/IEC 19794-6 driver architecture with optical pupil segmentation and 2D Gabor wavelet matching.',
      status: 'DEMO_READY',
      badge: 'DEMONSTRATION MODE',
      badgeClass: 'bg-cyber-warning/15 text-cyber-warning border-cyber-warning/30',
      isConfigured: true,
      canSetPreferred: false,
      actionLabel: 'Launch Scanner HUD',
      onAction: () => setIsIrisModalOpen(true)
    },
    {
      id: 'government',
      name: 'Government Identity Verification',
      category: 'STATUTORY KYC / COMPLIANCE',
      icon: Building2,
      description: 'UIDAI Aadhaar / National ID sandbox architecture with OTP workflow, synthetic masking, and BLAKE2b receipt hashing.',
      status: activeVault?.govVerification?.status || 'UNVERIFIED',
      badge: activeVault?.govVerification?.status === 'DEMO_VERIFIED'
        ? 'DEMO VERIFIED'
        : activeVault?.govVerification?.status === 'OFFICIALLY_VERIFIED'
        ? 'OFFICIALLY VERIFIED'
        : 'UNVERIFIED SANDBOX',
      badgeClass: activeVault?.govVerification?.status === 'DEMO_VERIFIED'
        ? 'bg-cyber-warning/15 text-cyber-warning border-cyber-warning/30'
        : activeVault?.govVerification?.status === 'OFFICIALLY_VERIFIED'
        ? 'bg-cyber-success/15 text-cyber-success border-cyber-success/30'
        : 'bg-cyber-muted/10 text-cyber-muted border-cyber-border',
      isConfigured: !!activeVault?.govVerification,
      canSetPreferred: false,
      actionLabel: activeVault?.govVerification ? 'View Certificate' : 'Initiate Verification',
      onAction: () => setIsGovModalOpen(true)
    }
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-cyber-card/90 border border-cyber-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-cyan" />
              <h2 className="text-lg font-bold text-white tracking-wider uppercase font-display">
                Multi-Layer Authentication & Identity Architecture
              </h2>
            </div>
            <p className="text-xs text-cyber-muted mt-1">
              Cryptographic envelope hierarchy, platform biometrics, and identity verification gates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-cyber-muted">Default Unlock Method:</span>
            <select
              value={preferredMethod}
              disabled={!isUnlocked}
              onChange={(e) => setPreferredAuthMethod(e.target.value as AuthMethodType)}
              className="h-9 px-3 rounded-lg bg-cyber-elevated border border-cyber-cyan/40 text-xs font-bold text-cyber-cyan focus:outline-none"
            >
              <option value="password">Master Password</option>
              {activeVault?.pinAuth?.enabled && <option value="pin">Six-Digit PIN</option>}
              {activeVault?.biometricAuth?.enabled && <option value="biometric">Fingerprint / WebAuthn</option>}
            </select>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="p-3 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Authentication Layers:</span> Master Password, PIN, and WebAuthn Biometrics mathematically unwrap the 256-bit Data Encryption Key (DEK). Zero plain secrets are stored.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-cyber-warning shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Identity Verification vs Access:</span> Government Verification & Iris Scanning provide compliance auditing and biometric proofs without weakening master vault keys.
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Authentication & Identity Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {authLayers.map((layer) => {
          const Icon = layer.icon;
          const isPreferred = preferredMethod === layer.id;

          return (
            <div
              key={layer.id}
              className={`p-5 rounded-2xl bg-cyber-card/70 border flex flex-col justify-between transition-all duration-200 hover:border-cyber-cyan/40 ${
                isPreferred
                  ? 'border-cyber-cyan/60 shadow-[0_0_20px_rgba(34,227,255,0.1)] bg-cyber-card'
                  : 'border-cyber-border'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyber-elevated border border-cyber-border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cyber-cyan" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${layer.badgeClass}`}>
                    {layer.badge}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-cyber-muted tracking-wider uppercase">
                    {layer.category}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span>{layer.name}</span>
                    {isPreferred && (
                      <span className="text-[9px] bg-cyber-cyan/20 text-cyber-cyan px-1.5 py-0.2 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyber-muted mt-1.5 leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-cyber-border/50 mt-4 flex items-center justify-between">
                <div className="text-[11px] text-cyber-muted">
                  {layer.isConfigured ? (
                    <span className="text-cyber-success flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="text-cyber-muted">Not Set</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={layer.onAction}
                  className="px-3 py-1.5 rounded-lg bg-cyber-elevated hover:bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 text-xs font-bold text-cyber-cyan flex items-center gap-1 transition-all"
                >
                  <span>{layer.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Iris Scanner Modal */}
      <IrisScannerModal
        isOpen={isIrisModalOpen}
        onClose={() => setIsIrisModalOpen(false)}
        onScanComplete={(result) => {
          updateIrisConfig({
            driverType: 'SIMULATED_DEMO_OPTICAL',
            allowSimulationDemo: true,
            lastScanResult: result,
            updatedAt: Date.now()
          });
        }}
      />

      {/* Government Verification Modal */}
      <GovernmentVerificationModal
        isOpen={isGovModalOpen}
        onClose={() => setIsGovModalOpen(false)}
        onVerified={(record) => {
          updateGovVerification(record);
        }}
      />
    </div>
  );
};

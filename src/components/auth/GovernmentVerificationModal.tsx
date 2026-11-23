import React, { useState } from 'react';
import {
  Shield,
  FileCheck2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Building2,
  HelpCircle
} from 'lucide-react';
import { governmentIdRegistry } from '../../services/governmentIdService';
import type { GovernmentVerificationRecord } from '../../types/auth';

interface GovernmentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (record: GovernmentVerificationRecord) => void;
}

export const GovernmentVerificationModal: React.FC<GovernmentVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Statutory Consent, 2: Masked Aadhaar Input, 3: OTP Challenge, 4: Certificate
  const [providerId, setProviderId] = useState('MOCK_UIDAI_AADHAAR');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [activeTxnId, setActiveTxnId] = useState('');
  const [testHintOtp, setTestHintOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<GovernmentVerificationRecord | null>(null);

  const provider = governmentIdRegistry.getActiveProvider();

  // Handle formatted 12-digit input with auto spacing
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarInput(formatted);
    setErrorMsg(null);
  };

  const handleUseSyntheticDemoId = () => {
    setAadhaarInput('2345 6789 0123');
    setErrorMsg(null);
  };

  // Step 2 -> 3: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = aadhaarInput.replace(/\D/g, '');
    if (cleanDigits.length !== 12) {
      setErrorMsg('Please enter a 12-digit synthetic test identity number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await provider.requestOtp(cleanDigits);
      setActiveTxnId(res.txnId);
      setTestHintOtp(res.testHintOtp || '');
      setMaskedPhone(res.maskedPhone);
      setTimerSeconds(60);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to request OTP from sandbox provider');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 -> 4: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const record = await provider.verifyOtp(activeTxnId, otpInput, aadhaarInput);
      setVerificationResult(record);
      setStep(4);
      onVerified(record);
    } catch (err: any) {
      setErrorMsg(err?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAadhaarInput('');
    setOtpInput('');
    setErrorMsg(null);
    setVerificationResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-cyber-bgSecondary border border-cyber-cyan/30 shadow-[0_0_50px_rgba(34,227,255,0.15)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-cyber-card/80 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-cyber-cyan" />
            <div>
              <div className="text-xs font-bold text-white tracking-wider uppercase">
                Government Identity Verification Hub
              </div>
              <div className="text-[10px] text-cyber-muted">
                Statutory Architecture · Provider Sandbox Mode
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-cyber-elevated text-cyber-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legal & Regulatory Sandbox Notice Banner */}
        <div className="bg-cyber-warning/10 border-b border-cyber-warning/30 px-5 py-2.5 flex items-start gap-2.5 text-[11px] text-cyber-warning">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-cyber-warning" />
          <div>
            <span className="font-bold uppercase tracking-wider">MOCK GOVERNMENT VERIFICATION ENVIRONMENT:</span> In compliance with UIDAI regulations and privacy laws, this sandbox module operates exclusively with synthetic test identifiers. Real Aadhaar numbers or biometrics must never be submitted.
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* STEP 1: Statutory Consent & Disclaimers */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyber-cyan" />
                <span>Statutory Consent & Electronic Verification Notice</span>
              </div>

              <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border space-y-3 text-xs text-cyber-muted max-h-60 overflow-y-auto leading-relaxed">
                <p>
                  <strong className="text-white">1. Voluntary Identity Association:</strong> You are initiating an electronic identity association workflow within VAULTFORGE. This workflow evaluates cryptographic proof-of-identity protocols.
                </p>
                <p>
                  <strong className="text-white">2. Sandbox Testing Only:</strong> This current environment is configured to the <span className="text-cyber-cyan">UIDAI Mock Verification Provider</span>. No live government database queries are performed.
                </p>
                <p>
                  <strong className="text-white">3. Zero Secret Storage:</strong> VAULTFORGE does not store raw national identification numbers. All verified records store only a cryptographic BLAKE2b receipt hash and masked identifier (<code className="text-cyber-cyan">•••• •••• XXXX</code>).
                </p>
                <p>
                  <strong className="text-white">4. Verification Status:</strong> Successful completion in this sandbox awards the status <span className="text-cyber-warning font-bold">DEMO VERIFIED</span>. The status <span className="text-cyber-cyan font-bold">OFFICIALLY VERIFIED</span> is strictly reserved for live production channels via UIDAI-authorized ASA/KUA or DigiLocker enterprise endpoints.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-cyber-border text-xs text-cyber-muted hover:text-white"
                >
                  Decline & Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 text-xs font-bold text-white flex items-center gap-1.5 shadow-cyber-sm"
                >
                  <span>Accept Consent & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Input Synthetic Aadhaar */}
          {step === 2 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyber-cyan" />
                <span>Enter 12-Digit Synthetic Aadhaar Number</span>
              </div>
              <p className="text-xs text-cyber-muted">
                Input a 12-digit test number to evaluate the OTP challenge flow.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-cyber-muted uppercase tracking-wider">
                  Synthetic Aadhaar Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={handleAadhaarChange}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full h-11 px-4 bg-cyber-card border border-cyber-border rounded-xl text-center font-mono text-base tracking-[0.25em] text-white placeholder-cyber-muted/30 focus:outline-none focus:border-cyber-cyan"
                    autoFocus
                  />
                </div>
              </div>

              {/* Synthetic ID Quick Fill Button */}
              <div className="p-3 rounded-xl bg-cyber-card/60 border border-cyber-border/80 flex items-center justify-between text-xs">
                <span className="text-cyber-muted">Need a compliant test ID?</span>
                <button
                  type="button"
                  onClick={handleUseSyntheticDemoId}
                  className="px-2.5 py-1 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan text-[11px] font-bold"
                >
                  Fill: 2345 6789 0123
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-cyber-danger/10 border border-cyber-danger/30 text-xs text-cyber-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border border-cyber-border text-xs text-cyber-muted hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || aadhaarInput.replace(/\D/g, '').length !== 12}
                  className="px-5 py-2 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 shadow-cyber-sm"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Request OTP Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Challenge */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyber-cyan" />
                <span>Enter 6-Digit One-Time Password (OTP)</span>
              </div>
              <p className="text-xs text-cyber-muted">
                Sent to simulated registered mobile number linked to {maskedPhone}.
              </p>

              {/* Test Hint Pill */}
              {testHintOtp && (
                <div className="p-3 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-xs text-cyber-cyan flex items-center justify-between">
                  <span>Sandbox Test OTP Generated:</span>
                  <span className="font-bold text-white tracking-widest text-sm bg-cyber-card px-2.5 py-0.5 rounded border border-cyber-cyan/50">
                    {testHintOtp}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setErrorMsg(null);
                  }}
                  placeholder="• • • • • •"
                  className="w-full h-11 px-4 bg-cyber-card border border-cyber-border rounded-xl text-center font-mono text-xl tracking-[0.5em] text-white placeholder-cyber-muted/30 focus:outline-none focus:border-cyber-cyan"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-cyber-danger/10 border border-cyber-danger/30 text-xs text-cyber-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg border border-cyber-border text-xs text-cyber-muted hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change ID</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpInput.length !== 6}
                  className="px-5 py-2 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 shadow-cyber-sm"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Verify Identity Receipt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Verification Certificate Card */}
          {step === 4 && verificationResult && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-cyber-card border border-cyber-cyan/40 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyber-cyan" />
                    <span className="text-sm font-bold text-white">Identity Certificate Issued</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-cyber-warning/20 border border-cyber-warning/40 text-cyber-warning font-bold text-[11px]">
                    {verificationResult.status}
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Provider:</span>
                    <span className="text-white font-bold">{verificationResult.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Masked Identifier:</span>
                    <span className="text-cyber-cyan font-bold font-mono">{verificationResult.maskedIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Transaction ID:</span>
                    <span className="text-white font-mono">{verificationResult.verificationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-muted">Verified Timestamp:</span>
                    <span className="text-white font-mono">{new Date(verificationResult.verifiedAt).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-cyber-border/40">
                    <span className="text-cyber-muted block mb-1">Cryptographic Proof Receipt (BLAKE2b Digest):</span>
                    <span className="text-cyber-cyan font-mono text-[10px] break-all bg-cyber-bg/80 p-2 rounded block">
                      {verificationResult.certificateDigestHex}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-cyber-border text-xs text-cyber-muted hover:text-white"
                >
                  Verify Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-cyber-primary hover:bg-cyber-primary/80 text-xs font-bold text-white shadow-cyber-sm"
                >
                  Save & Return to Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

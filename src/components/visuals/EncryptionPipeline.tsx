import React from 'react';
import { Key, ShieldCheck, Lock, Cpu, Database, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PipelineProps {
  activeStep?: number;
}

export const EncryptionPipeline: React.FC<PipelineProps> = ({ activeStep = 3 }) => {
  const steps = [
    {
      num: 1,
      title: 'Master Passphrase',
      subtitle: 'Never stored or logged',
      icon: Key,
      color: 'text-cyber-cyan',
      border: 'border-cyber-cyan/40',
      bg: 'bg-cyber-cyan/10',
      details: 'User-provided high-entropy master secret'
    },
    {
      num: 2,
      title: 'Argon2id KDF',
      subtitle: '16-byte random salt',
      icon: Cpu,
      color: 'text-cyber-violet',
      border: 'border-cyber-violet/40',
      bg: 'bg-cyber-violet/10',
      details: 'Memory-hard computation (32-64MB RAM, t=2..3)'
    },
    {
      num: 3,
      title: 'Key Encryption Key',
      subtitle: '256-bit ephemeral KEK',
      icon: Lock,
      color: 'text-cyber-primary',
      border: 'border-cyber-primary/40',
      bg: 'bg-cyber-primary/10',
      details: 'Transient key living exclusively in memory'
    },
    {
      num: 4,
      title: 'AEAD Envelope Wrap',
      subtitle: 'Wraps random DEK',
      icon: ShieldCheck,
      color: 'text-cyber-success',
      border: 'border-cyber-success/40',
      bg: 'bg-cyber-success/10',
      details: 'XChaCha20-Poly1305 with 24-byte fresh nonce'
    },
    {
      num: 5,
      title: 'Encrypted Records',
      subtitle: 'Persistent storage',
      icon: Database,
      color: 'text-cyber-cyan',
      border: 'border-cyber-cyan/40',
      bg: 'bg-cyber-cyan/10',
      details: 'Zero plaintext stored in IndexedDB'
    }
  ];

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="min-w-[700px] flex items-center justify-between gap-2 px-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = step.num <= activeStep;

          return (
            <React.Fragment key={step.num}>
              <div
                className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                  isPassed
                    ? `${step.bg} ${step.border} shadow-cyber-sm`
                    : 'bg-cyber-card/40 border-cyber-border opacity-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-mono text-[10px] text-cyber-muted font-bold">
                    STEP 0{step.num}
                  </span>
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-cyber-success" />}
                </div>

                <div className={`p-2.5 rounded-lg mb-2.5 ${step.bg} ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="text-xs font-bold text-cyber-text text-center font-display">
                  {step.title}
                </span>
                <span className="text-[10px] text-cyber-muted text-center font-mono mt-0.5">
                  {step.subtitle}
                </span>

                <div className="mt-2 text-[9px] text-cyber-muted/80 text-center border-t border-cyber-border/40 pt-1.5 w-full">
                  {step.details}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="shrink-0 flex items-center text-cyber-border">
                  <ArrowRight className="w-4 h-4 text-cyber-cyan/60 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

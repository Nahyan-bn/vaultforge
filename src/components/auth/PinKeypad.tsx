import React, { useEffect, useState, useCallback } from 'react';
import { Delete, RotateCcw, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

interface PinKeypadProps {
  onComplete: (pin: string) => void;
  disabled?: boolean;
  failedAttempts?: number;
  maxAttempts?: number;
  lockedUntil?: number;
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({
  onComplete,
  disabled = false,
  failedAttempts = 0,
  maxAttempts = 5,
  lockedUntil = 0,
  title = 'Enter 6-Digit PIN',
  subtitle = 'Protected by Argon2id Envelope Encryption',
  showCancel = false,
  onCancel
}) => {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check lockout countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockedUntil && lockedUntil > now) {
        setLockoutRemaining(Math.ceil((lockedUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleDigit = useCallback((digit: string) => {
    if (disabled || lockoutRemaining > 0) return;
    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 6) {
        onComplete(next);
      }
    }
  }, [pin, disabled, lockoutRemaining, onComplete]);

  const handleBackspace = useCallback(() => {
    if (disabled || lockoutRemaining > 0) return;
    setPin((prev) => prev.slice(0, -1));
  }, [disabled, lockoutRemaining]);

  const handleClear = useCallback(() => {
    if (disabled || lockoutRemaining > 0) return;
    setPin('');
  }, [disabled, lockoutRemaining]);

  // Support physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || lockoutRemaining > 0) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear, disabled, lockoutRemaining]);

  // Trigger error shake on failed attempt change
  useEffect(() => {
    if (failedAttempts > 0) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  const isLocked = lockoutRemaining > 0;
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto font-mono text-center space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-cyber-cyan" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-cyber-muted mt-1">{subtitle}</p>
      </div>

      {/* Lockout Banner */}
      {isLocked && (
        <div className="p-3 rounded-xl bg-cyber-danger/10 border border-cyber-danger/40 text-cyber-danger text-xs flex items-center gap-2.5 text-left">
          <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
          <div>
            <div className="font-bold">Security Lockout Active</div>
            <div className="text-[11px] text-cyber-danger/80">
              Maximum attempts exceeded. Keypad locked for {lockoutRemaining}s.
            </div>
          </div>
        </div>
      )}

      {/* Attempt Counter Banner */}
      {!isLocked && failedAttempts > 0 && (
        <div className="text-xs text-cyber-warning flex items-center justify-center gap-1.5 font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {maxAttempts - failedAttempts} of {maxAttempts} attempts remaining
          </span>
        </div>
      )}

      {/* PIN Slot Indicators */}
      <div
        className={`flex justify-center items-center gap-3 py-2 transition-transform ${
          isShaking ? 'translate-x-1 duration-75 text-cyber-danger' : ''
        }`}
      >
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const filled = index < pin.length;
          return (
            <div
              key={index}
              className={`w-9 h-11 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                isLocked
                  ? 'border-cyber-danger/30 bg-cyber-danger/5'
                  : filled
                  ? 'border-cyber-cyan bg-cyber-cyan/15 shadow-[0_0_12px_rgba(34,227,255,0.4)]'
                  : 'border-cyber-border bg-cyber-card/60'
              }`}
            >
              {filled ? (
                <div className="w-3 h-3 rounded-full bg-cyber-cyan shadow-[0_0_8px_#22E3FF]" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-muted/30" />
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric Keypad Grid */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[270px] mx-auto pt-1">
        {digits.map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled || isLocked}
            onClick={() => handleDigit(num)}
            className="h-12 rounded-xl bg-cyber-card/80 hover:bg-cyber-elevated active:bg-cyber-primary/30 border border-cyber-border hover:border-cyber-cyan/40 text-base font-bold text-white transition-all duration-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-cyber-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            {num}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          disabled={disabled || isLocked || pin.length === 0}
          onClick={handleClear}
          className="h-12 rounded-xl bg-cyber-card/40 hover:bg-cyber-card border border-cyber-border hover:border-cyber-warning/40 text-xs text-cyber-muted hover:text-cyber-warning transition-all disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center"
          title="Clear PIN"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Zero */}
        <button
          type="button"
          disabled={disabled || isLocked}
          onClick={() => handleDigit('0')}
          className="h-12 rounded-xl bg-cyber-card/80 hover:bg-cyber-elevated active:bg-cyber-primary/30 border border-cyber-border hover:border-cyber-cyan/40 text-base font-bold text-white transition-all duration-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shadow-cyber-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          disabled={disabled || isLocked || pin.length === 0}
          onClick={handleBackspace}
          className="h-12 rounded-xl bg-cyber-card/40 hover:bg-cyber-card border border-cyber-border hover:border-cyber-danger/40 text-xs text-cyber-muted hover:text-cyber-danger transition-all disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {showCancel && onCancel && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-cyber-muted hover:text-white transition-colors underline"
          >
            Cancel / Choose Another Method
          </button>
        </div>
      )}
    </div>
  );
};

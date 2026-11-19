import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface OrbProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SecurityScoreOrb: React.FC<OrbProps> = ({ score, size = 'md', className = '' }) => {
  const getScoreColor = (s: number) => {
    if (s >= 85) return { stroke: '#22C55E', text: 'text-cyber-success', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]', label: 'EXCELLENT' };
    if (s >= 65) return { stroke: '#22E3FF', text: 'text-cyber-cyan', glow: 'shadow-[0_0_30px_rgba(34,227,255,0.3)]', label: 'HEALTHY' };
    if (s >= 40) return { stroke: '#F59E0B', text: 'text-cyber-warning', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]', label: 'ATTENTION' };
    return { stroke: '#FF4D6D', text: 'text-cyber-danger', glow: 'shadow-[0_0_30px_rgba(255,77,109,0.3)]', label: 'CRITICAL' };
  };

  const { stroke, text, glow, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-full bg-cyber-bgSecondary/60 ${sizeClasses[size]} ${glow} transition-all duration-700`}>
        <svg className="w-full h-full -rotate-90 p-2" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1E2D4A"
            strokeWidth="7"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-display font-extrabold text-2xl md:text-3xl ${text} leading-none tracking-tight`}>
            {score}
          </span>
          <span className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2.5">
        {score >= 65 ? (
          <ShieldCheck className={`w-3.5 h-3.5 ${text}`} />
        ) : (
          <ShieldAlert className={`w-3.5 h-3.5 ${text}`} />
        )}
        <span className={`font-mono text-xs font-bold tracking-wider ${text}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

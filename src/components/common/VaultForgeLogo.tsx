import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'monochrome' | 'icon';
  className?: string;
  glow?: boolean;
}

export const VaultForgeLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  glow = true
}) => {
  const sizeMap = {
    sm: { symbol: 24, text: 'text-lg', badge: 'text-[9px]' },
    md: { symbol: 32, text: 'text-xl', badge: 'text-[10px]' },
    lg: { symbol: 48, text: 'text-3xl', badge: 'text-xs' },
    xl: { symbol: 64, text: 'text-4xl', badge: 'text-sm' },
  };

  const { symbol: px, text: textClass, badge: badgeClass } = sizeMap[size];

  const primaryColor = variant === 'monochrome' ? '#E8EEF9' : '#2F6BFF';
  const cyanColor = variant === 'monochrome' ? '#8FA0BF' : '#22E3FF';
  const violetColor = variant === 'monochrome' ? '#E8EEF9' : '#8B5CF6';
  const forgeGlow = variant === 'monochrome' ? '#E8EEF9' : '#F59E0B';

  const SymbolSVG = (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${glow ? 'drop-shadow-[0_0_12px_rgba(34,227,255,0.4)]' : ''}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:rotate-6"
      >
        {/* Outer Hexagonal Shield Shell */}
        <polygon
          points="50,6 90,28 90,72 50,94 10,72 10,28"
          fill="#0B1220"
          stroke={cyanColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Mid Mechanical Interlock Ring */}
        <polygon
          points="50,18 78,33 78,67 50,82 22,67 22,33"
          fill="#101A2E"
          stroke={primaryColor}
          strokeWidth="2.5"
          strokeDasharray="6 3"
          strokeLinejoin="round"
        />

        {/* Central Keyhole Core */}
        <circle
          cx="50"
          cy="46"
          r="10"
          fill="#05070D"
          stroke={violetColor}
          strokeWidth="3"
        />
        <polygon
          points="46,48 54,48 57,68 43,68"
          fill="#05070D"
          stroke={violetColor}
          strokeWidth="2"
        />

        {/* Forge Energy Spark (Flame/Plasma detail at center) */}
        <path
          d="M50,42 L52,47 L50,51 L48,47 Z"
          fill={forgeGlow}
          className="animate-pulse"
        />

        {/* Corner Precision Rivets */}
        <circle cx="50" cy="11" r="2.5" fill={cyanColor} />
        <circle cx="85" cy="30" r="2.5" fill={cyanColor} />
        <circle cx="85" cy="70" r="2.5" fill={cyanColor} />
        <circle cx="50" cy="89" r="2.5" fill={cyanColor} />
        <circle cx="15" cy="70" r="2.5" fill={cyanColor} />
        <circle cx="15" cy="30" r="2.5" fill={cyanColor} />
      </svg>
    </div>
  );

  if (variant === 'compact' || variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {SymbolSVG}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {SymbolSVG}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-wider ${textClass} text-white`}>
            VAULT<span className="text-cyber-cyan">FORGE</span>
          </span>
          <span className={`px-1.5 py-0.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/10 font-mono text-cyber-cyan font-semibold uppercase tracking-widest ${badgeClass}`}>
            C-CORE
          </span>
        </div>
        <span className="text-[10px] tracking-wider text-cyber-muted font-mono uppercase mt-0.5">
          Applied Cryptography Vault
        </span>
      </div>
    </div>
  );
};

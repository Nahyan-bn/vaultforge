import React, { useState } from 'react';

interface VaultMechanismProps {
  isLocked?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const VaultMechanism: React.FC<VaultMechanismProps> = ({
  isLocked = true,
  onToggle,
  className = ''
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-pointer group ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      title="Interactive Vault Mechanism"
    >
      {/* Outer Cyan Radial Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          hovered ? 'bg-cyber-cyan/25 opacity-100' : 'bg-cyber-primary/15 opacity-60'
        }`}
      />

      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[340px] md:max-w-[420px] aspect-square transition-transform duration-700 ease-out group-hover:scale-105"
      >
        <defs>
          <linearGradient id="cyberRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22E3FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#2F6BFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLocked ? '#22E3FF' : '#22C55E'} stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0B1220" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#05070D" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Outer Heavy Armor Ring */}
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="#0B1220"
          stroke="#1E2D4A"
          strokeWidth="6"
        />

        {/* Calibrated Ticks along Perimeter */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const x1 = 200 + 175 * Math.cos(angle);
          const y1 = 200 + 175 * Math.sin(angle);
          const x2 = 200 + (i % 3 === 0 ? 162 : 168) * Math.cos(angle);
          const y2 = 200 + (i % 3 === 0 ? 162 : 168) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? '#22E3FF' : '#1E2D4A'}
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Counter-Clockwise Rotating Precision Ring */}
        <g className="animate-spin-slow origin-center" style={{ animationDirection: 'reverse', animationDuration: '35s' }}>
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="url(#cyberRingGrad)"
            strokeWidth="3"
            strokeDasharray="18 12 6 12"
          />
          {/* Mechanical Locking Pins */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={deg}
              cx={200 + 150 * Math.cos((deg * Math.PI) / 180)}
              cy={200 + 150 * Math.sin((deg * Math.PI) / 180)}
              r="4"
              fill="#22E3FF"
            />
          ))}
        </g>

        {/* Clockwise Interlocking Tumbler Ring */}
        <g className="animate-spin-slow origin-center" style={{ animationDuration: '22s' }}>
          <circle
            cx="200"
            cy="200"
            r="115"
            fill="#101A2E"
            stroke="#2F6BFF"
            strokeWidth="4"
            strokeDasharray="40 10 20 10"
          />
          <polygon
            points="200,95 290,148 290,252 200,305 110,252 110,148"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Central Core Shield */}
        <circle
          cx="200"
          cy="200"
          r="72"
          fill="url(#coreGlow)"
          stroke={isLocked ? '#22E3FF' : '#22C55E'}
          strokeWidth="3.5"
          className="transition-colors duration-500"
        />

        {/* Mechanical Keyhole & Lock Gate */}
        <g className="origin-center transition-all duration-500">
          <circle
            cx="200"
            cy="188"
            r="18"
            fill="#05070D"
            stroke={isLocked ? '#8B5CF6' : '#22C55E'}
            strokeWidth="4"
          />
          <polygon
            points="192,192 208,192 214,226 186,226"
            fill="#05070D"
            stroke={isLocked ? '#8B5CF6' : '#22C55E'}
            strokeWidth="3"
          />

          {/* Central Forge Spark */}
          <path
            d="M200,180 L204,188 L200,196 L196,188 Z"
            fill={isLocked ? '#F59E0B' : '#22C55E'}
            className="animate-pulse"
          />
        </g>

        {/* Telemetry Labels around Mechanism */}
        <text
          x="200"
          y="252"
          textAnchor="middle"
          fill="#8FA0BF"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="2"
        >
          {isLocked ? 'XCHACHA20-POLY1305' : 'VAULT UNLOCKED'}
        </text>
        <text
          x="200"
          y="266"
          textAnchor="middle"
          fill={isLocked ? '#22E3FF' : '#22C55E'}
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
        >
          {isLocked ? 'ARGON2ID • 256-BIT ENVELOPE' : 'SESSION ACTIVE'}
        </text>
      </svg>
    </div>
  );
};

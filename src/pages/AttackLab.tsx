import React, { useState } from 'react';
import { calculatePasswordEntropy } from '../utils/securityAnalysis';
import {
  ShieldAlert,
  Cpu,
  Zap,
  Info,
  Clock,
  Database,
  BarChart3,
  Server
} from 'lucide-react';

export const AttackLab: React.FC = () => {
  const [testPassword, setTestPassword] = useState('Tr0ub4dor&3');

  const entropy = calculatePasswordEntropy(testPassword);
  const len = testPassword.length;

  let poolSize = 0;
  if (/[a-z]/.test(testPassword)) poolSize += 26;
  if (/[A-Z]/.test(testPassword)) poolSize += 26;
  if (/[0-9]/.test(testPassword)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(testPassword)) poolSize += 32;

  // Search space size = poolSize ^ len
  const combinations = poolSize > 0 ? Math.pow(poolSize, Math.min(len, 32)) : 0;

  // Time estimates
  // 1. Online guessing (throttled: 10 guesses / sec)
  const onlineSecs = combinations / 10;
  // 2. Fast unsalted hash (MD5/SHA256 on 8x RTX 4090 cluster: ~100 Billion / sec = 10^11)
  const fastHashSecs = combinations / 1e11;
  // 3. Argon2id (64MB memory cost: ~50 guesses/sec on high-end hardware)
  const argonSecs = combinations / 50;

  const formatTime = (secs: number) => {
    if (secs < 1) return 'Instant (< 1 second)';
    if (secs < 60) return `${Math.round(secs)} seconds`;
    if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
    if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
    if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
    if (secs < 31536000 * 100) return `${Math.round(secs / 31536000)} years`;
    if (secs < 31536000 * 1e6) return `${(secs / 31536000 / 1e3).toFixed(1)}k centuries`;
    return 'Trillions of Years (Beyond Universe Age)';
  };

  return (
    <div className="space-y-8 font-mono">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyber-warning/20 border border-cyber-warning/40 text-cyber-warning text-[11px] mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Educational Simulation — Synthetic Passwords Only</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white">
          Attack Simulation & Search-Space Lab
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Evaluate search-space combinatorics against fast hashing vs memory-hard Argon2id
        </p>
      </div>

      {/* Input Simulator */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4">
        <label className="block text-xs uppercase text-cyber-muted">
          Synthetic Test Password (Never enter real master password)
        </label>
        <input
          type="text"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-white text-base font-mono focus:border-cyber-cyan focus:outline-none"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Character Pool Size (R)</span>
            <span className="text-white font-bold text-base">{poolSize} characters</span>
          </div>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Password Length (L)</span>
            <span className="text-cyber-cyan font-bold text-base">{len} chars</span>
          </div>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Estimated Entropy</span>
            <span className="text-cyber-success font-bold text-base">{entropy} bits</span>
          </div>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Combinations (R^L)</span>
            <span className="text-cyber-violet font-bold text-base truncate">
              {combinations > 1e15 ? combinations.toExponential(2) : combinations.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Threat Models Benchmark Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model 1: Online Guessing */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyber-muted font-bold">ONLINE ATTACK</span>
            <Server className="w-4 h-4 text-cyber-cyan" />
          </div>
          <h3 className="font-display font-bold text-base text-white">Throttled Online Login</h3>
          <p className="text-xs text-cyber-muted font-sans">
            Assumption: 10 guesses / sec with web server rate limiting and IP lockout.
          </p>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Estimated Crack Time:</span>
            <span className="text-cyber-cyan font-bold text-sm">{formatTime(onlineSecs)}</span>
          </div>
        </div>

        {/* Model 2: Fast Unsalted Hash */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyber-danger font-bold">FAST HASH (MD5/SHA256)</span>
            <Zap className="w-4 h-4 text-cyber-danger" />
          </div>
          <h3 className="font-display font-bold text-base text-white">Offline GPU Cluster</h3>
          <p className="text-xs text-cyber-muted font-sans">
            Assumption: 100 Billion hashes / sec using 8x modern discrete GPUs.
          </p>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Estimated Crack Time:</span>
            <span className={`font-bold text-sm ${fastHashSecs < 3600 ? 'text-cyber-danger' : 'text-cyber-warning'}`}>
              {formatTime(fastHashSecs)}
            </span>
          </div>
        </div>

        {/* Model 3: Memory-Hard Argon2id */}
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyber-success font-bold">VAULTFORGE (ARGON2ID)</span>
            <Cpu className="w-4 h-4 text-cyber-success" />
          </div>
          <h3 className="font-display font-bold text-base text-white">Memory-Hard Resistance</h3>
          <p className="text-xs text-cyber-muted font-sans">
            Assumption: 64MB RAM per thread makes GPU parallelism cost-prohibitive (~50 attempts/sec).
          </p>
          <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border">
            <span className="text-[10px] text-cyber-muted block">Estimated Crack Time:</span>
            <span className="text-cyber-success font-bold text-sm">{formatTime(argonSecs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

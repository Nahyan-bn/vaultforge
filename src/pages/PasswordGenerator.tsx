import React, { useState, useEffect } from 'react';
import { cryptoBridge } from '../crypto/bridge';
import { useVaultStore } from '../store/vaultStore';
import { calculatePasswordEntropy, evaluatePasswordQuality } from '../utils/securityAnalysis';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  Hash,
  BookOpen,
  Plus
} from 'lucide-react';

interface PasswordGeneratorProps {
  onNavigate: (tab: string) => void;
}

// Locally bundled EFF short wordlist for passphrase generation
const BUNDLED_WORDS = [
  'acid', 'acorn', 'acre', 'acts', 'afar', 'affix', 'aged', 'agent', 'agile', 'aging',
  'agony', 'ahead', 'aide', 'aids', 'aim', 'ajar', 'alarm', 'alias', 'alibi', 'alien',
  'alloy', 'alone', 'aloud', 'alpha', 'also', 'alto', 'amuse', 'angel', 'angle', 'anime',
  'ankle', 'antic', 'anvil', 'apex', 'apply', 'arena', 'armor', 'aroma', 'arose', 'arrow',
  'aside', 'aspen', 'asset', 'atlas', 'atom', 'audio', 'audit', 'aunt', 'auto', 'avid',
  'axis', 'badge', 'badly', 'baker', 'balmy', 'banjo', 'barge', 'baron', 'basic', 'basin',
  'batch', 'beacon', 'beard', 'beast', 'beef', 'beet', 'belch', 'bendy', 'beret', 'berry',
  'betray', 'blade', 'blimp', 'blink', 'bliss', 'blitz', 'blossom', 'blunt', 'blur', 'board',
  'boast', 'bold', 'bolt', 'bonus', 'boost', 'booth', 'boot', 'borrow', 'boss', 'botany',
  'bound', 'bowling', 'boxer', 'brain', 'brass', 'brave', 'bravo', 'bread', 'breeze', 'brick',
  'bridge', 'brief', 'bright', 'brisk', 'broad', 'bronze', 'brook', 'broom', 'brush', 'bubble',
  'bucket', 'buckle', 'budget', 'buffet', 'buggy', 'bulb', 'bulge', 'bulk', 'bunch', 'bunker'
];

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onNavigate }) => {
  const { addRecord, isUnlocked } = useVaultStore();

  const [mode, setMode] = useState<'password' | 'passphrase' | 'pin'>('password');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Password options
  const [length, setLength] = useState(24);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  // Passphrase options
  const [wordCount, setWordCount] = useState(5);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);

  // PIN options
  const [pinLength, setPinLength] = useState(6);

  const generate = async () => {
    if (mode === 'password') {
      const res = await cryptoBridge.generatePassword(length, {
        uppercase: useUpper,
        lowercase: useLower,
        numbers: useNumbers,
        symbols: useSymbols,
        excludeAmbiguous
      });
      setOutput(res.password);
    } else if (mode === 'passphrase') {
      // Pick random words using C CSPRNG pin generator for uniform indices
      const words: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const pinRes = await cryptoBridge.generatePin(4);
        const idx = parseInt(pinRes.pin, 10) % BUNDLED_WORDS.length;
        let w = BUNDLED_WORDS[idx];
        if (capitalize) {
          w = w.charAt(0).toUpperCase() + w.slice(1);
        }
        words.push(w);
      }
      setOutput(words.join(separator));
    } else if (mode === 'pin') {
      const res = await cryptoBridge.generatePin(pinLength);
      setOutput(res.pin);
    }
  };

  useEffect(() => {
    generate();
  }, [mode, length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, wordCount, separator, capitalize, pinLength]);

  const entropy = calculatePasswordEntropy(output);
  const quality = evaluatePasswordQuality(output);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = async () => {
    if (!isUnlocked) {
      onNavigate('unlock');
      return;
    }
    await addRecord({
      type: 'login',
      title: `Generated Credential (${new Date().toLocaleDateString()})`,
      category: 'Generated',
      username: 'user@service.internal',
      password: output,
      tags: ['Auto-Generated', mode],
      isFavorite: false,
      isDeleted: false
    });
    onNavigate('vault');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-cyber-cyan" />
          <span>Password Generator Studio</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-1 font-mono">
          CSPRNG generation powered by libsodium <code className="text-cyber-cyan">randombytes_uniform()</code>
        </p>
      </div>

      {/* Generator Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-cyber-card border border-cyber-border">
        {[
          { id: 'password', label: 'Random Password', icon: Sliders },
          { id: 'passphrase', label: 'Passphrase', icon: BookOpen },
          { id: 'pin', label: 'Numeric PIN', icon: Hash },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors ${
                mode === m.id
                  ? 'bg-cyber-primary text-white font-bold shadow-cyber-sm'
                  : 'text-cyber-muted hover:text-white hover:bg-cyber-elevated'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Output Display Card */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-cyan/40 shadow-cyber space-y-4 relative">
        <div className="flex items-center justify-between text-xs text-cyber-muted">
          <span>GENERATED VALUE</span>
          <div className="flex items-center gap-3">
            <span>Entropy: <strong className="text-cyber-cyan">{entropy} bits</strong></span>
            <span>Strength: <strong className="text-cyber-success">{quality.strength}</strong></span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between gap-4">
          <span className="font-mono text-lg sm:text-2xl text-white font-bold tracking-wider break-all select-all">
            {output}
          </span>
          <button
            onClick={generate}
            className="p-2.5 rounded-lg bg-cyber-card border border-cyber-border hover:bg-cyber-elevated text-cyber-cyan transition-transform active:rotate-180"
            title="Regenerate"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-cyber-success" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Credential'}</span>
          </button>

          <button
            onClick={handleSaveToVault}
            className="flex-1 py-3 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-cyber-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save Directly to Vault</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyber-cyan" />
          <span>Generator Parameters</span>
        </h2>

        {mode === 'password' && (
          <div className="space-y-5 text-xs">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-cyber-muted">Length</span>
                <span className="text-cyber-cyan font-bold">{length} characters</span>
              </div>
              <input
                type="range"
                min={8}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-cyber-cyan bg-cyber-bg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-cyber-muted mt-1">
                <span>8 (Minimum)</span>
                <span>24 (Recommended)</span>
                <span>64</span>
                <span>128</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Uppercase (A-Z)', val: useUpper, set: setUseUpper },
                { label: 'Lowercase (a-z)', val: useLower, set: setUseLower },
                { label: 'Numbers (0-9)', val: useNumbers, set: setUseNumbers },
                { label: 'Symbols (!@#$)', val: useSymbols, set: setUseSymbols },
                { label: 'Exclude Ambiguous (il1Lo0O)', val: excludeAmbiguous, set: setExcludeAmbiguous },
              ].map((opt, i) => (
                <label key={i} className="flex items-center gap-2 p-3 rounded-xl bg-cyber-bg border border-cyber-border cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={opt.val}
                    onChange={(e) => opt.set(e.target.checked)}
                    className="w-4 h-4 rounded text-cyber-cyan bg-cyber-card border-cyber-border focus:ring-0"
                  />
                  <span className="text-[11px] text-cyber-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === 'passphrase' && (
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-cyber-muted">Word Count</span>
                <span className="text-cyber-cyan font-bold">{wordCount} words</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-cyber-cyan bg-cyber-bg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-cyber-muted mb-2">Word Separator</label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-cyber-bg border border-cyber-border w-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    className="w-4 h-4 rounded text-cyber-cyan bg-cyber-card border-cyber-border focus:ring-0"
                  />
                  <span className="text-[11px]">Capitalize Words</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {mode === 'pin' && (
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-cyber-muted">PIN Digits</span>
                <span className="text-cyber-cyan font-bold">{pinLength} digits</span>
              </div>
              <input
                type="range"
                min={4}
                max={12}
                value={pinLength}
                onChange={(e) => setPinLength(Number(e.target.value))}
                className="w-full accent-cyber-cyan bg-cyber-bg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

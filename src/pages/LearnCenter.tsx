import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Lock,
  ShieldCheck,
  Key,
  Database,
  Terminal,
  HelpCircle,
  FileCode2,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const LearnCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'viva' | 'threat' | 'shortcuts'>('glossary');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const glossaryItems = [
    {
      term: 'Argon2id',
      subtitle: 'Hybrid Memory-Hard Key Derivation Function',
      content: 'Argon2id won the Password Hashing Competition (PHC). It combines Argon2d (data-dependent memory access resistant to GPU brute-forcing) and Argon2i (data-independent access resistant to side-channel timing attacks). VAULTFORGE uses libsodium crypto_pwhash_argon2id13() to derive the 256-bit Key Encryption Key.'
    },
    {
      term: 'Envelope Encryption (KEK & DEK)',
      subtitle: 'Two-Tier Key Hierarchy',
      content: 'Rather than encrypting all database records with the user password, VAULTFORGE generates a cryptographically random 256-bit Data Encryption Key (DEK). The user password derives an ephemeral Key Encryption Key (KEK) via Argon2id, which wraps the DEK using authenticated AEAD encryption. Changing your master password simply re-wraps the DEK without re-encrypting records.'
    },
    {
      term: 'XChaCha20-Poly1305',
      subtitle: 'Extended-Nonce Authenticated Encryption with Associated Data',
      content: 'ChaCha20 is a high-speed stream cipher that uses an extended 192-bit (24-byte) nonce. Because the nonce space is 2^192, randomly generating nonces is statistically immune to collisions (unlike AES-GCM 96-bit nonces). Poly1305 computes a 128-bit MAC tag over ciphertext and associated data in constant time, ensuring absolute tamper detection.'
    },
    {
      term: '24-Byte Nonce',
      subtitle: 'Number Used Once with Collision Immunity',
      content: 'A nonce must never be reused with the same key. By using XChaCha20 with a 24-byte nonce, VAULTFORGE guarantees that even after encrypting billions of records, the probability of a nonce collision is vanishingly smaller than 1 in 2^96.'
    },
    {
      term: 'Poly1305 MAC Tag',
      subtitle: '128-bit One-Time Authenticator',
      content: 'A cryptographic tag appended to ciphertext. Any modification to the ciphertext, nonce, or bound associated data causes Poly1305 evaluation to fail, resulting in immediate deterministic rejection before decryption.'
    },
    {
      term: 'sodium_memzero()',
      subtitle: 'Defensive Memory Hygiene',
      content: 'Standard memset() is often optimized away by modern C compilers if the buffer is never read again. libsodium sodium_memzero() uses volatile memory semantics to guarantee that raw keys and sensitive buffers in WebAssembly memory are wiped upon vault lock or panic activation.'
    }
  ];

  const vivaQuestions = [
    {
      q: 'Why did you choose Argon2id instead of PBKDF2 or bcrypt?',
      a: 'PBKDF2 is compute-hard but has virtually zero memory footprint, making it trivial to parallelize on GPUs and ASICs. bcrypt has a 72-byte password truncation limitation. Argon2id combines data-dependent and independent memory passes, enforcing a configurable memory allocation (e.g. 32-64MB RAM) that bottlenecks high-throughput hardware brute-forcing.'
    },
    {
      q: 'Why use XChaCha20-Poly1305 instead of AES-256-GCM?',
      a: 'AES-GCM utilizes a 96-bit nonce; after approximately 2^32 random encryptions, the birthday paradox introduces dangerous nonce collision risks. XChaCha20 extends the nonce to 192 bits, allowing safe random generation. Additionally, ChaCha20 avoids table lookups, eliminating cache-timing side-channel vulnerabilities on CPUs without dedicated AES-NI hardware.'
    },
    {
      q: 'What is the purpose of Key Wrapping in your architecture?',
      a: 'Key wrapping decouples user authentication from persistent storage encryption. If the user changes their password, only the 32-byte wrapped DEK must be re-encrypted under a new KEK. All existing encrypted records remain valid without heavy re-encryption passes.'
    },
    {
      q: 'How does your C code compile and execute in the browser?',
      a: 'The C11 cryptographic core is built with libsodium. The official upstream C codebase is compiled via Emscripten into optimized WebAssembly bytecode (.wasm). In VAULTFORGE, a dedicated Web Worker loads this WASM module, communicating with the TypeScript application layer via typed IPC messages to keep the main UI thread completely non-blocking.'
    },
    {
      q: 'What happens when Panic Lock (Ctrl+Shift+L) is triggered?',
      a: 'Panic Lock executes sodium_memzero() across all reachable key buffers in C/WASM memory, drops the active session handle, clears the in-memory decrypted search indices, clears the operating system clipboard buffer (where browser permissions permit), and returns the UI to the locked state.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyber-cyan" />
          <span>Help & Capstone Learning Centre</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Applied cryptography specifications • C11 concepts • Review panel viva preparation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-cyber-card border border-cyber-border">
        {[
          { id: 'glossary', label: 'Cryptography Glossary', icon: ShieldCheck },
          { id: 'viva', label: 'Capstone Viva Q&A', icon: HelpCircle },
          { id: 'threat', label: 'Threat Model & Limits', icon: Lock },
          { id: 'shortcuts', label: 'Shortcuts & Hygiene', icon: Terminal },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors ${
                activeTab === t.id
                  ? 'bg-cyber-primary text-white font-bold shadow-cyber-sm'
                  : 'text-cyber-muted hover:text-white hover:bg-cyber-elevated'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-2 hover:border-cyber-cyan/40 transition-colors"
            >
              <h3 className="font-display font-bold text-base text-white text-cyber-cyan">
                {item.term}
              </h3>
              <div className="text-[10px] text-cyber-violet font-bold uppercase tracking-wider">
                {item.subtitle}
              </div>
              <p className="text-cyber-muted text-xs font-sans leading-relaxed pt-1">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* VIVA QUESTIONS */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-cyber-violet/10 border border-cyber-violet/30 text-xs text-cyber-violet flex items-center justify-between">
            <span>Prepared specifically for Capstone Evaluation Panel Review</span>
            <span className="font-bold">Team: Nahyan, Sudharsan, Dinesh</span>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-cyber-card border border-cyber-border overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-cyber-elevated/40"
                  >
                    <span className="font-display font-bold text-sm text-white flex items-center gap-2.5">
                      <span className="text-cyber-cyan font-mono text-xs">0{idx + 1}.</span>
                      <span>{item.q}</span>
                    </span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-cyber-cyan" /> : <ChevronRight className="w-4 h-4 text-cyber-muted" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 border-t border-cyber-border/40 bg-cyber-bg/40 text-xs font-sans text-cyber-muted leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* THREAT MODEL */}
      {activeTab === 'threat' && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 text-xs font-sans">
          <h2 className="text-base font-display font-bold text-white font-mono uppercase tracking-wider">
            VAULTFORGE Threat Model & Honest Security Limitations
          </h2>

          <div className="space-y-3 leading-relaxed text-cyber-muted">
            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
              <h4 className="font-bold text-cyber-success font-mono">Protected Against:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Offline physical disk extraction: All records on disk are XChaCha20-Poly1305 ciphertext.</li>
                <li>GPU/ASIC brute forcing: Argon2id memory hardness (32-64MB per attempt).</li>
                <li>Ciphertext tampering: Poly1305 MAC tag detects any single-bit alteration.</li>
                <li>Nonce collision: 192-bit random nonce has zero statistical collision probability.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-danger/30 space-y-1">
              <h4 className="font-bold text-cyber-danger font-mono">Honest Limitations (Browser Sandboxing):</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Compromised host OS: A keylogger or rootkit on the host machine can capture keystrokes.</li>
                <li>Malicious browser extensions: Untrusted extensions running with full DOM access can inspect inputs.</li>
                <li>Deterministic garbage collection: While C memory is zeroed via sodium_memzero(), JavaScript strings in V8 cannot be guaranteed to be instantly expunged from OS RAM.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SHORTCUTS */}
      {activeTab === 'shortcuts' && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 text-xs font-mono">
          <h2 className="text-base font-display font-bold text-white uppercase tracking-wider">
            Keyboard Shortcuts & Emergency Actions
          </h2>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Emergency Panic Lock</span>
                <span className="text-[11px] text-cyber-muted">Immediate session wipe & sodium_memzero memory wipe</span>
              </div>
              <kbd className="px-2.5 py-1 rounded-lg bg-cyber-danger/20 border border-cyber-danger/40 text-cyber-danger font-bold text-xs">
                Ctrl + Shift + L
              </kbd>
            </div>

            <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Quick Password Studio</span>
                <span className="text-[11px] text-cyber-muted">Access CSPRNG password generator</span>
              </div>
              <span className="text-cyber-cyan text-xs">Studio Icon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

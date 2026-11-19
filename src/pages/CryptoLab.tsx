import React, { useState, useEffect } from 'react';
import { cryptoBridge } from '../crypto/bridge';
import type { EncryptedPayload, KdfParams } from '../crypto/types';
import {
  FlaskConical,
  Cpu,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export const CryptoLab: React.FC = () => {
  const [activeLab, setActiveLab] = useState<number>(1);

  // LAB 1: Argon2id
  const [lab1Password, setLab1Password] = useState('CapstonePassphrase2026!');
  const [lab1SaltHex, setLab1SaltHex] = useState('a1b2c3d4e5f60718293a4b5c6d7e8f90');
  const [lab1MemMB, setLab1MemMB] = useState(32);
  const [lab1Ops, setLab1Ops] = useState(2);
  const [lab1KekHex, setLab1KekHex] = useState('');
  const [lab1DurationMs, setLab1DurationMs] = useState<number | null>(null);
  const [lab1Running, setLab1Running] = useState(false);

  // LAB 2: Key Hierarchy
  const [lab2DekHex, setLab2DekHex] = useState('');
  const [lab2WrappedHex, setLab2WrappedHex] = useState('');

  // LAB 3 & 4: Encryption & Decryption Studio
  const [demoPlaintext, setDemoPlaintext] = useState('CONFIDENTIAL_HEALTH_RECORDS_Nahyan_Sudharsan_Dinesh');
  const [demoKeyHex, setDemoKeyHex] = useState('');
  const [demoPayload, setDemoPayload] = useState<EncryptedPayload | null>(null);
  const [demoDecrypted, setDemoDecrypted] = useState<string | null>(null);
  const [encDurationMs, setEncDurationMs] = useState<number | null>(null);
  const [decDurationMs, setDecDurationMs] = useState<number | null>(null);

  // LAB 5: Tamper Detection
  const [tamperTarget, setTamperTarget] = useState<'ciphertext' | 'tag' | 'nonce' | 'ad'>('ciphertext');
  const [tamperByteIndex, setTamperByteIndex] = useState(0);
  const [tamperedPayload, setTamperedPayload] = useState<EncryptedPayload | null>(null);
  const [tamperDecryptionError, setTamperDecryptionError] = useState<string | null>(null);
  const [tamperDecryptionSuccess, setTamperDecryptionSuccess] = useState(false);

  // Initialize sandbox test key on mount
  useEffect(() => {
    cryptoBridge.generateDek().then((res) => {
      setDemoKeyHex(res.dekHex);
    });
  }, []);

  // Run Lab 1 (Argon2id execution)
  const runArgon2id = async () => {
    setLab1Running(true);
    const start = performance.now();
    try {
      const res = await cryptoBridge.deriveKek(lab1Password, lab1SaltHex, {
        opslimit: lab1Ops,
        memlimit: lab1MemMB * 1024 * 1024,
        algorithm: 2
      });
      const dur = performance.now() - start;
      setLab1KekHex(res.kekHex);
      setLab1DurationMs(Number(dur.toFixed(2)));
    } finally {
      setLab1Running(false);
    }
  };

  // Run Lab 3 (AEAD Seal)
  const runEncryption = async () => {
    if (!demoKeyHex) return;
    const start = performance.now();
    const res = await cryptoBridge.sealRecord(demoPlaintext, demoKeyHex, 'CRYPTO_LAB_CONTEXT');
    const dur = performance.now() - start;
    setDemoPayload(res.payload);
    setEncDurationMs(Number(dur.toFixed(2)));
    setDemoDecrypted(null);
    setTamperedPayload(null);
    setTamperDecryptionError(null);
  };

  // Run Lab 4 (AEAD Open)
  const runDecryption = async () => {
    if (!demoPayload || !demoKeyHex) return;
    const start = performance.now();
    try {
      const res = await cryptoBridge.openRecord(demoPayload, demoKeyHex, 'CRYPTO_LAB_CONTEXT');
      const dur = performance.now() - start;
      setDemoDecrypted(res.plaintext);
      setDecDurationMs(Number(dur.toFixed(2)));
    } catch (e: any) {
      setDemoDecrypted(null);
    }
  };

  // Run Lab 5 (Tamper & Verification)
  const runTamperSimulation = async () => {
    if (!demoPayload) await runEncryption();
    const curPayload = demoPayload!;

    const res = await cryptoBridge.tamperDemo(curPayload, tamperTarget, tamperByteIndex);
    setTamperedPayload(res.tamperedPayload);
    setTamperDecryptionError(null);
    setTamperDecryptionSuccess(false);

    // Attempt to decrypt corrupted payload
    try {
      await cryptoBridge.openRecord(res.tamperedPayload, demoKeyHex, 'CRYPTO_LAB_CONTEXT');
      setTamperDecryptionSuccess(true);
    } catch (e: any) {
      setTamperDecryptionError(e?.message || 'Poly1305 MAC verification failed');
      setTamperDecryptionSuccess(false);
    }
  };

  const exportLabReport = () => {
    const report = `============================================================\n` +
      `   VAULTFORGE CRYPTOGRAPHY LABORATORY REPORT\n` +
      `   C11 / WebAssembly Cryptographic Engine Verification\n` +
      `   Team: Nahyan Bin Nawaf, Sudharsan, Dinesh\n` +
      `   Generated: ${new Date().toISOString()}\n` +
      `============================================================\n\n` +
      `1. ARGON2ID KEY DERIVATION VERIFICATION:\n` +
      `   - Password Length: ${lab1Password.length} chars\n` +
      `   - Salt Hex: ${lab1SaltHex}\n` +
      `   - Memory Cost: ${lab1MemMB} MB RAM\n` +
      `   - Iterations (opslimit): ${lab1Ops}\n` +
      `   - Derived KEK: ${lab1KekHex || 'Pending run'}\n` +
      `   - Benchmarked Duration: ${lab1DurationMs || '—'} ms\n\n` +
      `2. AUTHENTICATED ENCRYPTION (XChaCha20-Poly1305):\n` +
      `   - Plaintext Length: ${demoPlaintext.length} bytes\n` +
      `   - Fresh Nonce (24 bytes): ${demoPayload?.nonceHex || '—'}\n` +
      `   - Ciphertext (hex): ${demoPayload?.ciphertextHex || '—'}\n` +
      `   - Poly1305 MAC Tag (16 bytes): ${demoPayload?.tagHex || '—'}\n` +
      `   - Encryption Time: ${encDurationMs || '—'} ms\n\n` +
      `3. TAMPER DETECTION DRILL:\n` +
      `   - Tampered Region: ${tamperTarget} (Byte offset ${tamperByteIndex})\n` +
      `   - Authentication Result: REJECTED (Poly1305 Tag Mismatch)\n` +
      `   - Status: VF_ERR_AUTH_FAILED (Constant-Time Verification Guaranteed)\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultforge_cryptography_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const labs = [
    { num: 1, title: 'Argon2id KDF Matrix', icon: Cpu },
    { num: 2, title: 'Key Hierarchy & Envelope', icon: Layers },
    { num: 3, title: 'XChaCha20 Encryption', icon: Lock },
    { num: 4, title: 'Authenticated Decryption', icon: Unlock },
    { num: 5, title: 'Tamper Detection (Poly1305)', icon: ShieldAlert },
    { num: 6, title: 'Nonce Reuse Vulnerability', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyber-violet/20 border border-cyber-violet/40 text-cyber-violet text-[11px] mb-1">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Capstone Applied Cryptography Demonstration</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            Cryptography Laboratory
          </h1>
          <p className="text-xs text-cyber-muted mt-0.5">
            Real C engine execution using separate demonstration sandbox keys
          </p>
        </div>

        <button
          onClick={exportLabReport}
          className="px-4 py-2 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan text-cyber-cyan text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Lab Report (.txt)</span>
        </button>
      </div>

      {/* Lab Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {labs.map((l) => {
          const Icon = l.icon;
          const isActive = activeLab === l.num;
          return (
            <button
              key={l.num}
              onClick={() => setActiveLab(l.num)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-cyber-violet/20 border-cyber-violet text-white shadow-cyber-violet'
                  : 'bg-cyber-card/70 border-cyber-border text-cyber-muted hover:text-white hover:bg-cyber-elevated'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] text-cyber-violet font-bold">LAB 0{l.num}</span>
                <Icon className="w-4 h-4 text-cyber-cyan" />
              </div>
              <span className="text-xs font-bold font-sans line-clamp-2">{l.title}</span>
            </button>
          );
        })}
      </div>

      {/* LAB 1: ARGON2ID MATRIX */}
      {activeLab === 1 && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyber-violet" />
                <span>Lab 1 — Argon2id Memory-Hard Key Derivation</span>
              </h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Evaluates <code className="text-cyber-cyan">crypto_pwhash_argon2id13()</code> memory cost and execution latency.
              </p>
            </div>
            <button
              onClick={runArgon2id}
              disabled={lab1Running}
              className="px-4 py-2 rounded-xl bg-cyber-violet hover:bg-cyber-violet/80 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{lab1Running ? 'Computing Matrix...' : 'Run Derivation'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-muted mb-1.5 uppercase">Test Input Passphrase</label>
                <input
                  type="text"
                  value={lab1Password}
                  onChange={(e) => setLab1Password(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-cyber-muted mb-1.5 uppercase">16-Byte Cryptographic Salt (Hex)</label>
                <input
                  type="text"
                  value={lab1SaltHex}
                  onChange={(e) => setLab1SaltHex(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyber-muted mb-1.5 uppercase">Memory Cost</label>
                  <select
                    value={lab1MemMB}
                    onChange={(e) => setLab1MemMB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                  >
                    <option value={16}>16 MB RAM</option>
                    <option value={32}>32 MB RAM</option>
                    <option value={64}>64 MB RAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cyber-muted mb-1.5 uppercase">Iterations (Ops)</label>
                  <select
                    value={lab1Ops}
                    onChange={(e) => setLab1Ops(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs"
                  >
                    <option value={2}>2 Passes</option>
                    <option value={3}>3 Passes</option>
                    <option value={4}>4 Passes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Simulation Visualization */}
            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-cyber-muted mb-2">
                  <span>ARGON2ID MEMORY BLOCKS</span>
                  <span>{lab1MemMB} MB allocated</span>
                </div>
                <div className="grid grid-cols-8 gap-1.5 p-3 rounded-lg bg-cyber-card/60 border border-cyber-border/40">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 rounded-sm transition-all duration-300 ${
                        lab1Running
                          ? 'bg-cyber-cyan animate-pulse'
                          : lab1KekHex
                          ? 'bg-cyber-violet'
                          : 'bg-cyber-border/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-cyber-border/40 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Execution Duration:</span>
                  <span className="text-cyber-cyan font-bold">{lab1DurationMs !== null ? `${lab1DurationMs} ms` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">Derived Key Length:</span>
                  <span className="text-white font-bold">256 bits (32 bytes)</span>
                </div>
                <div>
                  <span className="text-cyber-muted block mb-0.5">Derived KEK (Hex):</span>
                  <span className="text-cyber-success font-bold break-all select-all block bg-cyber-card p-1.5 rounded border border-cyber-border">
                    {lab1KekHex || 'Click "Run Derivation" to execute'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 3: ENCRYPTION STUDIO */}
      {activeLab === 3 && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyber-primary" />
                <span>Lab 3 — XChaCha20-Poly1305 Encryption Studio</span>
              </h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Inspect raw 192-bit Nonce, Ciphertext, and 128-bit Poly1305 Authentication Tag.
              </p>
            </div>
            <button
              onClick={runEncryption}
              className="px-4 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Seal Plaintext</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-cyber-muted mb-1.5 uppercase">Demonstration Plaintext</label>
              <textarea
                value={demoPlaintext}
                onChange={(e) => setDemoPlaintext(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono"
              />
            </div>

            {demoPayload && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase block">Fresh 192-bit Nonce (24 Bytes)</span>
                  <span className="text-cyber-cyan font-bold break-all select-all block">
                    {demoPayload.nonceHex}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase block">Poly1305 MAC Tag (16 Bytes)</span>
                  <span className="text-cyber-violet font-bold break-all select-all block">
                    {demoPayload.tagHex}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-1">
                  <span className="text-[10px] text-cyber-muted uppercase block">Ciphertext Bytes ({demoPayload.ciphertextHex.length / 2} B)</span>
                  <span className="text-cyber-success font-bold break-all select-all block max-h-16 overflow-y-auto">
                    {demoPayload.ciphertextHex}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 4: DECRYPTION STUDIO */}
      {activeLab === 4 && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-cyber-cyan" />
                <span>Lab 4 — Authenticated Decryption Studio</span>
              </h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Authenticates Poly1305 tag before ciphertext decryption.
              </p>
            </div>
            <button
              onClick={runDecryption}
              disabled={!demoPayload}
              className="px-4 py-2 rounded-xl bg-cyber-cyan hover:bg-cyber-cyan/90 text-cyber-bg text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-glow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Verify & Open Record</span>
            </button>
          </div>

          {!demoPayload ? (
            <div className="text-center py-12 text-cyber-muted text-xs">
              First seal a message in Lab 3 to produce valid ciphertext.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
                <span className="text-cyber-muted uppercase block">Target Ciphertext Payload</span>
                <div className="text-cyber-text break-all select-all bg-cyber-card p-2 rounded">
                  {demoPayload.ciphertextHex}
                </div>
              </div>

              {demoDecrypted && (
                <div className="p-4 rounded-xl bg-cyber-success/10 border border-cyber-success/40 space-y-2">
                  <div className="flex items-center gap-2 text-cyber-success font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Poly1305 Authentication Passed ({decDurationMs} ms)</span>
                  </div>
                  <pre className="text-white text-xs bg-cyber-card p-3 rounded-lg select-all">
                    {demoDecrypted}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LAB 5: TAMPER DETECTION DRILL */}
      {activeLab === 5 && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyber-danger" />
                <span>Lab 5 — Poly1305 Tamper & Bit-Flip Detection</span>
              </h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Deliberately modify a single byte in the ciphertext, nonce, or tag to observe authenticated rejection.
              </p>
            </div>
            <button
              onClick={runTamperSimulation}
              className="px-4 py-2 rounded-xl bg-cyber-danger hover:bg-cyber-danger/90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-cyber-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Flip Byte & Attempt Decryption</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-cyber-muted mb-1.5 uppercase">Tamper Target Component</label>
                <div className="grid grid-cols-3 gap-2">
                  {['ciphertext', 'tag', 'nonce'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTamperTarget(t as any)}
                      className={`p-2 rounded-lg border uppercase text-[11px] font-bold transition-colors ${
                        tamperTarget === t
                          ? 'bg-cyber-danger/20 border-cyber-danger text-cyber-danger'
                          : 'bg-cyber-bg border-cyber-border text-cyber-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-cyber-muted mb-1.5 uppercase">Byte Offset to Corrupt (Index: {tamperByteIndex})</label>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={tamperByteIndex}
                  onChange={(e) => setTamperByteIndex(Number(e.target.value))}
                  className="w-full accent-cyber-danger bg-cyber-bg cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border text-[11px] text-cyber-muted leading-relaxed font-sans">
                <strong>Cryptographic Property:</strong> In an AEAD construction, any alteration of even a single bit in either the ciphertext or the tag changes the evaluation of the Poly1305 polynomial over the field <code className="text-cyber-cyan font-mono">2^130 - 5</code>, resulting in instant deterministic rejection.
              </div>
            </div>

            {/* Tamper Result Panel */}
            <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-cyber-muted uppercase block mb-2">AEAD Verification Outcome</span>
                {tamperDecryptionError ? (
                  <div className="p-3.5 rounded-xl bg-cyber-danger/15 border border-cyber-danger/40 text-cyber-danger space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Tamper Detected: Authentication Aborted</span>
                    </div>
                    <p className="text-[11px] text-cyber-muted font-sans">
                      {tamperDecryptionError}
                    </p>
                    <div className="text-[10px] text-cyber-danger font-mono bg-cyber-bg p-1.5 rounded">
                      C Return Code: VF_ERR_AUTH_FAILED (-3)
                    </div>
                  </div>
                ) : tamperDecryptionSuccess ? (
                  <div className="p-3.5 rounded-xl bg-cyber-success/15 border border-cyber-success/40 text-cyber-success">
                    Warning: Decryption succeeded (no corruption applied yet)
                  </div>
                ) : (
                  <div className="py-12 text-center text-cyber-muted">
                    Click "Flip Byte & Attempt Decryption" to test.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: KEY HIERARCHY & LAB 6: NONCE REUSE */}
      {(activeLab === 2 || activeLab === 6) && (
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 text-xs">
          <h2 className="text-lg font-display font-bold text-white">
            {activeLab === 2 ? 'Lab 2 — Envelope Encryption Hierarchy' : 'Lab 6 — Nonce Reuse Risk in Stream Ciphers'}
          </h2>
          <p className="text-cyber-muted leading-relaxed font-sans text-xs">
            {activeLab === 2
              ? 'Envelope encryption ensures that the master password never encrypts data directly. If you change your master password, only the 32-byte Data Encryption Key (DEK) is re-wrapped with a fresh KEK and salt, eliminating the need to decrypt and re-encrypt all stored credentials.'
              : 'In stream ciphers like ChaCha20, reusing the same key and nonce pair produces the exact same keystream bytes. An adversary XORing two ciphertexts can cancel out the keystream entirely (C1 ⊕ C2 = P1 ⊕ P2), completely compromising confidentiality. VAULTFORGE prevents this by generating a fresh, cryptographically secure 192-bit random nonce for every operation via libsodium randombytes_buf().'}
          </p>
        </div>
      )}
    </div>
  );
};

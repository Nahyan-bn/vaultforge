import React, { useState } from 'react';
import { useTelemetryStore } from '../../store/telemetryStore';
import { Terminal, Shield, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp, Copy, Check, Filter } from 'lucide-react';

export const TelemetryDrawer: React.FC = () => {
  const { logs, isDrawerOpen, toggleDrawer, clearLogs, filter, setFilter } = useTelemetryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.operation === filter;
  });

  const handleCopy = (log: typeof logs[0]) => {
    const text = `${log.c_function} [${log.operation}] -> ${log.status} | in: ${log.input_bytes}B, out: ${log.output_bytes}B | ${log.duration_ms}ms`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const operations = ['ALL', 'KDF_DERIVE', 'AEAD_SEAL', 'AEAD_OPEN', 'KEY_GEN', 'KEY_WRAP', 'KEY_UNWRAP', 'CSPRNG_GEN', 'MEM_ZERO', 'INTEGRITY_CHECK'];

  return (
    <>
      {/* Floating Minimized Pill at bottom-right */}
      {!isDrawerOpen && (
        <button
          onClick={toggleDrawer}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-cyber-card/90 hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan/50 text-cyber-text text-xs font-mono shadow-cyber transition-all duration-200 group backdrop-blur-md"
          title="Open C-Engine Realtime Telemetry Drawer"
        >
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>C-ENGINE TELEMETRY</span>
          <span className="px-1.5 py-0.2 rounded bg-cyber-primary/20 text-cyber-cyan font-bold text-[10px]">
            {logs.length}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-cyber-muted group-hover:text-cyber-cyan transition-colors" />
        </button>
      )}

      {/* Expanded Telemetry Drawer */}
      {isDrawerOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[380px] h-[380px] bg-cyber-bg/95 border-t border-cyber-cyan/30 shadow-2xl backdrop-blur-xl flex flex-col font-mono">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-cyber-bgSecondary/90 border-b border-cyber-border select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-cyber-cyan">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider uppercase font-display">
                  C-Engine WebAssembly Telemetry Drawer
                </span>
              </div>
              <span className="text-[11px] text-cyber-muted hidden sm:inline">
                Live boundary logs: TypeScript → Web Worker → WASM → C libsodium
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="px-2 py-1 text-[11px] text-cyber-muted hover:text-white rounded border border-cyber-border hover:bg-cyber-elevated transition-colors"
              >
                Clear
              </button>
              <button
                onClick={toggleDrawer}
                className="p-1 text-cyber-muted hover:text-cyber-text rounded hover:bg-cyber-elevated transition-colors"
                title="Minimize Drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-cyber-card/60 border-b border-cyber-border/60 overflow-x-auto text-[11px]">
            <Filter className="w-3 h-3 text-cyber-muted mr-1 shrink-0" />
            {operations.map((op) => (
              <button
                key={op}
                onClick={() => setFilter(op)}
                className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                  filter === op
                    ? 'bg-cyber-primary text-white font-bold'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Log List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-cyber-muted text-xs py-8">
                <Shield className="w-8 h-8 text-cyber-border mb-2" />
                <p>No cryptographic operations logged yet for current filter.</p>
                <p className="text-[10px] text-cyber-muted/60 mt-1">
                  Perform actions like generating passwords, unlocking, or sealing records to observe live C calls.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded bg-cyber-card/40 hover:bg-cyber-elevated/60 border border-cyber-border/40 hover:border-cyber-cyan/30 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-[10px] text-cyber-muted shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>

                    {log.status === 'VF_OK' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-cyber-danger shrink-0" />
                    )}

                    <span className="text-cyber-cyan font-semibold truncate shrink-0">
                      {log.c_function}
                    </span>

                    <span className="px-1.5 py-0.2 rounded bg-cyber-elevated text-cyber-violet text-[10px] border border-cyber-violet/30 shrink-0">
                      {log.operation}
                    </span>

                    <span className="text-cyber-muted text-[11px] truncate">
                      in: <span className="text-cyber-text">{log.input_bytes}B</span> | out: <span className="text-cyber-text">{log.output_bytes}B</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-bold ${
                        log.duration_ms < 5 ? 'text-cyber-success' : log.duration_ms < 100 ? 'text-cyber-cyan' : 'text-cyber-warning'
                      }`}
                    >
                      {log.duration_ms} ms
                    </span>

                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        log.status === 'VF_OK'
                          ? 'bg-cyber-success/10 text-cyber-success border border-cyber-success/30'
                          : 'bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/30'
                      }`}
                    >
                      {log.status}
                    </span>

                    <button
                      onClick={() => handleCopy(log)}
                      className="p-1 text-cyber-muted hover:text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy telemetry record"
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-cyber-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

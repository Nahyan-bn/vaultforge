import React, { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Link2,
  Lock
} from 'lucide-react';

export const SecurityCenter: React.FC = () => {
  const { auditEvents, activeVault } = useVaultStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filteredEvents = auditEvents.filter((evt) => {
    if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && evt.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.description.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q) ||
        evt.currHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditLog = () => {
    const jsonStr = JSON.stringify(auditEvents, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultforge_audit_log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyber-cyan" />
            <span>Security Operations Center</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-0.5">
            Immutable hash-linked audit ledger • Every state change linked with BLAKE2b digests
          </p>
        </div>

        <button
          onClick={exportAuditLog}
          className="px-4 py-2 rounded-xl bg-cyber-card hover:bg-cyber-elevated border border-cyber-border hover:border-cyber-cyan text-cyber-cyan text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Ledger (.json)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event description or hash..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">Authentication (AUTH)</option>
            <option value="VAULT">Vault Lifecycle (VAULT)</option>
            <option value="RECORD">Records (RECORD)</option>
            <option value="INTEGRITY">Integrity (INTEGRITY)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-white text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-cyber overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-[11px] text-cyber-muted uppercase">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3">Event Description</th>
                <th className="pb-3 px-3">Linked Digest (Prev → Curr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-cyber-muted">
                    No security events recorded.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-cyber-elevated/40 transition-colors">
                    <td className="py-3 px-3 text-cyber-muted whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-cyber-bg border border-cyber-border text-cyber-cyan text-[10px] font-bold">
                        {evt.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-cyber-danger/15 text-cyber-danger border border-cyber-danger/30'
                            : evt.severity === 'WARNING'
                            ? 'bg-cyber-warning/15 text-cyber-warning border border-cyber-warning/30'
                            : 'bg-cyber-success/15 text-cyber-success border border-cyber-success/30'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-sans text-xs">
                      {evt.description}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-cyber-muted font-mono whitespace-nowrap">
                      <span className="text-cyber-muted/60">{evt.prevHash.slice(0, 6)}...</span>
                      <span className="text-cyber-cyan mx-1">→</span>
                      <span className="text-cyber-cyan font-bold">{evt.currHash.slice(0, 8)}...</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

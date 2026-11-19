import React, { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { storageManager } from '../storage/indexedDb';
import {
  Download,
  Upload,
  Shield,
  FileCheck,
  AlertTriangle,
  Lock,
  FileText,
  CheckCircle2,
  Check
} from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const { activeVault, records, isUnlocked, addRecord, logAudit } = useVaultStore();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importedPreview, setImportedPreview] = useState<any[] | null>(null);
  const [csvWarningConfirmed, setCsvWarningConfirmed] = useState(false);
  const [csvPasswordConfirm, setCsvPasswordConfirm] = useState('');

  // 1. Export Encrypted .vfvault Package
  const handleExportEncryptedBackup = async () => {
    if (!activeVault) return;

    const encryptedRows = await storageManager.getEncryptedRecords(activeVault.id);

    const backupPackage = {
      format: 'VAULTFORGE_ENCRYPTED_BACKUP',
      version: '1.0',
      exportedAt: Date.now(),
      vaultMeta: {
        name: activeVault.name,
        color: activeVault.color,
        saltHex: activeVault.saltHex,
        kdfParams: activeVault.kdfParams,
        primaryWrappedDek: activeVault.primaryWrappedDek,
        recoveryWrappedDek: activeVault.recoveryWrappedDek
      },
      encryptedRecords: encryptedRows
    };

    const jsonStr = JSON.stringify(backupPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeVault.name.toLowerCase().replace(/\s+/g, '_')}_backup_${Date.now()}.vfvault`;
    a.click();
    URL.revokeObjectURL(url);

    await logAudit('BACKUP', 'INFO', `Created encrypted .vfvault backup (${encryptedRows.length} records)`);
  };

  // 2. Import & Preview Backup
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.format !== 'VAULTFORGE_ENCRYPTED_BACKUP') {
          setImportStatus('Invalid backup format: missing VAULTFORGE magic header.');
          return;
        }
        setImportedPreview(parsed.encryptedRecords || []);
        setImportStatus(`Valid backup loaded: Contains ${parsed.encryptedRecords?.length || 0} encrypted records.`);
      } catch (err: any) {
        setImportStatus(`Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // 3. Export Plaintext CSV (with explicit warning)
  const handleExportPlaintextCsv = () => {
    if (!csvWarningConfirmed) return;

    const active = records.filter((r) => !r.isDeleted);
    let csv = 'type,title,category,username,password,notes\n';

    for (const r of active) {
      const type = r.type;
      const title = `"${(r.title || '').replace(/"/g, '""')}"`;
      const cat = `"${(r.category || '').replace(/"/g, '""')}"`;
      const user = r.type === 'login' ? `"${((r as any).username || '').replace(/"/g, '""')}"` : '""';
      const pwd = r.type === 'login' ? `"${((r as any).password || '').replace(/"/g, '""')}"` : '""';
      const notes = `"${(r.notes || '').replace(/"/g, '""')}"`;
      csv += `${type},${title},${cat},${user},${pwd},${notes}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultforge_plaintext_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 font-mono">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-cyber-cyan" />
          <span>Backup & Encrypted Data Migration</span>
        </h1>
        <p className="text-xs text-cyber-muted mt-0.5">
          Versioned cryptographic backups • Retains Argon2id salt and AEAD envelope tags
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encrypted Export Card */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyber-cyan">
              <Shield className="w-5 h-5" />
              <h2 className="text-base font-display font-bold text-white">
                Export Encrypted .vfvault Package
              </h2>
            </div>
            <p className="text-xs text-cyber-muted font-sans leading-relaxed">
              Produces a cryptographically sealed package. Records remain fully encrypted under your Data Encryption Key. Can only be unwrapped by a user possessing the master password or recovery key.
            </p>
          </div>

          <button
            onClick={handleExportEncryptedBackup}
            className="w-full py-3 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-cyber-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Encrypted .vfvault</span>
          </button>
        </div>

        {/* Backup Import Card */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyber-violet">
              <Upload className="w-5 h-5" />
              <h2 className="text-base font-display font-bold text-white">
                Restore or Inspect .vfvault Backup
              </h2>
            </div>
            <p className="text-xs text-cyber-muted font-sans leading-relaxed">
              Upload a previously exported .vfvault file to restore records or inspect schema integrity.
            </p>

            <input
              type="file"
              accept=".vfvault,.json"
              onChange={handleFileSelect}
              className="block w-full text-xs text-cyber-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-cyber-bg file:text-cyber-cyan hover:file:bg-cyber-elevated cursor-pointer"
            />

            {importStatus && (
              <div className="p-3 rounded-xl bg-cyber-bg border border-cyber-border text-xs text-cyber-cyan">
                {importStatus}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plaintext CSV Danger Zone */}
      <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-danger/30 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-cyber-danger">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-display font-bold text-base text-white">
            Unencrypted Plaintext CSV Export (Security Risk)
          </h2>
        </div>
        <p className="text-cyber-muted font-sans leading-relaxed">
          Exporting credentials in plaintext removes all cryptographic protections. Any process or file reader with disk access can read your passwords.
        </p>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={csvWarningConfirmed}
            onChange={(e) => setCsvWarningConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-cyber-danger bg-cyber-bg border-cyber-border focus:ring-0"
          />
          <span className="text-white text-xs font-sans">
            I understand that exporting plaintext CSV removes all encryption.
          </span>
        </label>

        <button
          onClick={handleExportPlaintextCsv}
          disabled={!csvWarningConfirmed}
          className="px-5 py-2.5 rounded-xl bg-cyber-danger/20 hover:bg-cyber-danger disabled:opacity-40 text-cyber-danger hover:text-white border border-cyber-danger/40 text-xs font-bold transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Export Plaintext CSV</span>
        </button>
      </div>
    </div>
  );
};

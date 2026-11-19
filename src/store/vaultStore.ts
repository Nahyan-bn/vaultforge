/**
 * VAULTFORGE — Master Vault State Management
 * Complete lifecycle: creation, derivation, unlock, lock, panic-lock, persistence
 */

import { create } from 'zustand';
import { cryptoBridge } from '../crypto/bridge';
import {
  storageManager,
  type VaultMetadata,
  type EncryptedRecordRow,
  type AuditEventRow,
  type VaultPreferences
} from '../storage/indexedDb';
import type { DecryptedRecord, VaultAnalytics } from '../types/vault';
import { analyzeVaultHealth } from '../utils/securityAnalysis';

interface VaultState {
  // Vault Meta & Status
  availableVaults: VaultMetadata[];
  activeVault: VaultMetadata | null;
  isUnlocked: boolean;
  activeDekHex: string | null;
  records: DecryptedRecord[];
  analytics: VaultAnalytics;
  auditEvents: AuditEventRow[];
  preferences: VaultPreferences;
  isDemoMode: boolean;
  demoScenarioId: string | null;
  lastActivity: number;
  autoLockRemainingSeconds: number;
  isLoading: boolean;
  errorMessage: string | null;

  // Actions
  refreshVaults: () => Promise<void>;
  createVault: (
    name: string,
    color: string,
    masterPassword: string,
    customKdfParams?: { opslimit: number; memlimit: number }
  ) => Promise<{ recoveryKeyHex: string; vaultId: string }>;
  unlockVault: (vaultId: string, masterPassword: string) => Promise<boolean>;
  unlockWithRecoveryKey: (vaultId: string, recoveryKeyHex: string) => Promise<boolean>;
  lockVault: () => Promise<void>;
  panicLock: () => Promise<void>;
  updateActivity: () => void;
  addRecord: (record: any) => Promise<void>;
  updateRecord: (record: DecryptedRecord) => Promise<void>;
  deleteRecord: (id: string, permanent?: boolean) => Promise<void>;
  restoreRecord: (id: string) => Promise<void>;
  changeMasterPassword: (newPassword: string) => Promise<boolean>;
  logAudit: (category: AuditEventRow['category'], severity: AuditEventRow['severity'], description: string, sanitizedTargetId?: string) => Promise<void>;
  setDemoMode: (isDemo: boolean, scenarioId?: string) => Promise<void>;
  exitDemoMode: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<VaultPreferences>) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  availableVaults: [],
  activeVault: null,
  isUnlocked: false,
  activeDekHex: null,
  records: [],
  analytics: {
    totalRecords: 0,
    loginCount: 0,
    noteCount: 0,
    cardCount: 0,
    apiKeyCount: 0,
    strongPasswords: 0,
    weakPasswords: 0,
    reusedPasswords: 0,
    oldPasswords: 0,
    securityScore: 100,
    issues: []
  },
  auditEvents: [],
  preferences: {
    autoLockMinutes: 10,
    clipboardClearSeconds: 30,
    lowGraphicsMode: false,
    passwordAgeThresholdDays: 90
  },
  isDemoMode: false,
  demoScenarioId: null,
  lastActivity: Date.now(),
  autoLockRemainingSeconds: 600,
  isLoading: false,
  errorMessage: null,

  refreshVaults: async () => {
    try {
      const isDemo = get().isDemoMode;
      const vaults = await storageManager.getAllVaults(isDemo);
      const prefs = await storageManager.getPreferences();
      set({ availableVaults: vaults, preferences: prefs });
    } catch (e: any) {
      set({ errorMessage: e?.message || 'Failed to list vaults' });
    }
  },

  createVault: async (name, color, masterPassword, customKdfParams) => {
    set({ isLoading: true, errorMessage: null });
    const isDemo = get().isDemoMode;

    try {
      await cryptoBridge.init();

      // 1. Calibrate or use parameters
      const defaultKdf = await cryptoBridge.calibrateKdf();
      const kdfParams = {
        opslimit: customKdfParams?.opslimit || defaultKdf.opslimit,
        memlimit: customKdfParams?.memlimit || defaultKdf.memlimit,
        algorithm: defaultKdf.algorithm
      };

      // 2. Generate Salt (16 bytes = 32 hex chars)
      const saltGen = await cryptoBridge.generateDek();
      const saltHex = saltGen.dekHex.slice(0, 32);

      // 3. Derive Primary KEK via Argon2id
      const { kekHex } = await cryptoBridge.deriveKek(masterPassword, saltHex, kdfParams);

      // 4. Generate Master Data Encryption Key (DEK)
      const { dekHex } = await cryptoBridge.generateDek();

      // 5. Wrap DEK with Primary KEK
      const { wrapped: primaryWrappedDek } = await cryptoBridge.wrapKey(dekHex, kekHex);

      // 6. Generate 256-bit Recovery Secret & Wrap DEK
      const recoverySecretGen = await cryptoBridge.generateDek();
      const recoveryKeyHex = recoverySecretGen.dekHex;
      // Derive recovery KEK with context
      const { hashHex: recoveryKekHex } = await cryptoBridge.hashDigest(`VF_RECOVERY_KEY_DERIVATION:${recoveryKeyHex}`);
      const { wrapped: recoveryWrappedDek } = await cryptoBridge.wrapKey(dekHex, recoveryKekHex, 'VAULTFORGE_RECOVERY_ENVELOPE_V1');

      const vaultId = `vf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();

      const newVault: VaultMetadata = {
        id: vaultId,
        name,
        color,
        saltHex,
        kdfParams,
        primaryWrappedDek,
        recoveryWrappedDek,
        createdAt: now,
        updatedAt: now
      };

      await storageManager.saveVaultMetadata(newVault, isDemo);

      // Log creation audit event
      const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const eventDesc = `Vault "${name}" created with Argon2id parameters (m=${kdfParams.memlimit / 1024 / 1024}MB, t=${kdfParams.opslimit})`;
      const { hashHex: currHash } = await cryptoBridge.hashDigest(`${genesisHash}:${eventDesc}:${now}`);

      const auditEvent: AuditEventRow = {
        id: `aud_${now}`,
        vaultId,
        timestamp: now,
        category: 'VAULT',
        severity: 'INFO',
        description: eventDesc,
        prevHash: genesisHash,
        currHash
      };
      await storageManager.logAuditEvent(auditEvent, isDemo);

      // Unlock newly created vault
      set({
        activeVault: newVault,
        isUnlocked: true,
        activeDekHex: dekHex,
        records: [],
        analytics: analyzeVaultHealth([]),
        auditEvents: [auditEvent],
        isLoading: false,
        lastActivity: Date.now(),
        autoLockRemainingSeconds: get().preferences.autoLockMinutes * 60
      });

      await get().refreshVaults();
      return { recoveryKeyHex, vaultId };
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e?.message || 'Failed to create vault' });
      throw e;
    }
  },

  unlockVault: async (vaultId, masterPassword) => {
    set({ isLoading: true, errorMessage: null });
    const isDemo = get().isDemoMode;

    try {
      await cryptoBridge.init();
      const vault = await storageManager.getVaultMetadata(vaultId, isDemo);
      if (!vault) {
        throw new Error('Vault not found on this device');
      }

      // 1. Derive Primary KEK using stored Argon2id salt and parameters
      const { kekHex } = await cryptoBridge.deriveKek(masterPassword, vault.saltHex, vault.kdfParams);

      // 2. Unwrap DEK using KEK
      let dekHex: string;
      try {
        const unwrapped = await cryptoBridge.unwrapKey(vault.primaryWrappedDek, kekHex);
        dekHex = unwrapped.dekHex;
      } catch {
        // Authenticated decryption rejected invalid key/tampered tag
        await get().logAudit('AUTH', 'WARNING', 'Failed unlock attempt: incorrect master password');
        set({ isLoading: false, errorMessage: 'Invalid master password or corrupted envelope' });
        return false;
      }

      // 3. Load & Decrypt all records with DEK
      const encryptedRows = await storageManager.getEncryptedRecords(vaultId, isDemo);
      const decryptedRecords: DecryptedRecord[] = [];

      for (const row of encryptedRows) {
        try {
          const { plaintext } = await cryptoBridge.openRecord(row.encryptedPayload, dekHex);
          const parsed = JSON.parse(plaintext);
          decryptedRecords.push(parsed);
        } catch (decryptErr) {
          console.error(`Record ${row.id} failed AEAD authentication:`, decryptErr);
          await get().logAudit('INTEGRITY', 'CRITICAL', `AEAD tag mismatch on record ID ${row.id.slice(0, 8)}: potential tampering detected`, row.id);
        }
      }

      const auditEvents = await storageManager.getAuditEvents(vaultId, isDemo);
      const analytics = analyzeVaultHealth(decryptedRecords, get().preferences.passwordAgeThresholdDays);

      set({
        activeVault: vault,
        isUnlocked: true,
        activeDekHex: dekHex,
        records: decryptedRecords,
        analytics,
        auditEvents,
        isLoading: false,
        lastActivity: Date.now(),
        autoLockRemainingSeconds: get().preferences.autoLockMinutes * 60
      });

      await get().logAudit('AUTH', 'INFO', `Vault "${vault.name}" unlocked successfully`);
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e?.message || 'Authentication error' });
      return false;
    }
  },

  unlockWithRecoveryKey: async (vaultId, recoveryKeyHex) => {
    set({ isLoading: true, errorMessage: null });
    const isDemo = get().isDemoMode;

    try {
      await cryptoBridge.init();
      const vault = await storageManager.getVaultMetadata(vaultId, isDemo);
      if (!vault) throw new Error('Vault metadata not found');

      const { hashHex: recoveryKekHex } = await cryptoBridge.hashDigest(`VF_RECOVERY_KEY_DERIVATION:${recoveryKeyHex.trim()}`);
      const { dekHex } = await cryptoBridge.unwrapKey(vault.recoveryWrappedDek, recoveryKekHex, 'VAULTFORGE_RECOVERY_ENVELOPE_V1');

      const encryptedRows = await storageManager.getEncryptedRecords(vaultId, isDemo);
      const decryptedRecords: DecryptedRecord[] = [];

      for (const row of encryptedRows) {
        try {
          const { plaintext } = await cryptoBridge.openRecord(row.encryptedPayload, dekHex);
          decryptedRecords.push(JSON.parse(plaintext));
        } catch (e) {
          console.error(e);
        }
      }

      const auditEvents = await storageManager.getAuditEvents(vaultId, isDemo);
      const analytics = analyzeVaultHealth(decryptedRecords, get().preferences.passwordAgeThresholdDays);

      set({
        activeVault: vault,
        isUnlocked: true,
        activeDekHex: dekHex,
        records: decryptedRecords,
        analytics,
        auditEvents,
        isLoading: false,
        lastActivity: Date.now(),
        autoLockRemainingSeconds: get().preferences.autoLockMinutes * 60
      });

      await get().logAudit('AUTH', 'WARNING', `Vault unlocked via Emergency Recovery Key`);
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e?.message || 'Invalid recovery key' });
      return false;
    }
  },

  lockVault: async () => {
    // Memory Hygiene: Wipe DEK from state and C worker memory
    await cryptoBridge.panicLock();
    set({
      isUnlocked: false,
      activeDekHex: null,
      records: [],
      analytics: analyzeVaultHealth([]),
      activeVault: null
    });
  },

  panicLock: async () => {
    // 1. Zero all reachable C key buffers via sodium_memzero
    await cryptoBridge.panicLock();

    // 2. Best-effort clear sensitive clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText('');
      }
    } catch (e) {
      console.warn('Clipboard clearing limited by browser permissions:', e);
    }

    // 3. Clear application memory state
    set({
      isUnlocked: false,
      activeDekHex: null,
      records: [],
      analytics: analyzeVaultHealth([]),
      activeVault: null
    });
  },

  updateActivity: () => {
    set({
      lastActivity: Date.now(),
      autoLockRemainingSeconds: get().preferences.autoLockMinutes * 60
    });
  },

  addRecord: async (recordData) => {
    const { activeVault, activeDekHex, records, isDemoMode } = get();
    if (!activeVault || !activeDekHex) throw new Error('Vault is locked');

    const now = Date.now();
    const id = `rec_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const fullRecord: DecryptedRecord = {
      ...recordData,
      id,
      vaultId: activeVault.id,
      createdAt: now,
      updatedAt: now
    } as DecryptedRecord;

    // Serialize to plaintext JSON
    const plaintext = JSON.stringify(fullRecord);

    // AEAD Seal with XChaCha20-Poly1305 and bound associated data
    const ad = `VAULTFORGE_RECORD:${activeVault.id}:${id}`;
    const { payload } = await cryptoBridge.sealRecord(plaintext, activeDekHex, ad);

    // Compute digest for integrity monitoring
    const { hashHex: digestHex } = await cryptoBridge.hashDigest(payload.ciphertextHex);

    const row: EncryptedRecordRow = {
      id,
      vaultId: activeVault.id,
      type: fullRecord.type,
      encryptedPayload: payload,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      isFavorite: fullRecord.isFavorite || false,
      category: fullRecord.category || 'General',
      digestHex
    };

    await storageManager.saveEncryptedRecord(row, isDemoMode);

    const updatedRecords = [...records, fullRecord];
    const analytics = analyzeVaultHealth(updatedRecords, get().preferences.passwordAgeThresholdDays);

    set({ records: updatedRecords, analytics });
    await get().logAudit('RECORD', 'INFO', `Created new ${fullRecord.type} record "${fullRecord.title}"`, id);
  },

  updateRecord: async (updatedRecord) => {
    const { activeVault, activeDekHex, records, isDemoMode } = get();
    if (!activeVault || !activeDekHex) throw new Error('Vault is locked');

    const now = Date.now();
    const modifiedRecord = { ...updatedRecord, updatedAt: now };
    const plaintext = JSON.stringify(modifiedRecord);
    const ad = `VAULTFORGE_RECORD:${activeVault.id}:${modifiedRecord.id}`;
    const { payload } = await cryptoBridge.sealRecord(plaintext, activeDekHex, ad);
    const { hashHex: digestHex } = await cryptoBridge.hashDigest(payload.ciphertextHex);

    const row: EncryptedRecordRow = {
      id: modifiedRecord.id,
      vaultId: activeVault.id,
      type: modifiedRecord.type,
      encryptedPayload: payload,
      createdAt: modifiedRecord.createdAt,
      updatedAt: now,
      isDeleted: modifiedRecord.isDeleted,
      isFavorite: modifiedRecord.isFavorite,
      category: modifiedRecord.category,
      digestHex
    };

    await storageManager.saveEncryptedRecord(row, isDemoMode);

    const updatedList = records.map((r) => (r.id === modifiedRecord.id ? modifiedRecord : r));
    const analytics = analyzeVaultHealth(updatedList, get().preferences.passwordAgeThresholdDays);

    set({ records: updatedList, analytics });
    await get().logAudit('RECORD', 'INFO', `Updated record "${modifiedRecord.title}"`, modifiedRecord.id);
  },

  deleteRecord: async (id, permanent = false) => {
    const { records, activeVault, isDemoMode } = get();
    const target = records.find((r) => r.id === id);
    if (!target) return;

    if (permanent) {
      await storageManager.deleteEncryptedRecord(id, isDemoMode);
      const filtered = records.filter((r) => r.id !== id);
      set({ records: filtered, analytics: analyzeVaultHealth(filtered, get().preferences.passwordAgeThresholdDays) });
      await get().logAudit('RECORD', 'WARNING', `Permanently deleted record "${target.title}"`, id);
    } else {
      await get().updateRecord({ ...target, isDeleted: true });
    }
  },

  restoreRecord: async (id) => {
    const { records } = get();
    const target = records.find((r) => r.id === id);
    if (!target) return;
    await get().updateRecord({ ...target, isDeleted: false });
  },

  changeMasterPassword: async (newPassword) => {
    const { activeVault, activeDekHex, isDemoMode } = get();
    if (!activeVault || !activeDekHex) return false;

    // 1. Generate new Salt
    const saltGen = await cryptoBridge.generateDek();
    const newSaltHex = saltGen.dekHex.slice(0, 32);

    // 2. Derive new KEK
    const { kekHex: newKekHex } = await cryptoBridge.deriveKek(newPassword, newSaltHex, activeVault.kdfParams);

    // 3. Re-wrap existing DEK (Envelope encryption benefit: records don't need re-encryption!)
    const { wrapped: newWrappedDek } = await cryptoBridge.wrapKey(activeDekHex, newKekHex);

    const now = Date.now();
    const updatedVault: VaultMetadata = {
      ...activeVault,
      saltHex: newSaltHex,
      primaryWrappedDek: newWrappedDek,
      updatedAt: now
    };

    await storageManager.saveVaultMetadata(updatedVault, isDemoMode);
    set({ activeVault: updatedVault });
    await get().logAudit('VAULT', 'WARNING', `Master password updated and DEK envelope re-wrapped with fresh salt`);
    return true;
  },

  logAudit: async (category, severity, description, sanitizedTargetId) => {
    const { activeVault, auditEvents, isDemoMode } = get();
    if (!activeVault) return;

    const now = Date.now();
    const prevHash = auditEvents.length > 0 ? auditEvents[0].currHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const payloadToHash = `${prevHash}:${category}:${description}:${now}`;
    const { hashHex: currHash } = await cryptoBridge.hashDigest(payloadToHash);

    const event: AuditEventRow = {
      id: `aud_${now}_${Math.random().toString(36).slice(2, 6)}`,
      vaultId: activeVault.id,
      timestamp: now,
      category,
      severity,
      description,
      sanitizedTargetId,
      prevHash,
      currHash
    };

    await storageManager.logAuditEvent(event, isDemoMode);
    set({ auditEvents: [event, ...auditEvents].slice(0, 200) });
  },

  setDemoMode: async (isDemo, scenarioId) => {
    if (isDemo) {
      set({ isDemoMode: true, demoScenarioId: scenarioId || 'healthy' });
      await get().refreshVaults();
    } else {
      await get().exitDemoMode();
    }
  },

  exitDemoMode: async () => {
    await storageManager.wipeDemoSandbox();
    await get().lockVault();
    set({ isDemoMode: false, demoScenarioId: null });
    await get().refreshVaults();
  },

  updatePreferences: async (newPrefs) => {
    const updated = { ...get().preferences, ...newPrefs };
    await storageManager.savePreferences(updated);
    set({ preferences: updated });
  }
}));

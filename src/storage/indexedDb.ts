/**
 * VAULTFORGE — IndexedDB Encrypted Storage Engine
 * Persistent local-first storage with cryptographic integrity and demo isolation
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { KdfParams, WrappedKey, EncryptedPayload } from '../crypto/types';

export interface VaultMetadata {
  id: string;
  name: string;
  color: string;
  saltHex: string;
  kdfParams: KdfParams;
  primaryWrappedDek: WrappedKey;
  recoveryWrappedDek: WrappedKey;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedRecordRow {
  id: string;
  vaultId: string;
  type: 'login' | 'note' | 'card' | 'api_key';
  encryptedPayload: EncryptedPayload;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  isFavorite: boolean;
  category: string;
  digestHex: string; // Hash of ciphertext for integrity tracking
}

export interface AuditEventRow {
  id: string;
  vaultId: string;
  timestamp: number;
  category: 'AUTH' | 'VAULT' | 'RECORD' | 'CRYPTO' | 'BACKUP' | 'INTEGRITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  sanitizedTargetId?: string;
  prevHash: string;
  currHash: string;
}

export interface VaultPreferences {
  autoLockMinutes: number;
  clipboardClearSeconds: number;
  lowGraphicsMode: boolean;
  passwordAgeThresholdDays: number;
}

interface VaultForgeDB extends DBSchema {
  vault_meta: {
    key: string;
    value: VaultMetadata;
  };
  encrypted_records: {
    key: string;
    value: EncryptedRecordRow;
    indexes: {
      'by-vault': string;
      'by-type': string;
      'by-deleted': number;
    };
  };
  audit_events: {
    key: string;
    value: AuditEventRow;
    indexes: {
      'by-vault': string;
      'by-timestamp': number;
    };
  };
  preferences: {
    key: string;
    value: any;
  };
}

const DB_NAME_PRODUCTION = 'vaultforge_secure_store_v1';
const DB_NAME_DEMO = 'vaultforge_sandbox_demo_store';

class StorageManager {
  private prodDbPromise: Promise<IDBPDatabase<VaultForgeDB>> | null = null;
  private demoDbPromise: Promise<IDBPDatabase<VaultForgeDB>> | null = null;

  private getDB(isDemo = false): Promise<IDBPDatabase<VaultForgeDB>> {
    const dbName = isDemo ? DB_NAME_DEMO : DB_NAME_PRODUCTION;

    if (isDemo) {
      if (!this.demoDbPromise) {
        this.demoDbPromise = this.openDatabase(dbName);
      }
      return this.demoDbPromise;
    } else {
      if (!this.prodDbPromise) {
        this.prodDbPromise = this.openDatabase(dbName);
      }
      return this.prodDbPromise;
    }
  }

  private openDatabase(dbName: string): Promise<IDBPDatabase<VaultForgeDB>> {
    return openDB<VaultForgeDB>(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vault_meta')) {
          db.createObjectStore('vault_meta', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('encrypted_records')) {
          const recordStore = db.createObjectStore('encrypted_records', { keyPath: 'id' });
          recordStore.createIndex('by-vault', 'vaultId');
          recordStore.createIndex('by-type', 'type');
          recordStore.createIndex('by-deleted', 'isDeleted');
        }
        if (!db.objectStoreNames.contains('audit_events')) {
          const auditStore = db.createObjectStore('audit_events', { keyPath: 'id' });
          auditStore.createIndex('by-vault', 'vaultId');
          auditStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
      }
    });
  }

  // Vault Metadata operations
  public async saveVaultMetadata(meta: VaultMetadata, isDemo = false): Promise<void> {
    const db = await this.getDB(isDemo);
    await db.put('vault_meta', meta);
  }

  public async getVaultMetadata(id: string, isDemo = false): Promise<VaultMetadata | undefined> {
    const db = await this.getDB(isDemo);
    return db.get('vault_meta', id);
  }

  public async getAllVaults(isDemo = false): Promise<VaultMetadata[]> {
    const db = await this.getDB(isDemo);
    return db.getAll('vault_meta');
  }

  public async deleteVault(id: string, isDemo = false): Promise<void> {
    const db = await this.getDB(isDemo);
    const tx = db.transaction(['vault_meta', 'encrypted_records', 'audit_events'], 'readwrite');
    await tx.objectStore('vault_meta').delete(id);

    // Delete records belonging to vault
    const recordIndex = tx.objectStore('encrypted_records').index('by-vault');
    let cursor = await recordIndex.openCursor(id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    // Delete audit events
    const auditIndex = tx.objectStore('audit_events').index('by-vault');
    let auditCursor = await auditIndex.openCursor(id);
    while (auditCursor) {
      await auditCursor.delete();
      auditCursor = await auditCursor.continue();
    }

    await tx.done;
  }

  // Encrypted Records CRUD
  public async saveEncryptedRecord(record: EncryptedRecordRow, isDemo = false): Promise<void> {
    const db = await this.getDB(isDemo);
    await db.put('encrypted_records', record);
  }

  public async getEncryptedRecords(vaultId: string, isDemo = false): Promise<EncryptedRecordRow[]> {
    const db = await this.getDB(isDemo);
    return db.getAllFromIndex('encrypted_records', 'by-vault', vaultId);
  }

  public async deleteEncryptedRecord(id: string, isDemo = false): Promise<void> {
    const db = await this.getDB(isDemo);
    await db.delete('encrypted_records', id);
  }

  // Audit Events & Hash-chaining
  public async logAuditEvent(event: AuditEventRow, isDemo = false): Promise<void> {
    const db = await this.getDB(isDemo);
    await db.put('audit_events', event);
  }

  public async getAuditEvents(vaultId: string, isDemo = false): Promise<AuditEventRow[]> {
    const db = await this.getDB(isDemo);
    const events = await db.getAllFromIndex('audit_events', 'by-vault', vaultId);
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Preferences
  public async getPreferences(): Promise<VaultPreferences> {
    const db = await this.getDB(false);
    const prefs = await db.get('preferences', 'user_settings');
    return (
      prefs || {
        autoLockMinutes: 10,
        clipboardClearSeconds: 30,
        lowGraphicsMode: false,
        passwordAgeThresholdDays: 90
      }
    );
  }

  public async savePreferences(prefs: VaultPreferences): Promise<void> {
    const db = await this.getDB(false);
    await db.put('preferences', prefs, 'user_settings');
  }

  // Wipe Demo Sandbox
  public async wipeDemoSandbox(): Promise<void> {
    const db = await this.getDB(true);
    const tx = db.transaction(['vault_meta', 'encrypted_records', 'audit_events'], 'readwrite');
    await tx.objectStore('vault_meta').clear();
    await tx.objectStore('encrypted_records').clear();
    await tx.objectStore('audit_events').clear();
    await tx.done;
  }
}

export const storageManager = new StorageManager();

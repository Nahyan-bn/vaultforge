/**
 * VAULTFORGE — Typed Web Worker Cryptographic Bridge
 * Connects the TypeScript Application Layer to the isolated WebAssembly Worker
 */

import type {
  WorkerRequest,
  WorkerResponse,
  TelemetryLog,
  KdfParams,
  WrappedKey,
  EncryptedPayload
} from './types';

type TelemetryListener = (telemetry: TelemetryLog) => void;

class CryptoBridge {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void }
  >();
  private telemetryListeners = new Set<TelemetryListener>();
  private isInitialized = false;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker === 'undefined') {
      return;
    }

    // In Vite, import worker with worker constructor syntax
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const res = event.data;

      // Broadcast telemetry to developer drawer / monitoring
      if (res.telemetry) {
        this.notifyTelemetry(res.telemetry);
      }

      const pending = this.pendingRequests.get(res.id);
      if (!pending) return;

      this.pendingRequests.delete(res.id);

      if (res.success) {
        pending.resolve(res.data);
      } else {
        pending.reject(new Error(res.error || 'Cryptographic engine error'));
      }
    };

    this.worker.onerror = (err) => {
      console.error('[VAULTFORGE C-WORKER ERROR]', err);
    };
  }

  public onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => this.telemetryListeners.delete(listener);
  }

  private notifyTelemetry(telemetry: TelemetryLog) {
    for (const listener of this.telemetryListeners) {
      try {
        listener(telemetry);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private send<T>(req: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        return reject(new Error('Cryptographic worker is not initialized'));
      }
      const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ ...req, id } as WorkerRequest);
    });
  }

  public async init(): Promise<{ versionMajor: number; ready: boolean }> {
    if (this.isInitialized) return { versionMajor: 26, ready: true };
    const res = await this.send<{ versionMajor: number; ready: boolean }>({
      type: 'INIT'
    });
    this.isInitialized = true;
    return res;
  }

  public async calibrateKdf(targetMs = 300): Promise<KdfParams & { benchmarkDurationMs: number }> {
    return this.send<KdfParams & { benchmarkDurationMs: number }>({
      type: 'CALIBRATE_KDF',
      targetMs
    });
  }

  public async deriveKek(
    password: string,
    saltHex: string,
    params: KdfParams
  ): Promise<{ kekHex: string }> {
    return this.send<{ kekHex: string }>({
      type: 'DERIVE_KEK',
      password,
      saltHex,
      params
    });
  }

  public async generateDek(): Promise<{ dekHex: string }> {
    return this.send<{ dekHex: string }>({
      type: 'GENERATE_DEK'
    });
  }

  public async wrapKey(
    dekHex: string,
    kekHex: string,
    context = 'VAULTFORGE_DEK_ENVELOPE_V1'
  ): Promise<{ wrapped: WrappedKey }> {
    return this.send<{ wrapped: WrappedKey }>({
      type: 'WRAP_KEY',
      dekHex,
      kekHex,
      context
    });
  }

  public async unwrapKey(
    wrapped: WrappedKey,
    kekHex: string,
    context = 'VAULTFORGE_DEK_ENVELOPE_V1'
  ): Promise<{ dekHex: string }> {
    return this.send<{ dekHex: string }>({
      type: 'UNWRAP_KEY',
      wrapped,
      kekHex,
      context
    });
  }

  public async sealRecord(
    plaintext: string,
    keyHex: string,
    ad = 'VAULTFORGE_RECORD_V1'
  ): Promise<{ payload: EncryptedPayload }> {
    return this.send<{ payload: EncryptedPayload }>({
      type: 'SEAL_RECORD',
      plaintext,
      keyHex,
      ad
    });
  }

  public async openRecord(
    payload: EncryptedPayload,
    keyHex: string,
    ad = 'VAULTFORGE_RECORD_V1'
  ): Promise<{ plaintext: string }> {
    return this.send<{ plaintext: string }>({
      type: 'OPEN_RECORD',
      payload,
      keyHex,
      ad
    });
  }

  public async generatePassword(
    length = 20,
    options = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: true
    }
  ): Promise<{ password: string }> {
    return this.send<{ password: string }>({
      type: 'GENERATE_PASSWORD',
      length,
      options
    });
  }

  public async generatePin(length = 6): Promise<{ pin: string }> {
    return this.send<{ pin: string }>({
      type: 'GENERATE_PIN',
      length
    });
  }

  public async hashDigest(data: string): Promise<{ hashHex: string }> {
    return this.send<{ hashHex: string }>({
      type: 'HASH_DIGEST',
      data
    });
  }

  public async panicLock(): Promise<{ wipedBuffers: number }> {
    const res = await this.send<{ wipedBuffers: number }>({
      type: 'PANIC_LOCK'
    });
    return res;
  }

  public async tamperDemo(
    payload: EncryptedPayload,
    target: 'ciphertext' | 'tag' | 'nonce' | 'ad',
    byteIndex = 0
  ): Promise<{ tamperedPayload: EncryptedPayload }> {
    return this.send<{ tamperedPayload: EncryptedPayload }>({
      type: 'TAMPER_DEMO',
      payload,
      target,
      byteIndex
    });
  }
}

export const cryptoBridge = new CryptoBridge();

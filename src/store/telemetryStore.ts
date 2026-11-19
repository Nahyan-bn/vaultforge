/**
 * VAULTFORGE — Telemetry State Store
 * Captures real sanitized C engine calls crossing the TS -> Worker -> WASM -> C boundary
 */

import { create } from 'zustand';
import type { TelemetryLog } from '../crypto/types';
import { cryptoBridge } from '../crypto/bridge';

interface TelemetryState {
  logs: TelemetryLog[];
  isDrawerOpen: boolean;
  filter: string;
  addLog: (log: TelemetryLog) => void;
  clearLogs: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setFilter: (f: string) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  logs: [],
  isDrawerOpen: false,
  filter: 'ALL',

  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 100) // Keep last 100 entries
    })),

  clearLogs: () => set({ logs: [] }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setFilter: (filter) => set({ filter })
}));

// Hook into bridge telemetry events automatically
cryptoBridge.onTelemetry((log) => {
  useTelemetryStore.getState().addLog(log);
});

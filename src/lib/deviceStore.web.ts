import type { KeyValueStore } from './storage';

// Browser preview only: the browser's own storage, which stays in that browser.
function local(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

const memory = new Map<string, string>();

export const deviceStore: KeyValueStore = {
  async getItem(key) {
    try {
      return local()?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  async setItem(key, value) {
    memory.set(key, value);
    try {
      local()?.setItem(key, value);
    } catch {
      // Private mode or blocked storage: keep it in memory for this visit.
    }
  },
  async removeItem(key) {
    memory.delete(key);
    try {
      local()?.removeItem(key);
    } catch {
      // Nothing stored.
    }
  },
};

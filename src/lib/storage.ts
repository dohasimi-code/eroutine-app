import type { Language } from '../i18n';

// Minimal key-value contract, so the logic can be tested without a phone.
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export type Settings = {
  language: Language;
};

// Every key the app writes must be listed here so "delete all my data" really deletes everything.
export const STORAGE_KEYS = {
  settings: 'settings.v1',
  profile: 'profile.v1',
  menu: 'menu.v1',
  prices: 'prices.v1',
  list: 'list.v1',
  plan: 'plan.v1',
  journal: 'journal.v1',
} as const;

export async function loadSettings(store: KeyValueStore): Promise<Settings | null> {
  const raw = await store.getItem(STORAGE_KEYS.settings);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    if (parsed.language === 'sq' || parsed.language === 'en') {
      return { language: parsed.language };
    }
  } catch {
    // Corrupt value: fall through and treat as no saved settings.
  }
  return null;
}

export async function saveSettings(store: KeyValueStore, settings: Settings): Promise<void> {
  await store.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export async function deleteAllData(store: KeyValueStore): Promise<void> {
  await Promise.all(Object.values(STORAGE_KEYS).map((key) => store.removeItem(key)));
}

export function createMemoryStore(): KeyValueStore & { dump(): Record<string, string> } {
  const data = new Map<string, string>();
  return {
    async getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
    dump() {
      return Object.fromEntries(data);
    },
  };
}

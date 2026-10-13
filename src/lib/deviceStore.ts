import Storage from 'expo-sqlite/kv-store';

import type { KeyValueStore } from './storage';

// On the phone: a small SQLite key-value store, private to the app.
export const deviceStore: KeyValueStore = {
  getItem: (key) => Storage.getItem(key),
  setItem: (key, value) => Storage.setItem(key, value),
  removeItem: async (key) => {
    await Storage.removeItem(key);
  },
};

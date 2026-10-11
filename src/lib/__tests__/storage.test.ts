import { STORAGE_KEYS, createMemoryStore, deleteAllData, loadSettings, saveSettings } from '../storage';

describe('settings storage', () => {
  it('returns null when nothing is saved', async () => {
    expect(await loadSettings(createMemoryStore())).toBeNull();
  });

  it('keeps the chosen language after saving', async () => {
    const store = createMemoryStore();
    await saveSettings(store, { language: 'en' });
    expect(await loadSettings(store)).toEqual({ language: 'en' });
  });

  it('ignores a corrupt or unknown value instead of crashing', async () => {
    const store = createMemoryStore();
    await store.setItem(STORAGE_KEYS.settings, '{not json');
    expect(await loadSettings(store)).toBeNull();
    await store.setItem(STORAGE_KEYS.settings, JSON.stringify({ language: 'fr' }));
    expect(await loadSettings(store)).toBeNull();
  });

  it('"delete all my data" leaves nothing behind', async () => {
    const store = createMemoryStore();
    await saveSettings(store, { language: 'en' });
    await deleteAllData(store);
    expect(store.dump()).toEqual({});
  });
});

import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { pickInitialLanguage, translate, type Language, type TranslationKey } from '../i18n';
import { deleteAllData, loadSettings, saveSettings, type KeyValueStore } from './storage';

const deviceStore: KeyValueStore = {
  getItem: (key) => Storage.getItem(key),
  setItem: (key, value) => Storage.setItem(key, value),
  removeItem: async (key) => {
    await Storage.removeItem(key);
  },
};

type AppContextValue = {
  ready: boolean;
  language: Language;
  setLanguage(language: Language): Promise<void>;
  t(key: TranslationKey): string;
  resetAllData(): Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function deviceLanguage(): Language {
  return pickInitialLanguage(getLocales().map((locale) => locale.languageCode));
}

export function AppProvider({ children, store = deviceStore }: { children: ReactNode; store?: KeyValueStore }) {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<Language>('sq');

  useEffect(() => {
    loadSettings(store).then((settings) => {
      setLanguageState(settings?.language ?? deviceLanguage());
      setReady(true);
    });
  }, [store]);

  const setLanguage = useCallback(
    async (next: Language) => {
      setLanguageState(next);
      await saveSettings(store, { language: next });
    },
    [store],
  );

  const resetAllData = useCallback(async () => {
    await deleteAllData(store);
    setLanguageState(deviceLanguage());
  }, [store]);

  const value = useMemo<AppContextValue>(
    () => ({ ready, language, setLanguage, t: (key) => translate(language, key), resetAllData }),
    [ready, language, setLanguage, resetAllData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

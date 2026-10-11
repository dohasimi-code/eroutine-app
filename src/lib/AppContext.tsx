import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { pickInitialLanguage, translate, type Language, type TranslationKey, type TranslationParams } from '../i18n';
import {
  fitsProfile,
  generateWeek,
  getRecipe,
  loadWeek,
  replaceSlot,
  saveWeek,
  seededRandom,
  toggleLock as toggleSlotLock,
  type DinnerStyle,
  type Meal,
  type Slot,
  type WeekMenu,
} from './menu';
import { loadProfile, saveProfile as persistProfile, type FamilyProfile } from './profile';
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
  t(key: TranslationKey, params?: TranslationParams): string;
  // null until the first-run questions are finished (or skipped).
  profile: FamilyProfile | null;
  saveProfile(profile: FamilyProfile): Promise<void>;
  week: WeekMenu | null;
  newWeek(dinnerStyle?: DinnerStyle): Promise<void>;
  setSlot(dayIndex: number, meal: Meal, slot: Slot): Promise<void>;
  toggleLock(dayIndex: number, meal: Meal): Promise<void>;
  resetAllData(): Promise<void>;
};

const freshRandom = () => seededRandom(Date.now());

// After the profile changes, a locked meal survives only if it still fits the family.
function dropLocksThatNoLongerFit(week: WeekMenu, profile: FamilyProfile): WeekMenu {
  return {
    ...week,
    days: week.days.map((day) => {
      const next = { ...day };
      for (const meal of ['breakfast', 'lunch', 'dinner'] as const) {
        const slot = day[meal];
        if (slot.kind === 'recipe' && slot.locked) {
          const recipe = getRecipe(slot.recipeId);
          if (!recipe || !fitsProfile(recipe, profile, { ignoreTime: true })) next[meal] = { ...slot, locked: false };
        }
      }
      return next;
    }),
  };
}

const AppContext = createContext<AppContextValue | null>(null);

function deviceLanguage(): Language {
  return pickInitialLanguage(getLocales().map((locale) => locale.languageCode));
}

export function AppProvider({ children, store = deviceStore }: { children: ReactNode; store?: KeyValueStore }) {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<Language>('sq');
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [week, setWeek] = useState<WeekMenu | null>(null);

  const storeWeek = useCallback(
    async (next: WeekMenu) => {
      setWeek(next);
      await saveWeek(store, next);
    },
    [store],
  );

  useEffect(() => {
    Promise.all([loadSettings(store), loadProfile(store), loadWeek(store)]).then(async ([settings, savedProfile, savedWeek]) => {
      setLanguageState(settings?.language ?? deviceLanguage());
      setProfile(savedProfile);
      if (savedProfile && !savedWeek) await storeWeek(generateWeek(savedProfile, 'mixed', freshRandom()));
      else setWeek(savedWeek);
      setReady(true);
    });
  }, [store, storeWeek]);

  const setLanguage = useCallback(
    async (next: Language) => {
      setLanguageState(next);
      await saveSettings(store, { language: next });
    },
    [store],
  );

  const saveProfile = useCallback(
    async (next: FamilyProfile) => {
      await persistProfile(store, next);
      setProfile(next);
      // The menu follows the new profile straight away; locked meals stay if they still fit.
      const previous = week ? dropLocksThatNoLongerFit(week, next) : undefined;
      await storeWeek(generateWeek(next, week?.dinnerStyle ?? 'mixed', freshRandom(), previous));
    },
    [store, week, storeWeek],
  );

  const newWeek = useCallback(
    async (dinnerStyle?: DinnerStyle) => {
      if (!profile) return;
      await storeWeek(generateWeek(profile, dinnerStyle ?? week?.dinnerStyle ?? 'mixed', freshRandom(), week ?? undefined));
    },
    [profile, week, storeWeek],
  );

  const setSlot = useCallback(
    async (dayIndex: number, meal: Meal, slot: Slot) => {
      if (week) await storeWeek(replaceSlot(week, dayIndex, meal, slot));
    },
    [week, storeWeek],
  );

  const toggleLock = useCallback(
    async (dayIndex: number, meal: Meal) => {
      if (week) await storeWeek(toggleSlotLock(week, dayIndex, meal));
    },
    [week, storeWeek],
  );

  const resetAllData = useCallback(async () => {
    await deleteAllData(store);
    setLanguageState(deviceLanguage());
    setProfile(null);
    setWeek(null);
  }, [store]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      language,
      setLanguage,
      t: (key, params) => translate(language, key, params),
      profile,
      saveProfile,
      week,
      newWeek,
      setSlot,
      toggleLock,
      resetAllData,
    }),
    [ready, language, setLanguage, profile, saveProfile, week, newWeek, setSlot, toggleLock, resetAllData],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

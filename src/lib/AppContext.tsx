import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { IngredientId } from '../data/ingredients';
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
import {
  NEW_PROGRESS,
  completeDay,
  loadJournal,
  loadProgress,
  newEntry,
  saveJournal,
  saveProgress,
  type JournalEntry,
  type PlanProgress,
} from './moment';
import { loadProfile, saveProfile as persistProfile, type FamilyProfile } from './profile';
import { cancelAllReminders, requestReminderPermission, syncReminders } from './reminders';
import { hasReminder, loadRoutines, saveRoutines, upsertRoutine, validateRoutine, type Routine } from './routines';
import {
  EMPTY_LIST_STATE,
  loadListState,
  loadPrices,
  saveListState,
  savePrices,
  todayIso,
  toggleIn,
  type ListState,
  type Price,
  type PriceBook,
} from './shopping';
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
  prices: PriceBook;
  setPrice(id: IngredientId, price: Price | null): Promise<void>;
  listState: ListState;
  toggleAtHome(key: string): Promise<void>;
  toggleBought(key: string): Promise<void>;
  progress: PlanProgress;
  completeToday(): Promise<void>;
  restartPlan(): Promise<void>;
  journal: JournalEntry[];
  addJournalEntry(text: string): Promise<boolean>;
  deleteJournalEntry(id: string): Promise<void>;
  routines: Routine[];
  // "blocked": saved, but the phone does not allow notifications, so no reminder will show.
  saveRoutine(routine: Routine): Promise<'saved' | 'blocked' | 'invalid'>;
  toggleRoutine(id: string): Promise<'saved' | 'blocked' | 'invalid'>;
  deleteRoutine(id: string): Promise<void>;
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
  const [prices, setPrices] = useState<PriceBook>({});
  const [listState, setListState] = useState<ListState>(EMPTY_LIST_STATE);
  const [progress, setProgress] = useState<PlanProgress>(NEW_PROGRESS);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const storeWeek = useCallback(
    async (next: WeekMenu) => {
      setWeek(next);
      await saveWeek(store, next);
    },
    [store],
  );

  const storeListState = useCallback(
    async (next: ListState) => {
      setListState(next);
      await saveListState(store, next);
    },
    [store],
  );

  // A new week means a new shopping trip: ticks start over, prices stay.
  const storeNewWeek = useCallback(
    async (next: WeekMenu) => {
      await storeWeek(next);
      await storeListState(EMPTY_LIST_STATE);
    },
    [storeWeek, storeListState],
  );

  useEffect(() => {
    Promise.all([
      loadSettings(store),
      loadProfile(store),
      loadWeek(store),
      loadPrices(store),
      loadListState(store),
      loadProgress(store),
      loadJournal(store),
      loadRoutines(store),
    ]).then(
      async ([settings, savedProfile, savedWeek, savedPrices, savedListState, savedProgress, savedJournal, savedRoutines]) => {
        setLanguageState(settings?.language ?? deviceLanguage());
        setProfile(savedProfile);
        setPrices(savedPrices);
        setListState(savedListState);
        setProgress(savedProgress);
        setJournal(savedJournal);
        setRoutines(savedRoutines);
        if (savedProfile && !savedWeek) await storeNewWeek(generateWeek(savedProfile, 'mixed', freshRandom()));
        else setWeek(savedWeek);
        setReady(true);
      },
    );
  }, [store, storeNewWeek]);

  const setLanguage = useCallback(
    async (next: Language) => {
      setLanguageState(next);
      await saveSettings(store, { language: next });
      // Reminder texts follow the app language.
      await syncReminders(routines, next, translate(next, 'routine.channel'));
    },
    [store, routines],
  );

  const saveProfile = useCallback(
    async (next: FamilyProfile) => {
      await persistProfile(store, next);
      setProfile(next);
      // The menu follows the new profile straight away; locked meals stay if they still fit.
      const previous = week ? dropLocksThatNoLongerFit(week, next) : undefined;
      await storeNewWeek(generateWeek(next, week?.dinnerStyle ?? 'mixed', freshRandom(), previous));
    },
    [store, week, storeNewWeek],
  );

  const newWeek = useCallback(
    async (dinnerStyle?: DinnerStyle) => {
      if (!profile) return;
      await storeNewWeek(generateWeek(profile, dinnerStyle ?? week?.dinnerStyle ?? 'mixed', freshRandom(), week ?? undefined));
    },
    [profile, week, storeNewWeek],
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

  const setPrice = useCallback(
    async (id: IngredientId, price: Price | null) => {
      const next = { ...prices };
      if (price) next[id] = price;
      else delete next[id];
      setPrices(next);
      await savePrices(store, next);
    },
    [store, prices],
  );

  const toggleAtHome = useCallback(
    (key: string) => storeListState({ ...listState, atHome: toggleIn(listState.atHome, key) }),
    [listState, storeListState],
  );

  const toggleBought = useCallback(
    (key: string) => storeListState({ ...listState, bought: toggleIn(listState.bought, key) }),
    [listState, storeListState],
  );

  const storeProgress = useCallback(
    async (next: PlanProgress) => {
      setProgress(next);
      await saveProgress(store, next);
    },
    [store],
  );

  const completeToday = useCallback(() => storeProgress(completeDay(progress, todayIso())), [progress, storeProgress]);

  const restartPlan = useCallback(() => storeProgress(NEW_PROGRESS), [storeProgress]);

  const addJournalEntry = useCallback(
    async (text: string) => {
      const entry = newEntry(text, new Date());
      if (!entry) return false;
      const next = [entry, ...journal];
      setJournal(next);
      await saveJournal(store, next);
      return true;
    },
    [store, journal],
  );

  const deleteJournalEntry = useCallback(
    async (id: string) => {
      const next = journal.filter((entry) => entry.id !== id);
      setJournal(next);
      await saveJournal(store, next);
    },
    [store, journal],
  );

  const storeRoutines = useCallback(
    async (next: Routine[]) => {
      setRoutines(next);
      await saveRoutines(store, next);
      await syncReminders(next, language, translate(language, 'routine.channel'));
    },
    [store, language],
  );

  const saveRoutine = useCallback(
    async (routine: Routine) => {
      const valid = validateRoutine(routine);
      if (!valid) return 'invalid' as const;
      const allowed = hasReminder(valid) ? await requestReminderPermission(translate(language, 'routine.channel')) : true;
      await storeRoutines(upsertRoutine(routines, valid));
      return allowed ? ('saved' as const) : ('blocked' as const);
    },
    [routines, language, storeRoutines],
  );

  const toggleRoutine = useCallback(
    async (id: string) => {
      const routine = routines.find((r) => r.id === id);
      return routine ? saveRoutine({ ...routine, active: !routine.active }) : ('invalid' as const);
    },
    [routines, saveRoutine],
  );

  const deleteRoutine = useCallback((id: string) => storeRoutines(routines.filter((r) => r.id !== id)), [routines, storeRoutines]);

  const resetAllData = useCallback(async () => {
    await cancelAllReminders();
    await deleteAllData(store);
    setLanguageState(deviceLanguage());
    setProfile(null);
    setWeek(null);
    setPrices({});
    setListState(EMPTY_LIST_STATE);
    setProgress(NEW_PROGRESS);
    setJournal([]);
    setRoutines([]);
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
      prices,
      setPrice,
      listState,
      toggleAtHome,
      toggleBought,
      progress,
      completeToday,
      restartPlan,
      journal,
      addJournalEntry,
      deleteJournalEntry,
      routines,
      saveRoutine,
      toggleRoutine,
      deleteRoutine,
      resetAllData,
    }),
    [
      ready,
      language,
      setLanguage,
      profile,
      saveProfile,
      week,
      newWeek,
      setSlot,
      toggleLock,
      prices,
      setPrice,
      listState,
      toggleAtHome,
      toggleBought,
      progress,
      completeToday,
      restartPlan,
      journal,
      addJournalEntry,
      deleteJournalEntry,
      routines,
      saveRoutine,
      toggleRoutine,
      deleteRoutine,
      resetAllData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

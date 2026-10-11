import { KJV } from '../../data/kjv';
import { BOOKS, MEAL_PRAYERS, PLAN } from '../../data/plan';
import {
  NEW_PROGRESS,
  canShowKjv,
  completeDay,
  currentDayIndex,
  doneToday,
  formatReference,
  isPlanFinished,
  isWelcomeBack,
  kjvVerses,
  loadJournal,
  loadProgress,
  newEntry,
  passageKey,
  saveJournal,
  saveProgress,
} from '../moment';
import { STORAGE_KEYS, createMemoryStore, deleteAllData } from '../storage';

describe('reading plan content', () => {
  it('has 30 days, each with text in both languages', () => {
    expect(PLAN).toHaveLength(30);
    for (const day of PLAN) {
      for (const field of [day.theme, day.reflection, day.prayer]) {
        expect(field.sq.trim()).not.toBe('');
        expect(field.en.trim()).not.toBe('');
      }
      expect(day.passage.from).toBeLessThanOrEqual(day.passage.to);
      expect(BOOKS[day.passage.book]).toBeDefined();
    }
    expect(MEAL_PRAYERS).toHaveLength(7);
  });

  it('bundles KJV text for exactly the passages in the plan, verse for verse', () => {
    expect(Object.keys(KJV).sort()).toEqual(PLAN.map((day) => passageKey(day.passage)).sort());
    for (const day of PLAN) {
      const verses = kjvVerses(day.passage)!;
      expect(verses).toHaveLength(day.passage.to - day.passage.from + 1);
      expect(verses.every((verse) => verse.length > 0)).toBe(true);
    }
    expect(kjvVerses(PLAN[0].passage)![0]).toBe('The LORD is my shepherd; I shall not want.');
  });

  it('formats references in each language', () => {
    expect(formatReference(PLAN[0].passage, 'sq')).toBe('Psalmi 23:1-6');
    expect(formatReference(PLAN[0].passage, 'en')).toBe('Psalm 23:1-6');
    expect(formatReference({ book: 'isaiah', chapter: 41, from: 10, to: 10 }, 'sq')).toBe('Isaia 41:10');
  });
});

describe('canShowKjv', () => {
  it('shows the KJV only in English and never in the UK', () => {
    expect(canShowKjv('en', 'US')).toBe(true);
    expect(canShowKjv('en', 'AL')).toBe(true);
    expect(canShowKjv('en', null)).toBe(true);
    expect(canShowKjv('en', 'GB')).toBe(false);
    expect(canShowKjv('en', 'gb')).toBe(false);
    expect(canShowKjv('sq', 'AL')).toBe(false);
  });
});

describe('plan progress', () => {
  it('moves forward one day at a time and stops at the end', () => {
    let progress = NEW_PROGRESS;
    expect(currentDayIndex(progress)).toBe(0);
    progress = completeDay(progress, '2026-10-11');
    expect(progress).toEqual({ done: 1, lastDoneDate: '2026-10-11' });
    expect(currentDayIndex(progress)).toBe(1);
    expect(doneToday(progress, '2026-10-11')).toBe(true);
    expect(doneToday(progress, '2026-10-12')).toBe(false);

    for (let i = 0; i < 40; i++) progress = completeDay(progress, '2026-10-12');
    expect(progress.done).toBe(30);
    expect(isPlanFinished(progress)).toBe(true);
    expect(currentDayIndex(progress)).toBe(29);
  });

  it('welcomes her back after a few days away, without counting missed days', () => {
    const progress = { done: 4, lastDoneDate: '2026-10-01' };
    expect(isWelcomeBack(progress, '2026-10-02')).toBe(false);
    expect(isWelcomeBack(progress, '2026-10-04')).toBe(true);
    expect(isWelcomeBack(NEW_PROGRESS, '2026-10-04')).toBe(false);
    // Coming back does not move the plan: she continues where she stopped.
    expect(currentDayIndex(progress)).toBe(4);
  });

  it('saves progress and repairs bad saved values', async () => {
    const store = createMemoryStore();
    expect(await loadProgress(store)).toEqual(NEW_PROGRESS);
    await saveProgress(store, { done: 3, lastDoneDate: '2026-10-11' });
    expect(await loadProgress(store)).toEqual({ done: 3, lastDoneDate: '2026-10-11' });
    await store.setItem(STORAGE_KEYS.plan, JSON.stringify({ done: 99, lastDoneDate: 'yesterday' }));
    expect(await loadProgress(store)).toEqual({ done: 30 });
    await store.setItem(STORAGE_KEYS.plan, '{');
    expect(await loadProgress(store)).toEqual(NEW_PROGRESS);
  });
});

describe('journal', () => {
  it('ignores empty notes and trims text', () => {
    const now = new Date('2026-10-11T08:30:00Z');
    expect(newEntry('   ', now)).toBeNull();
    expect(newEntry('  Faleminderit për sot.  ', now)).toEqual(
      expect.objectContaining({ text: 'Faleminderit për sot.', createdAt: '2026-10-11T08:30:00.000Z' }),
    );
  });

  it('keeps notes only on the device and deletes them with all data', async () => {
    const store = createMemoryStore();
    const entry = newEntry('Lutje për nënën time', new Date('2026-10-11T08:30:00Z'))!;
    await saveJournal(store, [entry]);
    expect(await loadJournal(store)).toEqual([entry]);

    await store.setItem(STORAGE_KEYS.journal, JSON.stringify([entry, { id: 1 }, { id: 'x', text: '', createdAt: 'no' }]));
    expect(await loadJournal(store)).toEqual([entry]);

    await deleteAllData(store);
    expect(store.dump()).toEqual({});
  });
});

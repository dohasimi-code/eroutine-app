import {
  PHRASE_IDS,
  REMINDER_PHRASES,
  blankRoutine,
  formatTime,
  hasReminder,
  loadRoutines,
  saveRoutines,
  toExpoWeekday,
  triggersFor,
  upsertRoutine,
  validateRoutine,
  type Routine,
} from '../routines';
import { STORAGE_KEYS, createMemoryStore, deleteAllData } from '../storage';

const routine = (patch: Partial<Routine> = {}): Routine => ({
  id: 'r1',
  name: 'Lutja e mëngjesit',
  days: { kind: 'every' },
  reminder: null,
  active: true,
  ...patch,
});

describe('routines', () => {
  it('start without a reminder', () => {
    const fresh = blankRoutine('Psalm para gjumit');
    expect(fresh.reminder).toBeNull();
    expect(fresh.active).toBe(true);
    expect(hasReminder(fresh)).toBe(false);
  });

  it('map Monday-first weekdays to Expo weekdays (1 = Sunday)', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(toExpoWeekday)).toEqual([2, 3, 4, 5, 6, 7, 1]);
  });

  it('schedule one daily trigger, one weekly trigger per day, or none', () => {
    const reminder = { hour: 7, minute: 30, phrase: 'minute' } as const;
    expect(triggersFor(routine({ reminder }))).toEqual([{ type: 'daily', hour: 7, minute: 30 }]);
    expect(triggersFor(routine({ reminder, days: { kind: 'some', weekdays: [6, 0] } }))).toEqual([
      { type: 'weekly', weekday: 2, hour: 7, minute: 30 },
      { type: 'weekly', weekday: 1, hour: 7, minute: 30 },
    ]);
    expect(triggersFor(routine({ reminder, active: false }))).toEqual([]);
    expect(triggersFor(routine({ reminder, days: { kind: 'whenever' } }))).toEqual([]);
    expect(triggersFor(routine())).toEqual([]);
  });

  it('clean up what she typed before saving', () => {
    expect(validateRoutine(routine({ name: '   ' }))).toBeNull();
    expect(validateRoutine(routine({ name: '  Falënderim  ' }))!.name).toBe('Falënderim');
    // Picking no days means no fixed days, and then there is no reminder.
    expect(validateRoutine(routine({ days: { kind: 'some', weekdays: [] }, reminder: { hour: 8, minute: 0, phrase: 'enough' } }))).toEqual(
      expect.objectContaining({ days: { kind: 'whenever' }, reminder: null }),
    );
    expect(validateRoutine(routine({ days: { kind: 'some', weekdays: [0, 1, 2, 3, 4, 5, 6] } }))!.days).toEqual({ kind: 'every' });
    expect(validateRoutine(routine({ days: { kind: 'some', weekdays: [3, 3, 9, 1] } }))!.days).toEqual({ kind: 'some', weekdays: [1, 3] });
  });

  it('have gentle phrases in both languages', () => {
    for (const id of PHRASE_IDS) {
      expect(REMINDER_PHRASES[id].sq).not.toBe('');
      expect(REMINDER_PHRASES[id].en).not.toBe('');
    }
    expect(formatTime(7, 5)).toBe('07:05');
  });

  it('add or replace a routine by id', () => {
    const list = upsertRoutine([], routine());
    expect(list).toHaveLength(1);
    expect(upsertRoutine(list, routine({ name: 'Tjetër' }))).toEqual([routine({ name: 'Tjetër' })]);
    expect(upsertRoutine(list, routine({ id: 'r2' }))).toHaveLength(2);
  });

  it('are saved on the phone, repaired on load, and deleted with all data', async () => {
    const store = createMemoryStore();
    const saved = routine({ reminder: { hour: 21, minute: 0, phrase: 'breathe' } });
    await saveRoutines(store, [saved]);
    expect(await loadRoutines(store)).toEqual([saved]);

    await store.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify([
        saved,
        { id: 'bad' },
        routine({ id: 'r3', reminder: { hour: 99, minute: 0, phrase: 'minute' } }),
        routine({ id: 'r4', reminder: { hour: 8, minute: 0, phrase: 'unknown' as 'minute' } }),
      ]),
    );
    const loaded = await loadRoutines(store);
    expect(loaded.map((r) => r.id)).toEqual(['r1', 'r3', 'r4']);
    expect(loaded[1].reminder).toBeNull();
    expect(loaded[2].reminder).toBeNull();

    await store.setItem(STORAGE_KEYS.routines, 'oops');
    expect(await loadRoutines(store)).toEqual([]);

    await deleteAllData(store);
    expect(store.dump()).toEqual({});
  });
});

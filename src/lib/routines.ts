import type { Localized } from '../data/types';
import { STORAGE_KEYS, type KeyValueStore } from './storage';

// Gentle reminder texts (design doc 04, tone table). Never "you missed", never commands.
export const REMINDER_PHRASES = {
  minute: { sq: 'Një minutë për ty, kur të jesh gati.', en: 'A minute for you, whenever you are ready.' },
  breathe: { sq: 'Merr frymë. Zoti është këtu.', en: 'Take a breath. God is here.' },
  enough: { sq: 'Edhe pak mjafton.', en: 'Even a little is enough.' },
  thanks: { sq: 'Një falënderim i vogël për sot?', en: 'A small thank-you for today?' },
} satisfies Record<string, Localized>;

export type PhraseId = keyof typeof REMINDER_PHRASES;
export const PHRASE_IDS = Object.keys(REMINDER_PHRASES) as PhraseId[];

// "every": every day; "some": chosen weekdays (Monday = 0 … Sunday = 6); "whenever": no fixed days.
export type RoutineDays = { kind: 'every' } | { kind: 'some'; weekdays: number[] } | { kind: 'whenever' };

export type Reminder = { hour: number; minute: number; phrase: PhraseId };

export type Routine = {
  id: string;
  name: string;
  days: RoutineDays;
  // Off unless she turns it on (MVP feature 10).
  reminder: Reminder | null;
  active: boolean;
};

export const MAX_NAME_LENGTH = 60;

export const ROUTINE_TEMPLATES: Localized[] = [
  { sq: 'Lutja e mëngjesit', en: 'Morning prayer' },
  { sq: 'Psalm para gjumit', en: 'A psalm before sleep' },
  { sq: 'Falënderim në tryezë', en: 'Thanks at the table' },
];

export function newRoutineId(now = Date.now()): string {
  return `r${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function blankRoutine(name = ''): Routine {
  return { id: newRoutineId(), name, days: { kind: 'every' }, reminder: null, active: true };
}

// A routine with no fixed days cannot have a timed reminder.
export function hasReminder(routine: Routine): routine is Routine & { reminder: Reminder } {
  return routine.active && routine.reminder !== null && routine.days.kind !== 'whenever';
}

// Expo's weekly trigger counts weekdays from 1 = Sunday; we count from 0 = Monday.
export function toExpoWeekday(weekday: number): number {
  return ((weekday + 1) % 7) + 1;
}

export type ReminderTrigger =
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number };

export function triggersFor(routine: Routine): ReminderTrigger[] {
  if (!hasReminder(routine)) return [];
  const { hour, minute } = routine.reminder;
  if (routine.days.kind === 'every') return [{ type: 'daily', hour, minute }];
  if (routine.days.kind === 'some') {
    return [...routine.days.weekdays].sort((a, b) => a - b).map((weekday) => ({ type: 'weekly', weekday: toExpoWeekday(weekday), hour, minute }));
  }
  return [];
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function validateRoutine(routine: Routine): Routine | null {
  const name = routine.name.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) return null;
  let days = routine.days;
  if (days.kind === 'some') {
    const weekdays = [...new Set(days.weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
    // No day picked means she has not fixed days: treat it as "whenever".
    days = weekdays.length === 7 ? { kind: 'every' } : weekdays.length ? { kind: 'some', weekdays } : { kind: 'whenever' };
  }
  const reminder = days.kind === 'whenever' ? null : routine.reminder;
  return { ...routine, name, days, reminder };
}

function isReminder(value: unknown): value is Reminder {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    Number.isInteger(r.hour) &&
    (r.hour as number) >= 0 &&
    (r.hour as number) <= 23 &&
    Number.isInteger(r.minute) &&
    (r.minute as number) >= 0 &&
    (r.minute as number) <= 59 &&
    typeof r.phrase === 'string' &&
    r.phrase in REMINDER_PHRASES
  );
}

function parseRoutine(value: unknown): Routine | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string' || typeof r.active !== 'boolean') return null;
  const days = r.days as Record<string, unknown> | undefined;
  let parsedDays: RoutineDays;
  if (days?.kind === 'every' || days?.kind === 'whenever') parsedDays = { kind: days.kind };
  else if (days?.kind === 'some' && Array.isArray(days.weekdays)) parsedDays = { kind: 'some', weekdays: days.weekdays as number[] };
  else return null;
  const reminder = r.reminder === null || r.reminder === undefined ? null : isReminder(r.reminder) ? r.reminder : null;
  return validateRoutine({ id: r.id, name: r.name, days: parsedDays, reminder, active: r.active });
}

export async function loadRoutines(store: KeyValueStore): Promise<Routine[]> {
  const raw = await store.getItem(STORAGE_KEYS.routines);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseRoutine).filter((routine): routine is Routine => routine !== null);
  } catch {
    return [];
  }
}

export async function saveRoutines(store: KeyValueStore, routines: Routine[]): Promise<void> {
  await store.setItem(STORAGE_KEYS.routines, JSON.stringify(routines));
}

export function upsertRoutine(routines: Routine[], routine: Routine): Routine[] {
  return routines.some((r) => r.id === routine.id) ? routines.map((r) => (r.id === routine.id ? routine : r)) : [...routines, routine];
}

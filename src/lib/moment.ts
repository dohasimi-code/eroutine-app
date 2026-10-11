import { KJV } from '../data/kjv';
import { BOOKS, PLAN, type Passage } from '../data/plan';
import type { Language } from '../i18n';
import { STORAGE_KEYS, type KeyValueStore } from './storage';

export function passageKey(passage: Passage): string {
  return `${passage.book} ${passage.chapter}:${passage.from}-${passage.to}`;
}

export function formatReference(passage: Passage, language: Language): string {
  const verses = passage.from === passage.to ? `${passage.from}` : `${passage.from}-${passage.to}`;
  return `${BOOKS[passage.book][language]} ${passage.chapter}:${verses}`;
}

export function kjvVerses(passage: Passage): string[] | undefined {
  return KJV[passageKey(passage)];
}

// KJV text is shown only in English (V18: no Bible text in Albanian) and never to devices
// set to the United Kingdom, where the KJV is under Crown letters patent.
export function canShowKjv(language: Language, regionCode: string | null | undefined): boolean {
  return language === 'en' && regionCode?.toUpperCase() !== 'GB';
}

// ───────────── Plan progress ─────────────
// No calendar and no "missed days": the plan simply continues where she left off.

export type PlanProgress = { done: number; lastDoneDate?: string };

export const NEW_PROGRESS: PlanProgress = { done: 0 };

export const planLength = () => PLAN.length;

export function currentDayIndex(progress: PlanProgress): number {
  return Math.min(progress.done, PLAN.length - 1);
}

export const isPlanFinished = (progress: PlanProgress) => progress.done >= PLAN.length;

export const doneToday = (progress: PlanProgress, today: string) => progress.lastDoneDate === today;

export function completeDay(progress: PlanProgress, today: string): PlanProgress {
  return { done: Math.min(progress.done + 1, PLAN.length), lastDoneDate: today };
}

function daysBetween(fromIso: string, toIso: string): number {
  const [a, b] = [fromIso, toIso].map((iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86_400_000);
}

// After a few days away she is welcomed back, never reminded of what she "missed".
export function isWelcomeBack(progress: PlanProgress, today: string): boolean {
  return progress.lastDoneDate !== undefined && daysBetween(progress.lastDoneDate, today) >= 3;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function loadProgress(store: KeyValueStore): Promise<PlanProgress> {
  const raw = await store.getItem(STORAGE_KEYS.plan);
  if (!raw) return NEW_PROGRESS;
  try {
    const parsed = JSON.parse(raw) as Partial<PlanProgress>;
    const done = typeof parsed.done === 'number' && Number.isInteger(parsed.done) ? Math.max(0, Math.min(parsed.done, PLAN.length)) : 0;
    const lastDoneDate = typeof parsed.lastDoneDate === 'string' && ISO_DATE.test(parsed.lastDoneDate) ? parsed.lastDoneDate : undefined;
    return lastDoneDate ? { done, lastDoneDate } : { done };
  } catch {
    return NEW_PROGRESS;
  }
}

export async function saveProgress(store: KeyValueStore, progress: PlanProgress): Promise<void> {
  await store.setItem(STORAGE_KEYS.plan, JSON.stringify(progress));
}

// ───────────── Private journal ─────────────

export type JournalEntry = { id: string; createdAt: string; text: string };

export const MAX_ENTRY_LENGTH = 4000;

export function newEntry(text: string, now: Date): JournalEntry | null {
  const trimmed = text.trim().slice(0, MAX_ENTRY_LENGTH);
  if (!trimmed) return null;
  return { id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now.toISOString(), text: trimmed };
}

function isEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.text === 'string' &&
    entry.text.length > 0 &&
    typeof entry.createdAt === 'string' &&
    !Number.isNaN(Date.parse(entry.createdAt))
  );
}

// Newest first.
export async function loadJournal(store: KeyValueStore): Promise<JournalEntry[]> {
  const raw = await store.getItem(STORAGE_KEYS.journal);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export async function saveJournal(store: KeyValueStore, entries: JournalEntry[]): Promise<void> {
  await store.setItem(STORAGE_KEYS.journal, JSON.stringify(entries));
}

export function formatEntryDate(iso: string, language: Language): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = language === 'sq' ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

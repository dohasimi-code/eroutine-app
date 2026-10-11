import { STORAGE_KEYS, type KeyValueStore } from './storage';

export const COOK_TIME_OPTIONS = [15, 30, 45, 60] as const;
export type CookTime = (typeof COOK_TIME_OPTIONS)[number];

export const BUDGET_OPTIONS = ['saver', 'medium'] as const;
export type Budget = (typeof BUDGET_OPTIONS)[number];

// Things a family may want left out. Recipes are tagged with the same ids.
export const EXCLUSION_OPTIONS = ['gluten', 'dairy', 'eggs', 'fish', 'nuts', 'pork', 'meat'] as const;
export type Exclusion = (typeof EXCLUSION_OPTIONS)[number];

export const MIN_PEOPLE = 1;
export const MAX_PEOPLE = 10;

export type FamilyProfile = {
  people: number;
  maxCookMinutes: CookTime;
  budget: Budget;
  exclusions: Exclusion[];
  faithMoment: boolean;
};

// Every onboarding question can be skipped, so these defaults must always produce a usable menu.
export const DEFAULT_PROFILE: FamilyProfile = {
  people: 4,
  maxCookMinutes: 30,
  budget: 'saver',
  exclusions: [],
  faithMoment: true,
};

export function clampPeople(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PROFILE.people;
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Math.round(value)));
}

// Accepts anything read back from storage and returns a valid profile, filling gaps with defaults.
export function normalizeProfile(input: unknown): FamilyProfile {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const cook = COOK_TIME_OPTIONS.find((option) => option === raw.maxCookMinutes);
  const budget = BUDGET_OPTIONS.find((option) => option === raw.budget);
  const exclusions = Array.isArray(raw.exclusions)
    ? EXCLUSION_OPTIONS.filter((option) => (raw.exclusions as unknown[]).includes(option))
    : [];
  return {
    people: typeof raw.people === 'number' ? clampPeople(raw.people) : DEFAULT_PROFILE.people,
    maxCookMinutes: cook ?? DEFAULT_PROFILE.maxCookMinutes,
    budget: budget ?? DEFAULT_PROFILE.budget,
    exclusions,
    faithMoment: typeof raw.faithMoment === 'boolean' ? raw.faithMoment : DEFAULT_PROFILE.faithMoment,
  };
}

export function toggleExclusion(exclusions: Exclusion[], item: Exclusion): Exclusion[] {
  const next = exclusions.includes(item) ? exclusions.filter((e) => e !== item) : [...exclusions, item];
  return EXCLUSION_OPTIONS.filter((option) => next.includes(option));
}

export async function loadProfile(store: KeyValueStore): Promise<FamilyProfile | null> {
  const raw = await store.getItem(STORAGE_KEYS.profile);
  if (!raw) return null;
  try {
    return normalizeProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveProfile(store: KeyValueStore, profile: FamilyProfile): Promise<void> {
  await store.setItem(STORAGE_KEYS.profile, JSON.stringify(normalizeProfile(profile)));
}

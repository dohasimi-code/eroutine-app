import {
  DEFAULT_PROFILE,
  MAX_PEOPLE,
  clampPeople,
  loadProfile,
  normalizeProfile,
  saveProfile,
  toggleExclusion,
} from '../profile';
import { STORAGE_KEYS, createMemoryStore, deleteAllData } from '../storage';

describe('family profile', () => {
  it('skipping every question still gives a complete profile', () => {
    expect(normalizeProfile({})).toEqual(DEFAULT_PROFILE);
    expect(normalizeProfile(null)).toEqual(DEFAULT_PROFILE);
  });

  it('keeps valid answers', () => {
    const profile = { people: 6, maxCookMinutes: 15, budget: 'medium', exclusions: ['eggs', 'gluten'], faithMoment: false };
    expect(normalizeProfile(profile)).toEqual({ ...profile, exclusions: ['gluten', 'eggs'] });
  });

  it('drops unknown values instead of trusting them', () => {
    expect(normalizeProfile({ maxCookMinutes: 999, budget: 'luxury', exclusions: ['gluten', 'chocolate'] })).toEqual({
      ...DEFAULT_PROFILE,
      exclusions: ['gluten'],
    });
  });

  it('keeps the number of people in a sensible range', () => {
    expect(clampPeople(0)).toBe(1);
    expect(clampPeople(50)).toBe(MAX_PEOPLE);
    expect(clampPeople(3.6)).toBe(4);
    expect(clampPeople(NaN)).toBe(DEFAULT_PROFILE.people);
  });

  it('toggles an exclusion on and off', () => {
    expect(toggleExclusion([], 'fish')).toEqual(['fish']);
    expect(toggleExclusion(['fish', 'nuts'], 'fish')).toEqual(['nuts']);
  });

  it('is saved, read back, and removed by "delete all my data"', async () => {
    const store = createMemoryStore();
    expect(await loadProfile(store)).toBeNull();
    await saveProfile(store, { ...DEFAULT_PROFILE, people: 3 });
    expect((await loadProfile(store))?.people).toBe(3);
    await deleteAllData(store);
    expect(store.dump()[STORAGE_KEYS.profile]).toBeUndefined();
  });
});

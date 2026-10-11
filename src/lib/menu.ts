import { INGREDIENTS, type IngredientId } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import type { Recipe, Tag } from '../data/types';
import type { Exclusion, FamilyProfile } from './profile';
import { STORAGE_KEYS, type KeyValueStore } from './storage';

export const MEALS = ['breakfast', 'lunch', 'dinner'] as const;
export type Meal = (typeof MEALS)[number];

// How dinners are planned. No style is the "right" one; families differ.
export const DINNER_STYLES = ['mixed', 'light', 'like-lunch', 'leftovers'] as const;
export type DinnerStyle = (typeof DINNER_STYLES)[number];

export type Slot =
  | { kind: 'recipe'; recipeId: string; locked: boolean }
  | { kind: 'leftovers'; locked: boolean }
  // Nothing fits the family's filters; the screen explains instead of guessing.
  | { kind: 'empty'; locked: false };

export type DayPlan = Record<Meal, Slot>;

export type WeekMenu = {
  dinnerStyle: DinnerStyle;
  days: DayPlan[]; // Monday first, 7 days
};

const MEAT_TAGS: Tag[] = ['chicken', 'beef', 'lamb', 'pork', 'fish'];
const recipeById = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

export function getRecipe(id: string): Recipe | undefined {
  return recipeById.get(id);
}

// Tags come only from required ingredients, so each variant is labelled by what it really contains.
export function recipeTags(recipe: Recipe): Tag[] {
  const tags = new Set<Tag>();
  for (const item of recipe.ingredients) {
    if (item.optional) continue;
    for (const tag of INGREDIENTS[item.id as IngredientId].tags as Tag[]) tags.add(tag);
  }
  return [...tags];
}

export function totalMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}

function blockedTags(exclusions: Exclusion[]): Set<Tag> {
  const blocked = new Set<Tag>();
  for (const exclusion of exclusions) {
    if (exclusion === 'meat') MEAT_TAGS.forEach((tag) => blocked.add(tag));
    else blocked.add(exclusion);
  }
  return blocked;
}

export function fitsProfile(recipe: Recipe, profile: FamilyProfile, { ignoreTime = false } = {}): boolean {
  const blocked = blockedTags(profile.exclusions);
  if (recipeTags(recipe).some((tag) => blocked.has(tag))) return false;
  if (profile.budget === 'saver' && recipe.budget !== 'saver') return false;
  // 60 is the "45 minutes or more" answer: no time limit.
  if (!ignoreTime && profile.maxCookMinutes < 60 && totalMinutes(recipe) > profile.maxCookMinutes) return false;
  return true;
}

type Candidates = 'breakfast' | 'lunch' | 'light-dinner';

// Safety (exclusions, budget) is never relaxed. Cooking time is relaxed only when nothing
// else fits, because a slower dish is better than an empty slot.
export function candidatesFor(course: Candidates, profile: FamilyProfile): Recipe[] {
  const ofCourse = RECIPES.filter((recipe) => recipe.course === course);
  const strict = ofCourse.filter((recipe) => fitsProfile(recipe, profile));
  return strict.length > 0 ? strict : ofCourse.filter((recipe) => fitsProfile(recipe, profile, { ignoreTime: true }));
}

// Small seeded random generator so a week can be reproduced in tests.
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

// Hands out recipes without repeating until the pool runs out, and avoids serving
// two variants of the same dish on consecutive days.
function makePicker(pool: Recipe[], random: () => number, alreadyUsed: Set<string>) {
  let queue = shuffle(pool.filter((recipe) => !alreadyUsed.has(recipe.id)), random);
  let lastFamily: string | null = null;
  return (): Recipe | null => {
    if (pool.length === 0) return null;
    if (queue.length === 0) queue = shuffle(pool, random);
    let index = queue.findIndex((recipe) => recipe.family !== lastFamily);
    if (index === -1) index = 0;
    const [picked] = queue.splice(index, 1);
    lastFamily = picked.family;
    return picked;
  };
}

function dinnerKindFor(style: DinnerStyle, dayIndex: number): 'light' | 'full' | 'leftovers' {
  if (style === 'light') return 'light';
  if (style === 'like-lunch') return 'full';
  if (style === 'leftovers') return 'leftovers';
  // Mixed: mostly light dinners, with leftovers from lunch twice a week.
  return dayIndex % 3 === 1 ? 'leftovers' : 'light';
}

const recipeSlot = (recipe: Recipe | null): Slot =>
  recipe ? { kind: 'recipe', recipeId: recipe.id, locked: false } : { kind: 'empty', locked: false };

export function generateWeek(
  profile: FamilyProfile,
  dinnerStyle: DinnerStyle,
  random: () => number,
  previous?: WeekMenu,
): WeekMenu {
  // Locked slots from the previous week stay exactly where they were.
  const locked = (day: number, meal: Meal): Slot | null => {
    const slot = previous?.days[day]?.[meal];
    return slot && slot.locked ? slot : null;
  };
  const lockedIds = new Set<string>();
  previous?.days.forEach((day) =>
    MEALS.forEach((meal) => {
      const slot = day[meal];
      if (slot.locked && slot.kind === 'recipe') lockedIds.add(slot.recipeId);
    }),
  );

  const nextBreakfast = makePicker(candidatesFor('breakfast', profile), random, lockedIds);
  const nextLunch = makePicker(candidatesFor('lunch', profile), random, lockedIds);
  const nextLightDinner = makePicker(candidatesFor('light-dinner', profile), random, lockedIds);
  const nextFullDinner = makePicker(candidatesFor('lunch', profile), random, lockedIds);

  const days: DayPlan[] = [];
  for (let day = 0; day < 7; day++) {
    const breakfast = locked(day, 'breakfast') ?? recipeSlot(nextBreakfast());
    const lunch = locked(day, 'lunch') ?? recipeSlot(nextLunch());
    let dinner = locked(day, 'dinner');
    if (!dinner) {
      const kind = dinnerKindFor(dinnerStyle, day);
      if (kind === 'leftovers' && lunch.kind === 'recipe') dinner = { kind: 'leftovers', locked: false };
      else if (kind === 'full') {
        let pick = nextFullDinner();
        // Avoid serving the same dish twice in one day.
        if (pick && lunch.kind === 'recipe' && pick.id === lunch.recipeId) pick = nextFullDinner();
        dinner = recipeSlot(pick);
      }
      else dinner = recipeSlot(nextLightDinner());
    }
    days.push({ breakfast, lunch, dinner });
  }
  return { dinnerStyle, days };
}

// Up to `count` other dishes for one slot, with dishes not yet in the week first.
export function alternativesFor(
  week: WeekMenu,
  dayIndex: number,
  meal: Meal,
  profile: FamilyProfile,
  random: () => number,
  count = 3,
): Recipe[] {
  const current = week.days[dayIndex][meal];
  const currentRecipe = current.kind === 'recipe' ? getRecipe(current.recipeId) : undefined;
  let course: Candidates = meal === 'breakfast' ? 'breakfast' : meal === 'lunch' ? 'lunch' : 'light-dinner';
  if (meal === 'dinner' && currentRecipe?.course === 'lunch') course = 'lunch';

  const inWeek = new Set<string>();
  week.days.forEach((day) =>
    MEALS.forEach((m) => {
      const slot = day[m];
      if (slot.kind === 'recipe') inWeek.add(slot.recipeId);
    }),
  );

  const pool = candidatesFor(course, profile).filter((recipe) => recipe.id !== currentRecipe?.id);
  const fresh = shuffle(pool.filter((recipe) => !inWeek.has(recipe.id)), random);
  const repeats = shuffle(pool.filter((recipe) => inWeek.has(recipe.id)), random);
  return [...fresh, ...repeats].slice(0, count);
}

export function replaceSlot(week: WeekMenu, dayIndex: number, meal: Meal, slot: Slot): WeekMenu {
  return {
    ...week,
    days: week.days.map((day, index) => (index === dayIndex ? { ...day, [meal]: slot } : day)),
  };
}

export function toggleLock(week: WeekMenu, dayIndex: number, meal: Meal): WeekMenu {
  const slot = week.days[dayIndex][meal];
  if (slot.kind === 'empty') return week;
  return replaceSlot(week, dayIndex, meal, { ...slot, locked: !slot.locked });
}

// Monday = 0 … Sunday = 6.
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function isSlot(value: unknown): value is Slot {
  if (!value || typeof value !== 'object') return false;
  const slot = value as Record<string, unknown>;
  if (slot.kind === 'recipe') return typeof slot.recipeId === 'string' && recipeById.has(slot.recipeId);
  return slot.kind === 'leftovers' || slot.kind === 'empty';
}

export async function loadWeek(store: KeyValueStore): Promise<WeekMenu | null> {
  const raw = await store.getItem(STORAGE_KEYS.menu);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WeekMenu;
    const valid =
      DINNER_STYLES.includes(parsed.dinnerStyle) &&
      Array.isArray(parsed.days) &&
      parsed.days.length === 7 &&
      parsed.days.every((day) => MEALS.every((meal) => isSlot(day?.[meal])));
    // A recipe removed in an app update makes the saved week invalid; a new week is generated instead.
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveWeek(store: KeyValueStore, week: WeekMenu): Promise<void> {
  await store.setItem(STORAGE_KEYS.menu, JSON.stringify(week));
}

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
  // Reheated from the previous day's lunch, never the same day's: nobody wants byrek twice in one day.
  | { kind: 'leftovers'; recipeId: string; locked: boolean }
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

// A week needs at least this many different dishes per meal, or the same one comes back.
export const MIN_CHOICES = 7;

// Safety (exclusions, budget) is never relaxed. Cooking time is: when fewer than a week's
// worth of dishes fit, the next quickest ones are added, because a slightly slower dish is
// better than the same dish every day. Each dish shows its minutes, so she can see it.
export function candidatesFor(course: Candidates, profile: FamilyProfile): Recipe[] {
  const ofCourse = RECIPES.filter((recipe) => recipe.course === course);
  const strict = ofCourse.filter((recipe) => fitsProfile(recipe, profile));
  if (strict.length >= MIN_CHOICES) return strict;
  const slower = ofCourse
    .filter((recipe) => !strict.includes(recipe) && fitsProfile(recipe, profile, { ignoreTime: true }))
    .sort((a, b) => totalMinutes(a) - totalMinutes(b));
  return [...strict, ...slower.slice(0, MIN_CHOICES - strict.length)];
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

// How many of a recipe's required ingredients she already has at home.
export function pantryScore(recipe: Recipe, pantry: ReadonlySet<string>): number {
  if (pantry.size === 0) return 0;
  return recipe.ingredients.filter((item) => !item.optional && pantry.has(item.id)).length;
}

// Shuffled, then dishes that use what she has at home first (MVP feature 5).
function pantryFirst(recipes: Recipe[], random: () => number, pantry: ReadonlySet<string>): Recipe[] {
  const shuffled = shuffle(recipes, random);
  if (pantry.size === 0) return shuffled;
  return shuffled
    .map((recipe, order) => ({ recipe, order, score: pantryScore(recipe, pantry) }))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map(({ recipe }) => recipe);
}

// Hands out recipes without repeating until the pool runs out. Dishes from last week come
// last, and the same base (beans, pasta, pastry…) is not served two days running or twice
// on the same day while something else is available.
function makePicker(
  pool: Recipe[],
  random: () => number,
  alreadyUsed: ReadonlySet<string>,
  pantry: ReadonlySet<string>,
  lastWeek: ReadonlySet<string>,
) {
  const fresh = pool.filter((recipe) => !alreadyUsed.has(recipe.id));
  let queue = [
    ...pantryFirst(fresh.filter((recipe) => !lastWeek.has(recipe.id)), random, pantry),
    ...pantryFirst(fresh.filter((recipe) => lastWeek.has(recipe.id)), random, pantry),
  ];
  let lastBase: string | null = null;
  return (avoid: ReadonlySet<string> = new Set()): Recipe | null => {
    if (pool.length === 0) return null;
    if (queue.length === 0) queue = shuffle(pool, random);
    let index = queue.findIndex((recipe) => recipe.base !== lastBase && !avoid.has(recipe.base));
    if (index === -1) index = queue.findIndex((recipe) => recipe.base !== lastBase);
    if (index === -1) index = 0;
    const [picked] = queue.splice(index, 1);
    lastBase = picked.base;
    return picked;
  };
}

// The dish a leftovers dinner reheats: the previous day's lunch, if it keeps well.
export function leftoverSource(previousLunch: Slot | undefined): string | null {
  if (previousLunch?.kind !== 'recipe') return null;
  return getRecipe(previousLunch.recipeId)?.noLeftovers ? null : previousLunch.recipeId;
}

// True when this day's lunch is also tomorrow's dinner, so she cooks a double amount.
export function cooksForTomorrow(week: WeekMenu, dayIndex: number): boolean {
  const lunch = week.days[dayIndex]?.lunch;
  const tomorrow = week.days[dayIndex + 1]?.dinner;
  return lunch?.kind === 'recipe' && tomorrow?.kind === 'leftovers' && tomorrow.recipeId === lunch.recipeId;
}

const baseOf = (slot: Slot): string | null => (slot.kind === 'recipe' ? (getRecipe(slot.recipeId)?.base ?? null) : null);

function dinnerKindFor(style: DinnerStyle, dayIndex: number): 'light' | 'full' | 'leftovers' {
  if (style === 'light') return 'light';
  if (style === 'like-lunch') return 'full';
  if (style === 'leftovers') return 'leftovers';
  // Mixed: mostly light dinners, with the previous day's lunch twice a week.
  return dayIndex % 3 === 1 ? 'leftovers' : 'light';
}

const recipeSlot = (recipe: Recipe | null): Slot =>
  recipe ? { kind: 'recipe', recipeId: recipe.id, locked: false } : { kind: 'empty', locked: false };

export function generateWeek(
  profile: FamilyProfile,
  dinnerStyle: DinnerStyle,
  random: () => number,
  previous?: WeekMenu,
  pantry: ReadonlySet<string> = new Set(),
): WeekMenu {
  // Locked slots from the previous week stay exactly where they were.
  const locked = (day: number, meal: Meal): Slot | null => {
    const slot = previous?.days[day]?.[meal];
    return slot && slot.locked ? slot : null;
  };
  const lockedIds = new Set<string>();
  const lastWeek = new Set<string>();
  previous?.days.forEach((day) =>
    MEALS.forEach((meal) => {
      const slot = day[meal];
      if (slot.kind !== 'recipe') return;
      if (slot.locked) lockedIds.add(slot.recipeId);
      else lastWeek.add(slot.recipeId);
    }),
  );

  const nextBreakfast = makePicker(candidatesFor('breakfast', profile), random, lockedIds, pantry, lastWeek);
  const nextLunch = makePicker(candidatesFor('lunch', profile), random, lockedIds, pantry, lastWeek);
  const nextLightDinner = makePicker(candidatesFor('light-dinner', profile), random, lockedIds, pantry, lastWeek);
  const nextFullDinner = makePicker(candidatesFor('lunch', profile), random, lockedIds, pantry, lastWeek);

  const days: DayPlan[] = [];
  for (let day = 0; day < 7; day++) {
    const breakfast = locked(day, 'breakfast') ?? recipeSlot(nextBreakfast());
    const lunch = locked(day, 'lunch') ?? recipeSlot(nextLunch());
    let dinner = locked(day, 'dinner');
    if (!dinner) {
      const kind = dinnerKindFor(dinnerStyle, day);
      // Today's lunch base is avoided at dinner, so the same kind of dish never comes twice in a day.
      const avoid = new Set([baseOf(lunch)].filter((base): base is string => base !== null));
      const source = kind === 'leftovers' ? leftoverSource(days[day - 1]?.lunch) : null;
      if (source) dinner = { kind: 'leftovers', recipeId: source, locked: false };
      else if (kind === 'full') {
        let pick = nextFullDinner(avoid);
        if (pick && lunch.kind === 'recipe' && pick.id === lunch.recipeId) pick = nextFullDinner(avoid);
        dinner = recipeSlot(pick);
      }
      // Monday, or a lunch that does not keep: a light dinner instead of leftovers.
      else dinner = recipeSlot(nextLightDinner(avoid));
    }
    days.push({ breakfast, lunch, dinner });
  }
  return relinkLeftovers({ dinnerStyle, days }, profile, random);
}

// After a lunch is swapped (or a locked leftovers dinner is kept), each leftovers dinner must
// still point at the previous day's lunch. If that lunch no longer gives leftovers, a light
// dinner takes its place.
export function relinkLeftovers(week: WeekMenu, profile: FamilyProfile, random: () => number): WeekMenu {
  let current = week;
  week.days.forEach((day, index) => {
    if (day.dinner.kind !== 'leftovers') return;
    const source = leftoverSource(current.days[index - 1]?.lunch);
    if (source === day.dinner.recipeId) return;
    if (source) {
      current = replaceSlot(current, index, 'dinner', { kind: 'leftovers', recipeId: source, locked: day.dinner.locked });
      return;
    }
    const [pick] = alternativesFor(current, index, 'dinner', profile, random, 1);
    current = replaceSlot(current, index, 'dinner', recipeSlot(pick ?? null));
  });
  return current;
}

// Up to `count` other dishes for one slot, with dishes not yet in the week first.
export function alternativesFor(
  week: WeekMenu,
  dayIndex: number,
  meal: Meal,
  profile: FamilyProfile,
  random: () => number,
  count = 3,
  pantry: ReadonlySet<string> = new Set(),
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

  // Dishes built on the same base as another meal that day (pasta at lunch, pasta at dinner) come last.
  const day = week.days[dayIndex];
  const sameDayBases = new Set(MEALS.filter((m) => m !== meal).map((m) => baseOf(day[m])));
  const pool = candidatesFor(course, profile).filter((recipe) => recipe.id !== currentRecipe?.id);
  const rank = (recipe: Recipe) => (inWeek.has(recipe.id) ? 2 : 0) + (sameDayBases.has(recipe.base) ? 1 : 0);
  return pantryFirst(pool, random, pantry)
    .map((recipe, order) => ({ recipe, order, rank: rank(recipe) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, count)
    .map(({ recipe }) => recipe);
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
  // Leftovers saved before they named their dish are invalid; a new week is made instead.
  if (slot.kind === 'leftovers') return typeof slot.recipeId === 'string' && recipeById.has(slot.recipeId);
  return slot.kind === 'empty';
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

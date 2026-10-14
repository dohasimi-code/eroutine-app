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
  // Three dishes to pick from, quickest first; recipeId is the one she picked (or the first).
  | { kind: 'recipe'; recipeId: string; options: string[]; done?: boolean; locked: boolean }
  // Reheated from the previous day's lunch, never the same day's: nobody wants byrek twice in one day.
  | { kind: 'leftovers'; recipeId: string; done?: boolean; locked: boolean }
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

// Cooking time is not a filter: each meal offers a quick and a slower dish, with minutes
// shown, and she picks (Donald's feedback, 14 Oct 2026).
export function fitsProfile(recipe: Recipe, profile: FamilyProfile): boolean {
  const blocked = blockedTags(profile.exclusions);
  if (recipeTags(recipe).some((tag) => blocked.has(tag))) return false;
  if (profile.budget === 'saver' && recipe.budget !== 'saver') return false;
  return true;
}

type Candidates = 'breakfast' | 'lunch' | 'light-dinner';

// Exclusions and budget are never relaxed.
export function candidatesFor(course: Candidates, profile: FamilyProfile): Recipe[] {
  return RECIPES.filter((recipe) => recipe.course === course && fitsProfile(recipe, profile));
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
  recipe ? { kind: 'recipe', recipeId: recipe.id, options: [recipe.id], locked: false } : { kind: 'empty', locked: false };

export const OPTION_COUNT = 3;
const byTime = (ids: string[]) => [...ids].sort((a, b) => totalMinutes(getRecipe(a)!) - totalMinutes(getRecipe(b)!));

// The quickest and the slowest of the candidates, so the three choices span the time range
// (e.g. bread and butter 5 min, eggs and cheese 10 min, omelette 20 min).
function spreadByTime(candidates: Recipe[], count: number): Recipe[] {
  const sorted = [...candidates].sort((a, b) => totalMinutes(a) - totalMinutes(b));
  if (sorted.length <= count) return sorted;
  const picked = [sorted[0], sorted[sorted.length - 1]];
  for (const recipe of candidates) {
    if (picked.length >= count) break;
    if (!picked.includes(recipe)) picked.push(recipe);
  }
  return picked.slice(0, count);
}

// Gives every planned dish two more choices for the same meal.
export function fillOptions(week: WeekMenu, profile: FamilyProfile, random: () => number, pantry: ReadonlySet<string> = new Set()): WeekMenu {
  let current = week;
  week.days.forEach((day, dayIndex) =>
    MEALS.forEach((meal) => {
      const slot = current.days[dayIndex][meal];
      if (slot.kind !== 'recipe' || slot.options.length >= OPTION_COUNT) return;
      const extra = spreadByTime(alternativesFor(current, dayIndex, meal, profile, random, 6, pantry), OPTION_COUNT - 1);
      const options = byTime([slot.recipeId, ...extra.map((recipe) => recipe.id)]);
      current = replaceSlot(current, dayIndex, meal, { ...slot, options });
    }),
  );
  return current;
}

// Three different dishes when none of the offered ones suits her.
export function otherOptions(
  week: WeekMenu,
  dayIndex: number,
  meal: Meal,
  profile: FamilyProfile,
  random: () => number,
  pantry: ReadonlySet<string> = new Set(),
): WeekMenu {
  const slot = week.days[dayIndex][meal];
  if (slot.kind !== 'recipe') return week;
  const shown = new Set(slot.options);
  const fresh = alternativesFor(week, dayIndex, meal, profile, random, 12, pantry).filter((recipe) => !shown.has(recipe.id));
  if (fresh.length === 0) return week;
  const options = byTime(spreadByTime(fresh, OPTION_COUNT).map((recipe) => recipe.id));
  return replaceSlot(week, dayIndex, meal, { ...slot, recipeId: options[0], options, done: false });
}

export function chooseOption(week: WeekMenu, dayIndex: number, meal: Meal, recipeId: string): WeekMenu {
  const slot = week.days[dayIndex][meal];
  if (slot.kind !== 'recipe' || !slot.options.includes(recipeId)) return week;
  return replaceSlot(week, dayIndex, meal, { ...slot, recipeId, done: false });
}

export function setDone(week: WeekMenu, dayIndex: number, meal: Meal, done: boolean): WeekMenu {
  const slot = week.days[dayIndex][meal];
  if (slot.kind === 'empty') return week;
  return replaceSlot(week, dayIndex, meal, { ...slot, done });
}

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
  return fillOptions(relinkLeftovers({ dinnerStyle, days }, profile, random), profile, random, pantry);
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
      // Dishes already offered as a choice count too, so each day offers something new.
      if (slot.kind === 'recipe') slot.options.forEach((id) => inWeek.add(id));
      if (slot.kind === 'leftovers') inWeek.add(slot.recipeId);
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
  // Weeks saved before meals had three choices are replaced by a new week.
  if (slot.kind === 'recipe') {
    return (
      typeof slot.recipeId === 'string' &&
      Array.isArray(slot.options) &&
      slot.options.includes(slot.recipeId) &&
      slot.options.every((id) => typeof id === 'string' && recipeById.has(id))
    );
  }
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

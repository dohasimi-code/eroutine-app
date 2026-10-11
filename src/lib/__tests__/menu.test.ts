import { INGREDIENTS } from '../../data/ingredients';
import { RECIPES } from '../../data/recipes';
import {
  DINNER_STYLES,
  MEALS,
  alternativesFor,
  candidatesFor,
  fitsProfile,
  generateWeek,
  getRecipe,
  loadWeek,
  recipeTags,
  saveWeek,
  seededRandom,
  toggleLock,
  totalMinutes,
  weekdayIndex,
  type WeekMenu,
} from '../menu';
import { DEFAULT_PROFILE, EXCLUSION_OPTIONS, type FamilyProfile } from '../profile';
import { STORAGE_KEYS, createMemoryStore } from '../storage';

const profile = (patch: Partial<FamilyProfile> = {}): FamilyProfile => ({ ...DEFAULT_PROFILE, maxCookMinutes: 60, ...patch });

function recipesIn(week: WeekMenu) {
  return week.days.flatMap((day) =>
    MEALS.map((meal) => day[meal]).flatMap((slot) => (slot.kind === 'recipe' ? [getRecipe(slot.recipeId)!] : [])),
  );
}

describe('recipe data', () => {
  it('every recipe has unique id, both languages and matching step counts', () => {
    const ids = new Set<string>();
    for (const recipe of RECIPES) {
      expect(ids.has(recipe.id)).toBe(false);
      ids.add(recipe.id);
      expect(recipe.name.sq.trim()).not.toBe('');
      expect(recipe.name.en.trim()).not.toBe('');
      expect(recipe.steps.sq.length).toBeGreaterThan(0);
      expect(recipe.steps.sq.length).toBe(recipe.steps.en.length);
      for (const item of recipe.ingredients) expect(INGREDIENTS).toHaveProperty(item.id);
    }
  });

  it('labels each variant by what it actually contains', () => {
    // Donald's review: dairy only when cheese or milk is really used, gluten only with flour.
    expect(recipeTags(getRecipe('spinach-omelette')!)).toEqual(['eggs']);
    expect(recipeTags(getRecipe('petulla-jam')!)).toEqual(['gluten']);
    expect(recipeTags(getRecipe('petulla-cheese')!).sort()).toEqual(['dairy', 'gluten']);
    expect(recipeTags(getRecipe('zucchini-yogurt')!)).toEqual(['dairy']);
    expect(recipeTags(getRecipe('tave-kosi')!).sort()).toEqual(['dairy', 'eggs', 'gluten', 'lamb']);
    expect(recipeTags(getRecipe('stuffed-peppers-veg')!)).toEqual([]);
  });

  it('keeps soaking time separate from cooking time', () => {
    const beans = getRecipe('bean-stew')!;
    expect(beans.soakHours).toBe(8);
    expect(totalMinutes(beans)).toBe(beans.prepMinutes + beans.cookMinutes);
  });

  it('home-made byrek takes longer than ready-made pastry', () => {
    expect(totalMinutes(getRecipe('byrek-spinach-homemade')!)).toBeGreaterThan(totalMinutes(getRecipe('byrek-spinach-ready')!));
  });
});

describe('filters', () => {
  it('never offers a dish with an excluded ingredient', () => {
    for (const exclusion of EXCLUSION_OPTIONS) {
      const p = profile({ exclusions: [exclusion], budget: 'medium' });
      for (const course of ['breakfast', 'lunch', 'light-dinner'] as const) {
        for (const recipe of candidatesFor(course, p)) {
          const tags = recipeTags(recipe);
          if (exclusion === 'meat') {
            expect(tags.some((tag) => ['chicken', 'beef', 'lamb', 'pork', 'fish'].includes(tag))).toBe(false);
          } else {
            expect(tags).not.toContain(exclusion);
          }
        }
      }
    }
  });

  it('still finds dishes for every single exclusion', () => {
    for (const exclusion of EXCLUSION_OPTIONS) {
      const p = profile({ exclusions: [exclusion] });
      for (const course of ['breakfast', 'lunch', 'light-dinner'] as const) {
        expect(candidatesFor(course, p).length).toBeGreaterThan(0);
      }
    }
  });

  it('thrifty budget only uses thrifty dishes', () => {
    const lunches = candidatesFor('lunch', profile({ budget: 'saver' }));
    expect(lunches.every((recipe) => recipe.budget === 'saver')).toBe(true);
    expect(lunches.map((r) => r.id)).not.toContain('tave-kosi');
  });

  it('respects cooking time, and relaxes it only when nothing fits', () => {
    const quick = profile({ maxCookMinutes: 30 });
    expect(candidatesFor('lunch', quick).every((recipe) => totalMinutes(recipe) <= 30)).toBe(true);
    // No lunch takes 15 minutes or less, so slower lunches are offered instead of nothing.
    expect(candidatesFor('lunch', profile({ maxCookMinutes: 15 })).length).toBeGreaterThan(0);
    expect(fitsProfile(getRecipe('bean-stew')!, quick)).toBe(false);
  });

  it('snacks such as sutliash are never in the weekly menu', () => {
    for (const course of ['breakfast', 'lunch', 'light-dinner'] as const) {
      expect(candidatesFor(course, profile()).map((r) => r.id)).not.toContain('sutliash');
    }
  });
});

describe('weekly menu', () => {
  it('fills 7 days with breakfast, lunch and dinner', () => {
    const week = generateWeek(profile(), 'mixed', seededRandom(1));
    expect(week.days).toHaveLength(7);
    for (const day of week.days) for (const meal of MEALS) expect(day[meal].kind).not.toBe('empty');
  });

  it('does not repeat a lunch while other lunches are available', () => {
    const week = generateWeek(profile(), 'light', seededRandom(2));
    const lunches = week.days.map((day) => (day.lunch.kind === 'recipe' ? day.lunch.recipeId : ''));
    expect(new Set(lunches).size).toBe(7);
  });

  it('does not serve two variants of the same dish on consecutive days', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const week = generateWeek(profile(), 'light', seededRandom(seed));
      const families = week.days.map((day) => (day.lunch.kind === 'recipe' ? getRecipe(day.lunch.recipeId)!.family : ''));
      for (let i = 1; i < families.length; i++) expect(families[i]).not.toBe(families[i - 1]);
    }
  });

  it('follows each dinner style', () => {
    const light = generateWeek(profile(), 'light', seededRandom(3));
    expect(light.days.every((d) => d.dinner.kind === 'recipe' && getRecipe(d.dinner.recipeId)!.course === 'light-dinner')).toBe(true);

    const full = generateWeek(profile(), 'like-lunch', seededRandom(3));
    for (const day of full.days) {
      expect(day.dinner.kind === 'recipe' && getRecipe(day.dinner.recipeId)!.course).toBe('lunch');
      expect(day.dinner.kind === 'recipe' && day.lunch.kind === 'recipe' && day.dinner.recipeId === day.lunch.recipeId).toBe(false);
    }

    const leftovers = generateWeek(profile(), 'leftovers', seededRandom(3));
    expect(leftovers.days.every((d) => d.dinner.kind === 'leftovers')).toBe(true);

    const mixed = generateWeek(profile(), 'mixed', seededRandom(3));
    const kinds = mixed.days.map((d) => d.dinner.kind);
    expect(kinds).toContain('leftovers');
    expect(kinds).toContain('recipe');
  });

  it('only uses dishes that fit the family', () => {
    const p = profile({ exclusions: ['gluten', 'dairy'], budget: 'saver', maxCookMinutes: 45 });
    for (const style of DINNER_STYLES) {
      const week = generateWeek(p, style, seededRandom(4));
      for (const recipe of recipesIn(week)) {
        expect(recipeTags(recipe)).not.toContain('gluten');
        expect(recipeTags(recipe)).not.toContain('dairy');
        expect(recipe.budget).toBe('saver');
      }
    }
  });

  it('keeps locked meals when a new week is made', () => {
    let week = generateWeek(profile(), 'mixed', seededRandom(5));
    week = toggleLock(week, 2, 'lunch');
    const kept = week.days[2].lunch;
    const next = generateWeek(profile(), 'mixed', seededRandom(99), week);
    expect(next.days[2].lunch).toEqual(kept);
    expect(next.days[2].lunch.locked).toBe(true);
    // The locked dish is not repeated elsewhere in the new week.
    const lockedId = kept.kind === 'recipe' ? kept.recipeId : '';
    const lunchIds = next.days.map((d) => (d.lunch.kind === 'recipe' ? d.lunch.recipeId : ''));
    expect(lunchIds.filter((id) => id === lockedId)).toHaveLength(1);
  });
});

describe('swapping one meal', () => {
  it('offers up to 3 different dishes that fit the family, without touching the week', () => {
    const p = profile({ exclusions: ['eggs'] });
    const week = generateWeek(p, 'mixed', seededRandom(6));
    const before = JSON.stringify(week);
    const current = week.days[0].breakfast;
    const options = alternativesFor(week, 0, 'breakfast', p, seededRandom(7));
    expect(options.length).toBe(3);
    for (const option of options) {
      expect(option.course).toBe('breakfast');
      expect(recipeTags(option)).not.toContain('eggs');
      expect(current.kind === 'recipe' && option.id === current.recipeId).toBe(false);
    }
    expect(JSON.stringify(week)).toBe(before);
  });

  it('prefers dishes that are not already in the week', () => {
    const week = generateWeek(profile(), 'light', seededRandom(8));
    const inWeek = new Set(recipesIn(week).map((r) => r.id));
    const options = alternativesFor(week, 3, 'lunch', profile(), seededRandom(9));
    expect(options.every((option) => !inWeek.has(option.id))).toBe(true);
  });
});

describe('saving the week', () => {
  it('round-trips and rejects broken data', async () => {
    const store = createMemoryStore();
    const week = generateWeek(profile(), 'mixed', seededRandom(10));
    await saveWeek(store, week);
    expect(await loadWeek(store)).toEqual(week);

    await store.setItem(STORAGE_KEYS.menu, JSON.stringify({ ...week, days: week.days.slice(0, 3) }));
    expect(await loadWeek(store)).toBeNull();
    const removed = { ...week, days: week.days.map((d) => ({ ...d, lunch: { kind: 'recipe', recipeId: 'gone', locked: false } })) };
    await store.setItem(STORAGE_KEYS.menu, JSON.stringify(removed));
    expect(await loadWeek(store)).toBeNull();
  });
});

describe('weekday', () => {
  it('starts the week on Monday', () => {
    expect(weekdayIndex(new Date(2026, 9, 12))).toBe(0); // Monday 12 Oct 2026
    expect(weekdayIndex(new Date(2026, 9, 11))).toBe(6); // Sunday
  });
});

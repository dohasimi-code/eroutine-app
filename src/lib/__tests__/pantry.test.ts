import { RECIPES } from '../../data/recipes';
import { alternativesFor, generateWeek, getRecipe, pantryScore, seededRandom, type WeekMenu } from '../menu';
import { PANTRY_OPTIONS, loadPantry, savePantry } from '../pantry';
import { DEFAULT_PROFILE } from '../profile';
import { STORAGE_KEYS, createMemoryStore, deleteAllData } from '../storage';

const profile = { ...DEFAULT_PROFILE, maxCookMinutes: 60 as const, budget: 'medium' as const };

describe('what I have at home', () => {
  it('offers ingredients bought by weight or piece, not spoon-only spices', () => {
    expect(PANTRY_OPTIONS).toEqual(expect.arrayContaining(['potato', 'eggs', 'rice', 'driedBeans']));
    expect(PANTRY_OPTIONS).not.toContain('salt');
    expect(PANTRY_OPTIONS).not.toContain('paprika');
  });

  it('scores a recipe by the required ingredients she already has', () => {
    const eggsTomato = getRecipe('eggs-tomato')!;
    expect(pantryScore(eggsTomato, new Set())).toBe(0);
    expect(pantryScore(eggsTomato, new Set(['eggs', 'tomato']))).toBe(2);
    // Bread is optional in this recipe, so it does not count.
    expect(pantryScore(eggsTomato, new Set(['bread']))).toBe(0);
  });

  it('puts dishes that use her ingredients into the new week first', () => {
    const pantry = new Set(['driedBeans', 'lentils']);
    const usingPantry = RECIPES.filter((recipe) => recipe.course === 'lunch' && pantryScore(recipe, pantry) > 0).map((r) => r.id);
    expect(usingPantry.length).toBeGreaterThan(0);
    for (let seed = 1; seed <= 20; seed++) {
      const week = generateWeek(profile, 'light', seededRandom(seed), undefined, pantry);
      const lunches = week.days.map((day) => (day.lunch.kind === 'recipe' ? day.lunch.recipeId : ''));
      for (const id of usingPantry) expect(lunches).toContain(id);
    }
  });

  it('changes nothing when nothing is marked', () => {
    const plain = generateWeek(profile, 'mixed', seededRandom(3));
    const empty = generateWeek(profile, 'mixed', seededRandom(3), undefined, new Set());
    expect(empty).toEqual(plain);
  });

  it('lists matching alternatives first when swapping a meal', () => {
    const leftovers = { kind: 'leftovers', locked: false } as const;
    const week: WeekMenu = { dinnerStyle: 'mixed', days: Array(7).fill({ breakfast: leftovers, lunch: leftovers, dinner: leftovers }) };
    for (let seed = 1; seed <= 10; seed++) {
      const options = alternativesFor(week, 0, 'lunch', profile, seededRandom(seed), 3, new Set(['lamb']));
      expect(options[0].id).toBe('tave-kosi');
    }
  });

  it('is saved on the phone, ignores unknown ids, and is deleted with all data', async () => {
    const store = createMemoryStore();
    await savePantry(store, ['eggs', 'rice']);
    expect(await loadPantry(store)).toEqual(['eggs', 'rice']);
    await store.setItem(STORAGE_KEYS.pantry, JSON.stringify(['eggs', 'eggs', 'salt', 'nonsense', 4]));
    expect(await loadPantry(store)).toEqual(['eggs']);
    await deleteAllData(store);
    expect(store.dump()).toEqual({});
  });
});

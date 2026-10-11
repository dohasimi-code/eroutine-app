import type { IngredientId } from '../../data/ingredients';
import { generateWeek, seededRandom, type DayPlan, type WeekMenu } from '../menu';
import { DEFAULT_PROFILE } from '../profile';
import {
  buildShoppingList,
  estimateCost,
  formatDate,
  formatLek,
  itemCost,
  itemKey,
  loadListState,
  loadPrices,
  parseLek,
  savePrices,
  todayIso,
  toggleIn,
  type ListItem,
} from '../shopping';
import { STORAGE_KEYS, createMemoryStore, deleteAllData } from '../storage';

const leftovers = { kind: 'leftovers', locked: false } as const;
const recipe = (recipeId: string) => ({ kind: 'recipe', recipeId, locked: false }) as const;

function weekOf(days: DayPlan[]): WeekMenu {
  const empty: DayPlan = { breakfast: leftovers, lunch: leftovers, dinner: leftovers };
  return { dinnerStyle: 'mixed', days: [...days, ...Array(7 - days.length).fill(empty)] };
}

const find = (items: ListItem[], id: IngredientId) => items.filter((item) => item.id === id);

describe('buildShoppingList', () => {
  it('adds up the same ingredient across meals and scales to the family', () => {
    // eggs-tomato: 6 eggs, 3 tomatoes for 4; bread-cheese-tomato: 3 tomatoes for 4.
    const week = weekOf([
      { breakfast: recipe('eggs-tomato'), lunch: recipe('bread-cheese-tomato'), dinner: leftovers },
      { breakfast: recipe('eggs-tomato'), lunch: leftovers, dinner: leftovers },
    ]);
    const forFour = buildShoppingList(week, 4);
    expect(find(forFour, 'eggs')).toEqual([expect.objectContaining({ quantity: 12, unit: 'pcs' })]);
    expect(find(forFour, 'tomato')).toEqual([expect.objectContaining({ quantity: 9, unit: 'pcs' })]);

    const forTwo = buildShoppingList(week, 2);
    expect(find(forTwo, 'eggs')[0].quantity).toBe(6);
    expect(find(forTwo, 'tomato')[0].quantity).toBe(4.5);
  });

  it('ignores leftover and empty meals', () => {
    expect(buildShoppingList(weekOf([]), 4)).toEqual([]);
  });

  it('marks optional-only ingredients and keeps them optional only while no meal needs them', () => {
    const optionalBread = buildShoppingList(weekOf([{ breakfast: recipe('eggs-tomato'), lunch: leftovers, dinner: leftovers }]), 4);
    expect(find(optionalBread, 'bread')[0].optional).toBe(true);

    const neededBread = buildShoppingList(
      weekOf([{ breakfast: recipe('eggs-tomato'), lunch: recipe('bread-cheese-tomato'), dinner: leftovers }]),
      4,
    );
    expect(find(neededBread, 'bread')[0]).toEqual(expect.objectContaining({ optional: false, quantity: 700, unit: 'g' }));
  });

  it('treats spoon-only ingredients as staples and folds oil spoons into millilitres', () => {
    // petulla-cheese uses 250 ml oil; eggs-tomato 2 tbsp oil and 1 tsp salt.
    const items = buildShoppingList(
      weekOf([{ breakfast: recipe('petulla-cheese'), lunch: recipe('eggs-tomato'), dinner: leftovers }]),
      4,
    );
    expect(find(items, 'oil')).toEqual([expect.objectContaining({ unit: 'ml', quantity: 280, staple: false })]);
    expect(find(items, 'salt')[0]).toEqual(expect.objectContaining({ unit: 'tsp', staple: true }));
  });

  it('lists every ingredient of a generated week once, with one unit each', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const week = generateWeek({ ...DEFAULT_PROFILE, maxCookMinutes: 60, budget: 'medium' }, 'mixed', seededRandom(seed));
      const items = buildShoppingList(week, 4);
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      expect(items.every((item) => item.quantity > 0)).toBe(true);
    }
  });
});

describe('prices and the estimate', () => {
  const eggs: ListItem = { id: 'eggs', quantity: 12, unit: 'pcs', optional: false, staple: false };
  const potatoes: ListItem = { id: 'potato', quantity: 1500, unit: 'g', optional: false, staple: false };
  const oil: ListItem = { id: 'oil', quantity: 250, unit: 'ml', optional: false, staple: false };
  const salt: ListItem = { id: 'salt', quantity: 2, unit: 'tsp', optional: false, staple: true };

  it('costs items by kg, litre or piece', () => {
    expect(itemCost(eggs, { lek: 20, per: 'pcs', date: '2026-10-11' })).toBe(240);
    expect(itemCost(potatoes, { lek: 80, per: 'kg', date: '2026-10-11' })).toBe(120);
    expect(itemCost(oil, { lek: 300, per: 'l', date: '2026-10-11' })).toBe(75);
    // A price in the wrong unit is not used rather than guessed.
    expect(itemCost(potatoes, { lek: 30, per: 'pcs', date: '2026-10-11' })).toBeNull();
    expect(itemCost(potatoes, undefined)).toBeNull();
  });

  it('counts only priced items still to buy, and says how many have a price', () => {
    const items = [eggs, potatoes, oil, salt];
    const prices = { eggs: { lek: 20, per: 'pcs', date: '2026-10-11' }, potato: { lek: 80, per: 'kg', date: '2026-10-11' } } as const;
    expect(estimateCost(items, prices, new Set())).toEqual({ lek: 360, priced: 2, total: 3 });
    expect(estimateCost(items, prices, new Set([itemKey(eggs)]))).toEqual({ lek: 120, priced: 1, total: 2 });
    expect(estimateCost(items, {}, new Set())).toEqual({ lek: 0, priced: 0, total: 3 });
  });

  it('reads typed prices leniently and rejects nonsense', () => {
    expect(parseLek('180')).toBe(180);
    expect(parseLek(' 1 200 ')).toBe(1200);
    expect(parseLek('99,5')).toBe(100);
    expect(parseLek('')).toBeNull();
    expect(parseLek('abc')).toBeNull();
    expect(parseLek('0')).toBeNull();
    expect(parseLek('-5')).toBeNull();
  });

  it('formats lek and dates for each language', () => {
    expect(formatLek(1850, 'sq')).toBe('1 850 lekë');
    expect(formatLek(1850, 'en')).toBe('1,850 lek');
    expect(formatDate('2026-10-11', 'sq')).toBe('11.10.2026');
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('saves prices, drops invalid saved entries, and deletes them with all data', async () => {
    const store = createMemoryStore();
    await savePrices(store, { eggs: { lek: 20, per: 'pcs', store: 'Treg', date: '2026-10-11' } });
    expect(await loadPrices(store)).toEqual({ eggs: { lek: 20, per: 'pcs', store: 'Treg', date: '2026-10-11' } });

    await store.setItem(
      STORAGE_KEYS.prices,
      JSON.stringify({ eggs: { lek: -1, per: 'pcs', date: '2026-10-11' }, unknown: { lek: 5, per: 'kg', date: '2026-10-11' }, milk: { lek: 120, per: 'l', date: '2026-10-11' } }),
    );
    expect(await loadPrices(store)).toEqual({ milk: { lek: 120, per: 'l', date: '2026-10-11' } });

    await store.setItem(STORAGE_KEYS.prices, 'not json');
    expect(await loadPrices(store)).toEqual({});

    await savePrices(store, { milk: { lek: 120, per: 'l', date: '2026-10-11' } });
    await deleteAllData(store);
    expect(store.dump()).toEqual({});
  });
});

describe('list ticks', () => {
  it('toggles keys and survives bad saved data', async () => {
    expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);

    const store = createMemoryStore();
    expect(await loadListState(store)).toEqual({ atHome: [], bought: [] });
    await store.setItem(STORAGE_KEYS.list, JSON.stringify({ atHome: ['eggs:pcs', 3], bought: 'x' }));
    expect(await loadListState(store)).toEqual({ atHome: ['eggs:pcs'], bought: [] });
  });
});

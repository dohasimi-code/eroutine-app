import { INGREDIENTS, type IngredientId } from '../data/ingredients';
import type { Category, Unit } from '../data/types';
import { MEALS, getRecipe, type WeekMenu } from './menu';
import { scaleQuantity } from './quantity';
import { STORAGE_KEYS, type KeyValueStore } from './storage';

export const CATEGORY_ORDER: Category[] = ['produce', 'dairy', 'meat', 'bakery', 'pantry'];

const SPOON_ML: Partial<Record<Unit, number>> = { tbsp: 15, tsp: 5 };

export type ListItem = {
  id: IngredientId;
  quantity: number;
  unit: Unit;
  // Every use of it this week is "if you like", so she can skip buying it.
  optional: boolean;
  // Measured only in spoons (salt, spices): she usually has it, so it is checked rather than bought.
  staple: boolean;
};

// Adds up the ingredients of every planned meal, scaled to the family size.
export function buildShoppingList(week: WeekMenu, people: number): ListItem[] {
  const totals = new Map<IngredientId, { perServing: Map<Unit, number>; optional: boolean }>();
  for (const day of week.days) {
    for (const meal of MEALS) {
      const slot = day[meal];
      // A leftovers dinner means cooking a double amount of the previous day's lunch.
      if (slot.kind === 'empty') continue;
      const recipe = getRecipe(slot.recipeId);
      if (!recipe) continue;
      for (const item of recipe.ingredients) {
        const id = item.id as IngredientId;
        const entry = totals.get(id) ?? { perServing: new Map(), optional: true };
        entry.perServing.set(item.unit, (entry.perServing.get(item.unit) ?? 0) + item.qty / recipe.servings);
        entry.optional = entry.optional && Boolean(item.optional);
        totals.set(id, entry);
      }
    }
  }

  const items: ListItem[] = [];
  for (const [id, { perServing, optional }] of totals) {
    // Spoons of something also bought by the litre (oil) are folded into millilitres.
    if (perServing.has('ml')) {
      for (const [unit, ml] of Object.entries(SPOON_ML) as [Unit, number][]) {
        const amount = perServing.get(unit);
        if (amount === undefined) continue;
        perServing.set('ml', perServing.get('ml')! + amount * ml);
        perServing.delete(unit);
      }
    }
    const staple = [...perServing.keys()].every((unit) => unit in SPOON_ML);
    for (const [unit, amount] of perServing) {
      items.push({ id, unit, quantity: scaleQuantity(amount, unit, 1, people), optional, staple });
    }
  }
  return sortItems(items);
}

function sortItems(items: ListItem[]): ListItem[] {
  return items.sort((a, b) => {
    const byCategory = CATEGORY_ORDER.indexOf(INGREDIENTS[a.id].category) - CATEGORY_ORDER.indexOf(INGREDIENTS[b.id].category);
    return byCategory || INGREDIENTS[a.id].name.sq.localeCompare(INGREDIENTS[b.id].name.sq);
  });
}

export const itemKey = (item: Pick<ListItem, 'id' | 'unit'>) => `${item.id}:${item.unit}`;

// ───────────── Prices ─────────────
// Prices are only ever what she typed herself: the app ships with none.

export type PriceUnit = 'kg' | 'l' | 'pcs';

export type Price = {
  lek: number;
  per: PriceUnit;
  store?: string;
  date: string; // YYYY-MM-DD, the day she entered it
};

export type PriceBook = Partial<Record<IngredientId, Price>>;

export function priceUnitFor(unit: Unit): PriceUnit | null {
  if (unit === 'g') return 'kg';
  if (unit === 'ml') return 'l';
  if (unit === 'pcs') return 'pcs';
  return null;
}

export function itemCost(item: ListItem, price: Price | undefined): number | null {
  if (!price || priceUnitFor(item.unit) !== price.per) return null;
  return price.per === 'pcs' ? item.quantity * price.lek : (item.quantity / 1000) * price.lek;
}

export type Estimate = { lek: number; priced: number; total: number };

// Only items she still has to buy count; items without a price are reported, never guessed.
export function estimateCost(items: ListItem[], prices: PriceBook, atHome: Set<string>): Estimate {
  let lek = 0;
  let priced = 0;
  let total = 0;
  for (const item of items) {
    if (item.staple || atHome.has(itemKey(item))) continue;
    total += 1;
    const cost = itemCost(item, prices[item.id]);
    if (cost === null) continue;
    priced += 1;
    lek += cost;
  }
  return { lek: Math.round(lek / 10) * 10, priced, total };
}

export function parseLek(text: string): number | null {
  const cleaned = text.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value > 0 && value < 1_000_000 ? Math.round(value) : null;
}

export function todayIso(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLek(value: number, language: 'sq' | 'en'): string {
  const digits = String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, language === 'sq' ? ' ' : ',');
  return language === 'sq' ? `${digits} lekë` : `${digits} lek`;
}

export function formatDate(iso: string, language: 'sq' | 'en'): string {
  const [year, month, day] = iso.split('-').map(Number);
  return language === 'sq' ? `${day}.${month}.${year}` : `${day}/${month}/${year}`;
}

function isPrice(value: unknown): value is Price {
  if (!value || typeof value !== 'object') return false;
  const price = value as Record<string, unknown>;
  return (
    typeof price.lek === 'number' &&
    price.lek > 0 &&
    (price.per === 'kg' || price.per === 'l' || price.per === 'pcs') &&
    typeof price.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(price.date) &&
    (price.store === undefined || typeof price.store === 'string')
  );
}

export async function loadPrices(store: KeyValueStore): Promise<PriceBook> {
  const raw = await store.getItem(STORAGE_KEYS.prices);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const book: PriceBook = {};
    for (const [id, price] of Object.entries(parsed)) {
      if (id in INGREDIENTS && isPrice(price)) book[id as IngredientId] = price;
    }
    return book;
  } catch {
    return {};
  }
}

export async function savePrices(store: KeyValueStore, prices: PriceBook): Promise<void> {
  await store.setItem(STORAGE_KEYS.prices, JSON.stringify(prices));
}

// ───────────── Ticks for this week's list ─────────────

export type ListState = { atHome: string[]; bought: string[] };

export const EMPTY_LIST_STATE: ListState = { atHome: [], bought: [] };

export function toggleIn(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

export async function loadListState(store: KeyValueStore): Promise<ListState> {
  const raw = await store.getItem(STORAGE_KEYS.list);
  if (!raw) return EMPTY_LIST_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<ListState>;
    const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
    return { atHome: strings(parsed.atHome), bought: strings(parsed.bought) };
  } catch {
    return EMPTY_LIST_STATE;
  }
}

export async function saveListState(store: KeyValueStore, state: ListState): Promise<void> {
  await store.setItem(STORAGE_KEYS.list, JSON.stringify(state));
}

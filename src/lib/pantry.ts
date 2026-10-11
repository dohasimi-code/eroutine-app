import { INGREDIENTS, type IngredientId } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { CATEGORY_ORDER } from './shopping';
import { STORAGE_KEYS, type KeyValueStore } from './storage';

// What she can mark as "I have at home": ingredients bought by weight, volume or piece.
// Spices and other spoon-only staples are left out; she nearly always has them.
export const PANTRY_OPTIONS: IngredientId[] = (Object.keys(INGREDIENTS) as IngredientId[])
  .filter((id) => RECIPES.some((recipe) => recipe.ingredients.some((item) => item.id === id && !['tbsp', 'tsp'].includes(item.unit))))
  .sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(INGREDIENTS[a].category) - CATEGORY_ORDER.indexOf(INGREDIENTS[b].category) ||
      INGREDIENTS[a].name.sq.localeCompare(INGREDIENTS[b].name.sq),
  );

export async function loadPantry(store: KeyValueStore): Promise<IngredientId[]> {
  const raw = await store.getItem(STORAGE_KEYS.pantry);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is IngredientId => typeof id === 'string' && PANTRY_OPTIONS.includes(id as IngredientId)))];
  } catch {
    return [];
  }
}

export async function savePantry(store: KeyValueStore, pantry: IngredientId[]): Promise<void> {
  await store.setItem(STORAGE_KEYS.pantry, JSON.stringify(pantry));
}

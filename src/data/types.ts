import type { Budget } from '../lib/profile';

export type Localized = { sq: string; en: string };

// Allergen / diet tags carried by ingredients. A recipe's tags are the union of its
// required ingredients' tags, so every variant is labelled by what it actually contains.
export type Tag = 'gluten' | 'dairy' | 'eggs' | 'nuts' | 'fish' | 'chicken' | 'beef' | 'lamb' | 'pork';

// Shopping-list aisles.
export type Category = 'produce' | 'dairy' | 'meat' | 'bakery' | 'pantry';

export type Unit = 'g' | 'ml' | 'pcs' | 'tbsp' | 'tsp';

export type IngredientInfo = {
  name: Localized;
  category: Category;
  tags: Tag[];
  // Composition varies by brand or type: remind her to read the label.
  checkLabel?: boolean;
};

export type RecipeIngredient = {
  id: string;
  qty: number;
  unit: Unit;
  // Optional ingredients are shown but do not count toward the recipe's tags.
  optional?: boolean;
};

// "light" dinners are short; lunches can also be served as a full dinner.
export type Course = 'breakfast' | 'lunch' | 'light-dinner' | 'snack';

export type Recipe = {
  id: string;
  // Variants of one dish share a family (e.g. byrek with ready or home-made pastry).
  family: string;
  name: Localized;
  course: Course;
  budget: Budget;
  prepMinutes: number;
  cookMinutes: number;
  // Done the night before (e.g. soaking beans); not counted in cooking time.
  soakHours?: number;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: { sq: string[]; en: string[] };
  leftoverTip?: Localized;
};

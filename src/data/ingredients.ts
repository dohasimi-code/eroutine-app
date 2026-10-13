import type { IngredientInfo } from './types';

export const INGREDIENTS = {
  // Produce
  tomato: { name: { sq: 'Domate', en: 'Tomatoes' }, category: 'produce', tags: [] },
  onion: { name: { sq: 'Qepë', en: 'Onions' }, category: 'produce', tags: [] },
  garlic: { name: { sq: 'Hudhër', en: 'Garlic' }, category: 'produce', tags: [] },
  potato: { name: { sq: 'Patate', en: 'Potatoes' }, category: 'produce', tags: [] },
  carrot: { name: { sq: 'Karota', en: 'Carrots' }, category: 'produce', tags: [] },
  pepper: { name: { sq: 'Speca', en: 'Peppers' }, category: 'produce', tags: [] },
  zucchini: { name: { sq: 'Kunguj', en: 'Zucchini' }, category: 'produce', tags: [] },
  eggplant: { name: { sq: 'Patëllxhanë', en: 'Eggplant' }, category: 'produce', tags: [] },
  spinach: { name: { sq: 'Spinaq', en: 'Spinach' }, category: 'produce', tags: [] },
  leek: { name: { sq: 'Presh', en: 'Leeks' }, category: 'produce', tags: [] },
  cucumber: { name: { sq: 'Kastravec', en: 'Cucumber' }, category: 'produce', tags: [] },
  lettuce: { name: { sq: 'Marule', en: 'Lettuce' }, category: 'produce', tags: [] },
  lemon: { name: { sq: 'Limon', en: 'Lemon' }, category: 'produce', tags: [] },
  parsley: { name: { sq: 'Majdanoz', en: 'Parsley' }, category: 'produce', tags: [] },
  dill: { name: { sq: 'Kopër', en: 'Dill' }, category: 'produce', tags: [] },
  peas: { name: { sq: 'Bizele (të freskëta ose të ngrira)', en: 'Peas (fresh or frozen)' }, category: 'produce', tags: [] },
  cabbage: { name: { sq: 'Lakër', en: 'Cabbage' }, category: 'produce', tags: [] },
  greenBeans: { name: { sq: 'Fasule të njoma', en: 'Green beans' }, category: 'produce', tags: [] },
  seasonalFruit: { name: { sq: 'Fruta të sezonit', en: 'Seasonal fruit' }, category: 'produce', tags: [] },

  // Dairy and eggs
  eggs: { name: { sq: 'Vezë', en: 'Eggs' }, category: 'dairy', tags: ['eggs'] },
  milk: { name: { sq: 'Qumësht', en: 'Milk' }, category: 'dairy', tags: ['dairy'] },
  yogurt: { name: { sq: 'Kos', en: 'Yogurt' }, category: 'dairy', tags: ['dairy'] },
  whiteCheese: { name: { sq: 'Djathë i bardhë', en: 'White cheese (feta-style)' }, category: 'dairy', tags: ['dairy'] },
  gjize: { name: { sq: 'Gjizë', en: 'Gjizë (fresh curd cheese)' }, category: 'dairy', tags: ['dairy'] },
  butter: { name: { sq: 'Gjalpë', en: 'Butter' }, category: 'dairy', tags: ['dairy'] },

  // Meat and fish
  chicken: { name: { sq: 'Pulë (copa)', en: 'Chicken pieces' }, category: 'meat', tags: ['chicken'] },
  beefMince: { name: { sq: 'Mish viçi i grirë', en: 'Minced beef' }, category: 'meat', tags: ['beef'] },
  beefStew: { name: { sq: 'Mish viçi për zierje', en: 'Stewing beef' }, category: 'meat', tags: ['beef'] },
  lamb: { name: { sq: 'Mish qengji', en: 'Lamb' }, category: 'meat', tags: ['lamb'] },
  fish: { name: { sq: 'Peshk (sipas tregut)', en: 'Fish (whatever is in season)' }, category: 'meat', tags: ['fish'] },

  // Bakery
  bread: { name: { sq: 'Bukë', en: 'Bread' }, category: 'bakery', tags: ['gluten'] },
  breadcrumbs: { name: { sq: 'Bukë e grirë', en: 'Breadcrumbs' }, category: 'bakery', tags: ['gluten'], checkLabel: true },
  phyllo: { name: { sq: 'Peta të gatshme byreku', en: 'Ready-made phyllo sheets' }, category: 'bakery', tags: ['gluten'], checkLabel: true },

  // Pantry
  flour: { name: { sq: 'Miell gruri', en: 'Wheat flour' }, category: 'pantry', tags: ['gluten'] },
  yeast: { name: { sq: 'Maja buke', en: 'Dry yeast' }, category: 'pantry', tags: [] },
  // Plain maize flour; check the label if gluten matters, as some mills also grind wheat.
  cornmeal: { name: { sq: 'Miell misri', en: 'Cornmeal' }, category: 'pantry', tags: [], checkLabel: true },
  rice: { name: { sq: 'Oriz', en: 'Rice' }, category: 'pantry', tags: [] },
  pasta: { name: { sq: 'Makarona', en: 'Pasta' }, category: 'pantry', tags: ['gluten'], checkLabel: true },
  vermicelli: { name: { sq: 'Fide', en: 'Vermicelli' }, category: 'pantry', tags: ['gluten'], checkLabel: true },
  oats: {
    name: { sq: 'Tërshërë', en: 'Rolled oats' },
    category: 'pantry',
    // Oats are often processed alongside wheat.
    tags: ['gluten'],
    checkLabel: true,
  },
  trahana: {
    name: { sq: 'Trahana', en: 'Trahana' },
    category: 'pantry',
    // Usually wheat with yogurt or milk, but it varies by type.
    tags: ['gluten', 'dairy'],
    checkLabel: true,
  },
  driedBeans: { name: { sq: 'Fasule të thata', en: 'Dried white beans' }, category: 'pantry', tags: [] },
  lentils: { name: { sq: 'Thjerrëza', en: 'Lentils' }, category: 'pantry', tags: [] },
  tomatoPaste: { name: { sq: 'Salcë domateje', en: 'Tomato paste' }, category: 'pantry', tags: [] },
  cannedTomato: { name: { sq: 'Domate të konservuara', en: 'Canned tomatoes' }, category: 'pantry', tags: [] },
  oil: { name: { sq: 'Vaj', en: 'Cooking oil' }, category: 'pantry', tags: [] },
  oliveOil: { name: { sq: 'Vaj ulliri', en: 'Olive oil' }, category: 'pantry', tags: [] },
  salt: { name: { sq: 'Kripë', en: 'Salt' }, category: 'pantry', tags: [] },
  paprika: { name: { sq: 'Spec i kuq pluhur', en: 'Paprika' }, category: 'pantry', tags: [] },
  mint: { name: { sq: 'Mendër e thatë', en: 'Dried mint' }, category: 'pantry', tags: [] },
  oregano: { name: { sq: 'Rigon', en: 'Oregano' }, category: 'pantry', tags: [] },
  sugar: { name: { sq: 'Sheqer', en: 'Sugar' }, category: 'pantry', tags: [] },
  honey: { name: { sq: 'Mjaltë', en: 'Honey' }, category: 'pantry', tags: [] },
  jam: { name: { sq: 'Reçel', en: 'Jam' }, category: 'pantry', tags: [] },
  cinnamon: { name: { sq: 'Kanellë', en: 'Cinnamon' }, category: 'pantry', tags: [] },
} satisfies Record<string, IngredientInfo>;

export type IngredientId = keyof typeof INGREDIENTS;

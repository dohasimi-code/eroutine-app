import type { Unit } from '../data/types';

// Scales a 4-serving quantity to the family size and rounds it to something you can measure.
export function scaleQuantity(qty: number, unit: Unit, servings: number, people: number): number {
  const scaled = (qty * people) / servings;
  if (unit === 'g' || unit === 'ml') {
    if (scaled >= 100) return Math.round(scaled / 10) * 10;
    return Math.max(5, Math.round(scaled / 5) * 5);
  }
  // Pieces and spoons: nearest half, never zero.
  return Math.max(0.5, Math.round(scaled * 2) / 2);
}

const UNIT_LABELS: Record<'sq' | 'en', Record<Unit, [string, string]>> = {
  // [singular, plural]
  sq: { g: ['g', 'g'], ml: ['ml', 'ml'], pcs: ['copë', 'copë'], tbsp: ['lugë gjelle', 'lugë gjelle'], tsp: ['lugë çaji', 'lugë çaji'] },
  en: { g: ['g', 'g'], ml: ['ml', 'ml'], pcs: ['', ''], tbsp: ['tbsp', 'tbsp'], tsp: ['tsp', 'tsp'] },
};

export function formatQuantity(value: number, unit: Unit, language: 'sq' | 'en'): string {
  const whole = Math.floor(value);
  const half = value - whole >= 0.5;
  const number = half ? (whole === 0 ? '½' : `${whole}½`) : String(whole);
  if ((unit === 'g' || unit === 'ml') && value >= 1000) {
    const big = String(Math.round(value / 100) / 10);
    return `${language === 'sq' ? big.replace('.', ',') : big} ${unit === 'g' ? 'kg' : 'l'}`;
  }
  const [one, many] = UNIT_LABELS[language][unit];
  const label = value <= 1 ? one : many;
  return label ? `${number} ${label}` : number;
}

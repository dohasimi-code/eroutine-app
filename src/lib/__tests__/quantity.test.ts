import { formatQuantity, scaleQuantity } from '../quantity';

describe('quantities', () => {
  it('scales from 4 servings to the family size', () => {
    expect(scaleQuantity(400, 'g', 4, 4)).toBe(400);
    expect(scaleQuantity(400, 'g', 4, 6)).toBe(600);
    expect(scaleQuantity(3, 'pcs', 4, 2)).toBe(1.5);
  });

  it('rounds to amounts you can measure', () => {
    expect(scaleQuantity(333, 'g', 4, 3)).toBe(250);
    expect(scaleQuantity(1, 'tsp', 4, 1)).toBe(0.5);
    expect(scaleQuantity(7, 'g', 4, 1)).toBe(5);
  });

  it('formats in both languages', () => {
    expect(formatQuantity(1.5, 'tbsp', 'sq')).toBe('1½ lugë gjelle');
    expect(formatQuantity(0.5, 'pcs', 'en')).toBe('½');
    expect(formatQuantity(1500, 'g', 'sq')).toBe('1,5 kg');
    expect(formatQuantity(1500, 'ml', 'en')).toBe('1.5 l');
    expect(formatQuantity(250, 'g', 'en')).toBe('250 g');
  });
});

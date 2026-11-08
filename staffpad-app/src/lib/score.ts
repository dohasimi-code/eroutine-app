import { Stroke } from './ink';

export type Score = { systems: number; strokes: Stroke[] };

export function parseScore(raw: string | null): Score | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Score;
    return typeof p.systems === 'number' && Array.isArray(p.strokes) ? p : null;
  } catch {
    return null;
  }
}

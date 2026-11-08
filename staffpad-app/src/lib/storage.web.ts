import { parseScore, Score } from './score';

const KEY = 'portativ.score.v1';

export async function loadScore(): Promise<Score | null> {
  try {
    return parseScore(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export async function saveScore(score: Score): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(score));
  } catch {
    // Best-effort.
  }
}

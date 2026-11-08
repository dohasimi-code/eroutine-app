import Storage from 'expo-sqlite/kv-store';
import { parseScore, Score } from './score';

const KEY = 'portativ.score.v1';

export async function loadScore(): Promise<Score | null> {
  try {
    return parseScore(await Storage.getItemAsync(KEY));
  } catch {
    return null;
  }
}

export async function saveScore(score: Score): Promise<void> {
  try {
    await Storage.setItemAsync(KEY, JSON.stringify(score));
  } catch {
    // Best-effort: drawing must keep working if storage fails.
  }
}

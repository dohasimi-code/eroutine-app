import { en } from './en';
import { sq, type TranslationKey } from './sq';

export type Language = 'sq' | 'en';
export type { TranslationKey };

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'sq', label: 'Shqip' },
  { code: 'en', label: 'English' },
];

const dictionaries: Record<Language, Record<TranslationKey, string>> = { sq, en };

export function translate(language: Language, key: TranslationKey): string {
  return dictionaries[language][key];
}

// Albanian is the default; English only when the phone itself is set to English.
export function pickInitialLanguage(deviceLanguageCodes: (string | null | undefined)[]): Language {
  const first = deviceLanguageCodes.find((code) => code === 'sq' || code === 'en');
  return first === 'en' ? 'en' : 'sq';
}

export function greetingKey(hour: number): TranslationKey {
  if (hour < 12) return 'today.greeting.morning';
  if (hour < 18) return 'today.greeting.day';
  return 'today.greeting.evening';
}

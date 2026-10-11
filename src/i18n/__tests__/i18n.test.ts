import { en } from '../en';
import { greetingKey, pickInitialLanguage, translate } from '../index';
import { sq } from '../sq';

describe('translations', () => {
  it('English and Albanian have exactly the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(sq).sort());
  });

  it('no translation is empty', () => {
    for (const value of [...Object.values(sq), ...Object.values(en)]) {
      expect(value.trim()).not.toBe('');
    }
  });

  it('switches text with the language', () => {
    expect(translate('sq', 'tabs.today')).toBe('Sot');
    expect(translate('en', 'tabs.today')).toBe('Today');
  });
});

describe('initial language', () => {
  it('defaults to Albanian', () => {
    expect(pickInitialLanguage([])).toBe('sq');
    expect(pickInitialLanguage(['it', null])).toBe('sq');
  });

  it('uses English when the phone is in English', () => {
    expect(pickInitialLanguage(['en'])).toBe('en');
    expect(pickInitialLanguage(['de', 'en'])).toBe('en');
  });

  it('prefers Albanian when it comes first', () => {
    expect(pickInitialLanguage(['sq', 'en'])).toBe('sq');
  });
});

describe('greeting', () => {
  it('changes through the day', () => {
    expect(greetingKey(8)).toBe('today.greeting.morning');
    expect(greetingKey(14)).toBe('today.greeting.day');
    expect(greetingKey(20)).toBe('today.greeting.evening');
  });
});

import { describe, expect, it } from 'vitest';
import ko from '@/messages/ko.json';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';

describe('i18n messages and dictionary (C-25)', () => {
  it('keeps identical key sets and non-empty values across ko, en, ja', () => {
    const koKeys = Object.keys(ko).sort();
    const enKeys = Object.keys(en).sort();
    const jaKeys = Object.keys(ja).sort();
    expect(enKeys).toEqual(koKeys);
    expect(jaKeys).toEqual(koKeys);

    for (const [lang, dict] of [
      ['ko', ko],
      ['en', en],
      ['ja', ja],
    ] as const) {
      for (const [k, v] of Object.entries(dict)) {
        expect(v.trim(), `${lang}.${k} should not be empty`).not.toBe('');
      }
    }
  });

  it('resolves messages, interpolates vars, and validates langs', () => {
    const dict = getDictionary('en');
    expect(t(dict, 'breadcrumb.home')).toBe('Home');
    expect(t(dict, 'trust.samples', { n: 12 })).toBe('12 sales');
    expect(t(dict, 'trust.samples', {})).toBe('{n} sales');
    expect(() => t(dict, 'missing.key')).toThrow('[i18n] missing key: missing.key');
    expect(isLang('ko')).toBe(true);
    expect(isLang('fr')).toBe(false);
  });
});

import ko from '@/messages/ko.json';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';

export type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = { ko, en, ja };

export const getDictionary = (lang: Lang): Dict => DICTS[lang];

export function t(dict: Dict, key: string, vars?: Record<string, string | number>): string {
  const raw = dict[key];
  if (raw === undefined) throw new Error(`[i18n] missing key: ${key}`);
  return vars ? raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : raw;
}

export const isLang = (v: string): v is Lang =>
  (config.locales as readonly string[]).includes(v);

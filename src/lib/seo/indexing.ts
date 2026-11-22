import { config } from '@/config';
import type { Goods, Ip, Lang } from '@/lib/data/types';

const L = () => config.seo.indexLevel;

export const goodsComplete = (g: Goods, lang?: Lang): boolean => {
  if (g.name.ko === '' || g.name.ja === '' || !(g.retail.price > 0)) return false;
  if (lang === 'en') return g.name.en !== '';
  return true;
};

export function goodsIndexable(g: Goods, lang: Lang): boolean {
  if (L() >= 3) return true;
  if (!goodsComplete(g, lang)) return false;
  return lang === 'ko' || g.review[lang];
}

export const ipHubGenerated = (ip: Ip): boolean => L() >= 3 || ip.goodsCount >= 1;
export const ipHubIndexable = ipHubGenerated;

export function typePageGenerated(count: number): boolean {
  if (L() === 1) return false;
  return L() === 2 ? count >= 3 : count >= 1;
}

export const guideIndexable = (reviewed: boolean): boolean => reviewed;
export const guidesListIndexable = (reviewedCount: number): boolean => reviewedCount > 0;
export const lastmodOverride = (): string | null =>
  L() === 4 ? new Date().toISOString().slice(0, 10) : null;

import { config } from '@/config';
import type { Goods, Market } from '@/lib/data/types';

const SEARCH: Record<Exclude<Market, 'other'>, (q: string) => string> = {
  ebay: (q) =>
    `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1`,
  mercari: (q) => `https://jp.mercari.com/search?keyword=${encodeURIComponent(q)}&status=sold_out`,
  kream: (q) => `https://kream.co.kr/search?keyword=${encodeURIComponent(q)}`,
};

const QUERY = (g: Goods, m: Exclude<Market, 'other'>): string =>
  m === 'ebay' ? g.name.en || g.original : m === 'mercari' ? g.original : g.name.ko;

export function marketUrl(g: Goods, market: Market, sourceUrl: string | null): string | null {
  const base = sourceUrl ?? (market === 'other' ? null : SEARCH[market](QUERY(g, market)));
  if (!base) return null;
  const aff = market === 'other' ? null : config.affiliate[market];
  if (!aff) return base;
  const u = new URL(base);
  u.searchParams.set(aff.param, aff.value);
  return u.toString();
}

export const hasAffiliate = (m: Market): boolean => m !== 'other' && config.affiliate[m] !== null;
export const anyAffiliate = (): boolean => Object.values(config.affiliate).some((v) => v !== null);
export const MARKET_LABEL: Record<Market, string> = {
  ebay: 'eBay',
  mercari: 'Mercari',
  kream: 'KREAM',
  other: 'Other',
};

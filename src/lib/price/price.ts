import { config } from '@/config';
import type { Catalog, CollectionItem, Currency, Goods, PriceSnapshot, WishItem } from '@/lib/data/types';

export const toJPY = (v: number, c: Currency): number => v * config.fx.toJPY[c];
export const fromJPY = (jpy: number, c: Currency): number => jpy / config.fx.toJPY[c];
const days = (a: string, b: string): number => (Date.parse(b) - Date.parse(a)) / 86_400_000;

export type Current = {
  jpy: number;
  date: string;
  stale: boolean;
  markets: PriceSnapshot[];
} | null;

export function priceOn(rows: PriceSnapshot[], maxDate: string, generatedAt: string): Current {
  const usable = rows.filter((r) => r.date <= maxDate);
  if (usable.length === 0) return null;
  const date = usable.reduce((d, r) => (r.date > d ? r.date : d), usable[0].date);
  const at = usable.filter((r) => r.date === date).sort((a, b) => b.samples - a.samples);
  const total = at.reduce((s, r) => s + r.samples, 0);
  const jpy = at.reduce((s, r) => s + toJPY(r.median, r.currency) * r.samples, 0) / total;
  return { jpy, date, stale: days(date, generatedAt) > config.price.staleDays, markets: at };
}

export const currentPrice = (
  goodsId: string,
  prices: PriceSnapshot[],
  generatedAt: string
): Current => priceOn(prices.filter((p) => p.goodsId === goodsId), '9999-12-31', generatedAt);

export const premiumRatio = (curJPY: number, retail: Goods['retail']): number =>
  (curJPY - toJPY(retail.price, retail.currency)) / toJPY(retail.price, retail.currency);

export function averagePremium(ratios: number[]): number | null {
  if (ratios.length === 0) return null;
  return ratios.reduce((s, r) => s + r, 0) / ratios.length;
}

export function collectionGrade(totalJPY: number): (typeof config.share.grades)[number] {
  let result: (typeof config.share.grades)[number] = config.share.grades[0];
  for (const g of config.share.grades) {
    if (totalJPY >= g.minJPY) result = g;
  }
  return result;
}

export function itemValueJPY(
  item: CollectionItem,
  cat: Catalog,
  maxDate = '9999-12-31'
): number {
  if (item.manual) return toJPY(item.manual.price, item.manual.currency) * item.qty;
  const g = cat.goods.find((x) => x.id === item.goodsId);
  if (!g) return 0;
  const cur = priceOn(cat.prices.filter((p) => p.goodsId === g.id), maxDate, cat.meta.generatedAt);
  return (cur ? cur.jpy : toJPY(g.retail.price, g.retail.currency)) * item.qty;
}

export function collectionHistory(
  items: CollectionItem[],
  cat: Catalog
): { date: string; jpy: number }[] {
  const ids = new Set(items.map((i) => i.goodsId));
  const dates = [...new Set(cat.prices.filter((p) => ids.has(p.goodsId)).map((p) => p.date))].sort();
  return dates.map((date) => ({
    date,
    jpy: items.reduce((s, i) => s + itemValueJPY(i, cat, date), 0),
  }));
}

export const wishReached = (w: WishItem, cur: Current): boolean =>
  w.targetPrice !== null && cur !== null && fromJPY(cur.jpy, w.currency) <= w.targetPrice;

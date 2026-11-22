import type { Goods, GoodsType, Ip } from '@/lib/data/types';
import { typePageGenerated } from '@/lib/seo/indexing';

export const ALL_GOODS_TYPES: GoodsType[] = [
  'figure',
  'plush',
  'badge',
  'card',
  'kuji',
  'apparel',
  'other',
];

export function collectTypeCombos(ips: Ip[], goods: Goods[]): { ipSlug: string; type: GoodsType }[] {
  const result: { ipSlug: string; type: GoodsType }[] = [];
  for (const ip of ips) {
    for (const type of ALL_GOODS_TYPES) {
      const count = goods.filter((g) => g.ipSlug === ip.slug && g.type === type).length;
      if (typePageGenerated(count)) {
        result.push({ ipSlug: ip.slug, type });
      }
    }
  }
  return result;
}

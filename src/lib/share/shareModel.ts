import { config } from '@/config';
import { ipColor } from '@/lib/data/catalog';
import type { Catalog, CollectionItem, Lang } from '@/lib/data/types';
import { formatLocalMoney, formatPercent } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { collectionGrade, itemValueJPY, toJPY } from '@/lib/price/price';
import type { ShareCardCell, ShareCardInput } from './renderCard';

export type ShareModel = {
  input: ShareCardInput;
  cells: ShareCardCell[];
  totalText: string;
  gradeLabel: string;
  nextGradeDiffJPY: number | null;
};

export function buildShareModel(
  collection: CollectionItem[],
  cat: Catalog,
  lang: Lang,
  dict: Dict,
  photos: Record<string, File>,
  watermark: boolean
): ShareModel | null {
  if (collection.length === 0) return null;
  const goodsMap = new Map(cat.goods.map((g) => [g.id, g]));
  const ipMap = new Map(cat.ips.map((i) => [i.slug, i]));

  const entries = collection.map((item) => {
    const goods = item.goodsId ? (goodsMap.get(item.goodsId) ?? null) : null;
    const ip = goods ? (ipMap.get(goods.ipSlug) ?? null) : null;
    const valueJPY = itemValueJPY(item, cat);
    const retailJPY = item.manual
      ? toJPY(item.manual.price, item.manual.currency) * item.qty
      : goods
        ? toJPY(goods.retail.price, goods.retail.currency) * item.qty
        : 0;
    const name = item.manual
      ? item.manual.name
      : goods
        ? goods.name[lang] || goods.original
        : (item.goodsId ?? item.id);
    const color = ip ? ipColor(ip) : config.ipColors[0];
    const initial = (ip ? ip.name.en || ip.original : item.manual?.ipName || '?')
      .trim()
      .charAt(0)
      .toUpperCase();
    return {
      valueJPY,
      retailJPY,
      cell: {
        id: item.id,
        name,
        valueText: formatLocalMoney(valueJPY, lang),
        ipColor: color,
        ipInitial: initial || '?',
        type: goods ? goods.type : ('other' as const),
        photo: photos[item.id],
      } satisfies ShareCardCell,
    };
  });

  const totalJPY = entries.reduce((s, e) => s + e.valueJPY, 0);
  const retailTotalJPY = entries.reduce((s, e) => s + e.retailJPY, 0);
  const ratio = retailTotalJPY > 0 ? (totalJPY - retailTotalJPY) / retailTotalJPY : 0;
  const rounded = Math.round(ratio * 100);
  const grade = collectionGrade(totalJPY);
  const nextGrade = config.share.grades.find((g) => g.minJPY > grade.minJPY) ?? null;
  const cells = [...entries].sort((a, b) => b.valueJPY - a.valueJPY).slice(0, 9).map((e) => e.cell);
  const totalText = formatLocalMoney(totalJPY, lang);

  return {
    cells,
    totalText,
    gradeLabel: t(dict, `grade.${grade.id}`),
    nextGradeDiffJPY: nextGrade ? Math.max(0, nextGrade.minJPY - totalJPY) : null,
    input: {
      lang,
      cardTitle: t(dict, 'share.cardTitle'),
      gradeText: t(dict, `grade.${grade.id}`),
      totalText,
      vsRetailText: `${t(dict, 'goods.vsRetail')} ${formatPercent(ratio)}`,
      premiumSign: rounded > 0 ? 'pos' : rounded < 0 ? 'neg' : 'zero',
      watermark,
      madeWith: t(dict, 'share.madeWith'),
      cells,
    },
  };
}

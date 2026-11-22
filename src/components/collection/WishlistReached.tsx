'use client';

import Link from 'next/link';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import type { Goods, Ip, Lang, WishItem } from '@/lib/data/types';
import { formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { fromJPY, type Current } from '@/lib/price/price';
import { Icon } from '@/components/ui/icons';
import { GoodsPlaceholder } from '@/components/goods/GoodsPlaceholder';
import { MarketButtons } from '@/components/goods/MarketButtons';

export type ReachedRow = {
  wish: WishItem;
  goods: Goods;
  ip: Ip | null;
  current: NonNullable<Current>;
};

type Props = {
  items: ReachedRow[];
  lang: Lang;
  dict: Dict;
};

export function WishlistReached({ items, lang, dict }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-(--radius-lg) bg-success-tint p-(--space-5)">
      <h2 className="flex items-center gap-(--space-2) text-h2 text-secondary">
        <Icon name="check" size={24} className="shrink-0 text-success" />
        <span>{t(dict, 'wish.reachedTitle', { n: items.length })}</span>
      </h2>

      <div className="mt-(--space-4) grid grid-cols-1 gap-(--space-4) md:grid-cols-2">
        {items.map(({ wish, goods, ip, current }, idx) => {
          const displayName = goods.name[lang] || goods.original;
          const curAmount = fromJPY(current.jpy, wish.currency);
          const target = wish.targetPrice ?? 0;
          const below = Math.max(0, target - curAmount);
          const initial = ip ? (ip.name.en || ip.original).trim().charAt(0).toUpperCase() : '?';

          return (
            <div
              key={wish.goodsId}
              className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)"
            >
              <div className="flex items-start gap-(--space-3)">
                <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-(--radius-md)">
                  <GoodsPlaceholder
                    ipColor={ip ? ipColor(ip) : 'var(--color-text-muted)'}
                    ipInitial={initial}
                    type={goods.type}
                    size={80}
                    label={displayName}
                    className="h-[80px] w-[80px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={goodsPath(lang, goods)}
                    className="block truncate text-h4 text-secondary hover:underline"
                  >
                    {displayName}
                  </Link>
                  <p className="mt-(--space-1) text-small text-text tabular-nums">
                    {t(dict, 'wish.current')}:{' '}
                    <strong>{formatMoney(curAmount, wish.currency, lang)}</strong>
                  </p>
                  <p className="text-small text-text-muted tabular-nums">
                    {t(dict, 'wish.target')}: {formatMoney(target, wish.currency, lang)}
                  </p>
                  <p className="mt-(--space-1) text-small font-semibold text-success tabular-nums">
                    {t(dict, 'wish.below', { amount: formatMoney(below, wish.currency, lang) })}
                  </p>
                </div>
              </div>

              <div className="mt-(--space-4)">
                <MarketButtons
                  goods={goods}
                  lang={lang}
                  dict={dict}
                  markets={current.markets}
                  primaryFirst={idx === 0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

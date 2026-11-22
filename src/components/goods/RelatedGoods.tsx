'use client';

import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Current } from '@/lib/price/price';
import { buttonClass } from '@/components/ui/Button';
import { GoodsCard } from './GoodsCard';

type Props = {
  lang: Lang;
  dict: Dict;
  ip: Ip;
  items: { goods: Goods; current: Current }[];
  title?: string;
  max?: number;
};

export function RelatedGoods({ lang, dict, ip, items, title, max = 6 }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mt-(--space-8)">
      <div className="flex flex-wrap items-center justify-between gap-(--space-2)">
        <h2 className="text-h3 text-secondary">{title ?? t(dict, 'related.goodsTitle')}</h2>
        <Link href={`/${lang}/ip/${ip.slug}/`} className={buttonClass('text')}>
          {t(dict, 'related.goodsMore', { ip: ip.name[lang] })}
        </Link>
      </div>
      <div className="mt-(--space-4) grid grid-cols-2 gap-(--space-4) md:grid-cols-3 md:gap-(--space-5) lg:grid-cols-4">
        {items.slice(0, max).map(({ goods, current }) => (
          <GoodsCard
            key={goods.id}
            goods={goods}
            ip={ip}
            lang={lang}
            dict={dict}
            current={current}
            onClick={() =>
              track('internal_link_click', {
                block: 'related_goods',
                target_screen_id: 'S-04',
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { formatLocalMoney, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { premiumRatio, type Current } from '@/lib/price/price';
import { addToCollection } from '@/lib/storage/store';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { GoodsPlaceholder } from '@/components/goods/GoodsPlaceholder';
import { PremiumBadge } from '@/components/goods/PremiumBadge';

type Props = {
  goods: Goods;
  ip: Ip;
  current: Current;
  lang: Lang;
  dict: Dict;
  onAdded: () => void;
};

export function ScanMatchResult({ goods, ip, current, lang, dict, onAdded }: Props) {
  const [qty, setQty] = useState(1);
  const displayName = goods.name[lang] || goods.original;
  const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
  const retailStr = formatMoney(goods.retail.price, goods.retail.currency, lang);

  const handleAdd = () => {
    addToCollection(goods.id, qty);
    track('collection_add', { method: 'scan', goods_id: goods.id });
    onAdded();
  };

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
      <h2 className="text-h3 text-secondary">{t(dict, 'scan.matchTitle')}</h2>
      <div className="mt-(--space-4) flex items-start gap-(--space-4)">
        <div className="w-[96px] shrink-0 overflow-hidden rounded-(--radius-md)">
          <GoodsPlaceholder
            ipColor={ipColor(ip)}
            ipInitial={initial}
            type={goods.type}
            size={96}
            label={displayName}
            className="aspect-square h-auto w-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-label text-text-muted">{ip.name[lang]}</p>
          <Link
            href={goodsPath(lang, goods)}
            className="mt-(--space-1) block text-h4 text-secondary hover:underline"
          >
            {displayName}
          </Link>
          <p className="mt-(--space-1) text-small text-text-muted tabular-nums">
            {t(dict, 'goods.retail', { price: retailStr })}
          </p>
          <div className="mt-(--space-2)">
            {current ? (
              <div className="flex flex-wrap items-center gap-(--space-2)">
                <span className="text-[16px] font-bold text-text tabular-nums">
                  {formatLocalMoney(current.jpy, lang)}
                </span>
                <PremiumBadge ratio={premiumRatio(current.jpy, goods.retail)} />
              </div>
            ) : (
              <Chip>{t(dict, 'goods.priceCollecting')}</Chip>
            )}
          </div>
        </div>
      </div>

      <div className="mt-(--space-5) flex flex-col gap-(--space-3) md:flex-row md:items-center">
        <div className="inline-flex items-center gap-(--space-2)" aria-label={t(dict, 'col.qty')}>
          <Button
            variant="icon"
            aria-label="-"
            disabled={qty <= 1}
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="border border-border"
          >
            <Icon name="minus" size={18} />
          </Button>
          <span className="min-w-[32px] text-center text-body font-semibold tabular-nums">
            {qty}
          </span>
          <Button
            variant="icon"
            aria-label="+"
            disabled={qty >= 99}
            onClick={() => setQty((v) => Math.min(99, v + 1))}
            className="border border-border"
          >
            <Icon name="plus" size={18} />
          </Button>
        </div>

        <Button variant="primary" onClick={handleAdd} className="w-full md:w-auto">
          <Icon name="shelf" size={20} />
          <span>{t(dict, 'goods.addShelf')}</span>
        </Button>
      </div>
      <StorageNote dict={dict} className="mt-(--space-3)" />
    </div>
  );
}

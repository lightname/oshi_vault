'use client';

import { useState } from 'react';
import Link from 'next/link';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import type { CollectionItem, Goods, Ip, Lang } from '@/lib/data/types';
import { formatLocalMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { premiumRatio, type Current } from '@/lib/price/price';
import { removeItem, setQty } from '@/lib/storage/store';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/icons';
import { GoodsPlaceholder } from '@/components/goods/GoodsPlaceholder';
import { PremiumBadge } from '@/components/goods/PremiumBadge';

type Props = {
  item: CollectionItem;
  goods: Goods | null;
  ip: Ip | null;
  ips: Ip[];
  current: Current;
  valueJPY: number;
  lang: Lang;
  dict: Dict;
};

export function CollectionRow({ item, goods, ip, ips, current, valueJPY, lang, dict }: Props) {
  const [confirming, setConfirming] = useState(false);

  const manualIp = item.manual
    ? ips.find(
        (x) =>
          x.name.ko === item.manual?.ipName ||
          x.name.en === item.manual?.ipName ||
          x.name.ja === item.manual?.ipName
      ) ?? null
    : null;

  const badgeColor = ip
    ? ipColor(ip)
    : manualIp
      ? ipColor(manualIp)
      : 'var(--color-text-muted)';
  const initialSource = ip
    ? ip.name.en || ip.original
    : manualIp
      ? manualIp.name.en || manualIp.original
      : item.manual?.ipName || '?';
  const initial = initialSource.trim().charAt(0).toUpperCase() || '?';
  const displayName = item.manual
    ? item.manual.name
    : goods
      ? goods.name[lang] || goods.original
      : (item.goodsId ?? item.id);

  return (
    <li className="border-b border-border py-(--space-4) last:border-b-0">
      <div className="flex flex-wrap items-center gap-(--space-3) lg:flex-nowrap lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-(--space-3)">
          <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-(--radius-md)">
            <GoodsPlaceholder
              ipColor={badgeColor}
              ipInitial={initial}
              type={goods ? goods.type : 'other'}
              size={64}
              label={displayName}
              className="h-[64px] w-[64px]"
            />
          </div>
          <div className="min-w-0 flex-1">
            {goods ? (
              <Link
                href={goodsPath(lang, goods)}
                className="block truncate text-h4 text-secondary hover:underline"
              >
                {displayName}
              </Link>
            ) : (
              <p className="truncate text-h4 text-text">{displayName}</p>
            )}
            <div className="mt-(--space-1) flex flex-wrap items-center gap-(--space-2)">
              {ip ? <span className="text-label text-text-muted">{ip.name[lang]}</span> : null}
              {item.manual ? (
                <>
                  <span className="text-label text-text-muted">{item.manual.ipName}</span>
                  <Chip>{t(dict, 'col.manualTag')}</Chip>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="order-3 flex w-full flex-wrap items-center justify-between gap-(--space-3) lg:order-2 lg:w-auto lg:justify-end">
          <div className="flex flex-wrap items-center gap-(--space-2)">
            <span className="text-[16px] font-bold text-text tabular-nums">
              {formatLocalMoney(valueJPY, lang)}
            </span>
            {goods && current ? (
              <PremiumBadge ratio={premiumRatio(current.jpy, goods.retail)} />
            ) : goods ? (
              <Chip>{t(dict, 'goods.priceCollecting')}</Chip>
            ) : null}
          </div>

          <div className="inline-flex items-center gap-(--space-1)" aria-label={t(dict, 'col.qty')}>
            <Button
              variant="icon"
              aria-label="-"
              disabled={item.qty <= 1}
              onClick={() => setQty(item.id, item.qty - 1)}
              className="border border-border"
            >
              <Icon name="minus" size={16} />
            </Button>
            <span className="min-w-[28px] text-center text-body font-semibold tabular-nums">
              {item.qty}
            </span>
            <Button
              variant="icon"
              aria-label="+"
              disabled={item.qty >= 99}
              onClick={() => setQty(item.id, item.qty + 1)}
              className="border border-border"
            >
              <Icon name="plus" size={16} />
            </Button>
          </div>
        </div>

        <div className="order-2 shrink-0 lg:order-3">
          <Button
            variant="icon"
            aria-label={t(dict, 'col.removeConfirm')}
            onClick={() => setConfirming((v) => !v)}
          >
            <Icon name="trash" size={20} />
          </Button>
        </div>
      </div>

      {confirming ? (
        <div className="mt-(--space-3) flex flex-wrap items-center justify-end gap-(--space-2) rounded-(--radius-md) bg-bg px-(--space-3) py-(--space-2)">
          <span className="text-small text-text">{t(dict, 'col.removeConfirm')}</span>
          <Button variant="text" onClick={() => removeItem(item.id)} className="text-danger">
            {t(dict, 'col.remove')}
          </Button>
          <Button variant="text" onClick={() => setConfirming(false)}>
            {t(dict, 'col.cancel')}
          </Button>
        </div>
      ) : null}
    </li>
  );
}

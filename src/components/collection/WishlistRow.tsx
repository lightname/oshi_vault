'use client';

import { useState } from 'react';
import Link from 'next/link';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import type { Goods, Ip, Lang, WishItem } from '@/lib/data/types';
import { formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { fromJPY, wishReached, type Current } from '@/lib/price/price';
import { removeWish, setTarget } from '@/lib/storage/store';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/icons';
import { GoodsPlaceholder } from '@/components/goods/GoodsPlaceholder';

type Props = {
  wish: WishItem;
  goods: Goods | null;
  ip: Ip | null;
  current: Current;
  lang: Lang;
  dict: Dict;
};

export function WishlistRow({ wish, goods, ip, current, lang, dict }: Props) {
  const [raw, setRaw] = useState(wish.targetPrice === null ? '' : String(wish.targetPrice));
  const [error, setError] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const displayName = goods ? goods.name[lang] || goods.original : wish.goodsId;
  const initial = ip ? (ip.name.en || ip.original).trim().charAt(0).toUpperCase() : '?';
  const curAmount = current ? fromJPY(current.jpy, wish.currency) : null;
  const reached = wishReached(wish, current);

  const handleBlur = () => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      setError(false);
      setTarget(wish.goodsId, null);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 600);
      return;
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0 || num > 10_000_000) {
      setError(true);
      return;
    }
    setError(false);
    setTarget(wish.goodsId, num);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 600);
  };

  const statusText = () => {
    if (wish.targetPrice === null) return t(dict, 'wish.noTarget');
    if (curAmount === null) return null;
    if (reached) {
      const below = Math.max(0, wish.targetPrice - curAmount);
      return t(dict, 'wish.below', { amount: formatMoney(below, wish.currency, lang) });
    }
    const gap = Math.max(0, curAmount - wish.targetPrice);
    return t(dict, 'wish.gap', { amount: formatMoney(gap, wish.currency, lang) });
  };

  const borderCls = error
    ? 'border-danger'
    : savedFlash
      ? 'border-success'
      : 'border-border';

  return (
    <li className="border-b border-border py-(--space-4) last:border-b-0">
      <div className="flex flex-wrap items-center gap-(--space-3) lg:flex-nowrap lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-(--space-3)">
          <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-(--radius-md)">
            <GoodsPlaceholder
              ipColor={ip ? ipColor(ip) : 'var(--color-text-muted)'}
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
            <div className="mt-(--space-1)">
              {curAmount !== null ? (
                <span className="text-small font-semibold text-text tabular-nums">
                  {formatMoney(curAmount, wish.currency, lang)}
                </span>
              ) : (
                <Chip>{t(dict, 'goods.priceCollecting')}</Chip>
              )}
            </div>
          </div>
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-(--space-3) lg:order-2 lg:w-auto">
          <div>
            <div className="flex items-center gap-(--space-2)">
              <input
                type="number"
                inputMode="decimal"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onBlur={handleBlur}
                aria-label={`${displayName} ${t(dict, 'wish.target')}`}
                aria-invalid={error}
                className={`h-[40px] w-[120px] rounded-(--radius-md) border bg-surface px-(--space-3) text-small text-text tabular-nums transition-colors duration-150 ${borderCls}`}
              />
              <span className="text-small text-text-muted">{wish.currency}</span>
            </div>
            {error ? (
              <p className="mt-(--space-1) text-small text-danger">
                {t(dict, 'errors.INVALID_REQUEST')}
              </p>
            ) : null}
          </div>

          {statusText() ? (
            <span
              className={`text-small tabular-nums ${reached ? 'font-semibold text-success' : 'text-text-muted'}`}
            >
              {statusText()}
            </span>
          ) : null}
        </div>

        <div className="order-2 shrink-0 lg:order-3">
          <Button
            variant="icon"
            aria-label={t(dict, 'col.remove')}
            onClick={() => removeWish(wish.goodsId)}
          >
            <Icon name="trash" size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}

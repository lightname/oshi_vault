'use client';

import { useState } from 'react';
import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import type { Currency, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { addToCollection, addToWishlist, setTarget } from '@/lib/storage/store';
import { useUserData } from '@/lib/storage/useUserData';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { Toast } from '@/components/ui/Toast';

type Props = {
  goodsId: string;
  lang: Lang;
  dict: Dict;
};

const VALID_PRICE = /^\d+(\.\d{1,2})?$/;

export function GoodsActions({ goodsId, lang, dict }: Props) {
  const user = useUserData();
  const ready = user.status === 'ready';
  const inShelf = ready && user.doc.collection.some((i) => i.goodsId === goodsId);
  const wish = ready ? user.doc.wishlist.find((w) => w.goodsId === goodsId) : undefined;
  const inWish = Boolean(wish);

  const [panelOpen, setPanelOpen] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [currency, setCurrency] = useState<Currency>(config.localeCurrency[lang]);
  const [targetError, setTargetError] = useState(false);
  const [toast, setToast] = useState<{ msg: string; href: string } | null>(null);

  const onAddShelf = () => {
    addToCollection(goodsId);
    track('collection_add', { method: 'search', goods_id: goodsId });
    setToast({ msg: t(dict, 'toast.addedShelf'), href: `/${lang}/collection/` });
  };

  const onAddWish = () => {
    if (!inWish) {
      addToWishlist(goodsId, currency);
      track('wishlist_add', { goods_id: goodsId });
      setToast({ msg: t(dict, 'toast.addedWish'), href: `/${lang}/wishlist/` });
    }
    if (wish?.targetPrice !== null && wish?.targetPrice !== undefined && !targetInput) {
      setTargetInput(String(wish.targetPrice));
      setCurrency(wish.currency);
    }
    setPanelOpen(true);
  };

  const onSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = targetInput.trim();
    const num = Number(raw);
    if (!VALID_PRICE.test(raw) || !(num > 0) || num > 10_000_000) {
      setTargetError(true);
      return;
    }
    setTargetError(false);
    addToWishlist(goodsId, currency);
    setTarget(goodsId, num);
    setToast({ msg: t(dict, 'toast.addedWish'), href: `/${lang}/wishlist/` });
  };

  return (
    <div className="mt-(--space-5)">
      <div className="grid grid-cols-2 gap-(--space-3) md:flex md:flex-wrap">
        <Button variant="secondary" disabled={!ready} onClick={onAddShelf}>
          <Icon name="shelf" size={20} />
          <span>{t(dict, inShelf ? 'goods.inShelf' : 'goods.addShelf')}</span>
        </Button>
        <Button variant="secondary" disabled={!ready} onClick={onAddWish}>
          <Icon name={inWish ? 'heart-filled' : 'heart'} size={20} />
          <span>{t(dict, inWish ? 'goods.inWish' : 'goods.addWish')}</span>
        </Button>
      </div>

      <StorageNote dict={dict} className="mt-(--space-3)" />

      {panelOpen ? (
        <form
          onSubmit={onSaveTarget}
          noValidate
          className="mt-(--space-4) rounded-(--radius-md) border border-border bg-bg p-(--space-4) transition-all duration-200 ease-out"
        >
          <p className="text-small text-text-muted">{t(dict, 'home.wishTitle')}</p>
          <div className="mt-(--space-3) flex flex-col gap-(--space-2) md:flex-row md:items-end">
            <label className="flex-1">
              <span className="block text-small font-semibold text-text">
                {t(dict, 'goods.targetLabel')}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value);
                  setTargetError(false);
                }}
                aria-invalid={targetError}
                className={`mt-(--space-1) h-[48px] w-full rounded-(--radius-md) border bg-surface px-(--space-3) text-body tabular-nums ${
                  targetError ? 'border-danger' : 'border-border'
                }`}
              />
            </label>
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="h-[48px] rounded-(--radius-md) border border-border bg-surface px-(--space-3) text-body"
            >
              <option value="JPY">JPY</option>
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
            </select>
            <Button type="submit" variant="secondary">
              {t(dict, 'goods.saveTarget')}
            </Button>
          </div>
          {targetError ? (
            <p role="alert" className="mt-(--space-2) text-small text-danger">
              {t(dict, 'errors.INVALID_REQUEST')}
            </p>
          ) : null}
        </form>
      ) : null}

      <Toast
        message={toast?.msg ?? null}
        actionLabel={t(dict, 'toast.view')}
        actionHref={toast?.href}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

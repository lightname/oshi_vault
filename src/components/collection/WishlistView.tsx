'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCatalog } from '@/lib/data/catalogClient';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { currentPrice, wishReached } from '@/lib/price/price';
import { reset } from '@/lib/storage/store';
import { useUserData } from '@/lib/storage/useUserData';
import { Button, buttonClass } from '@/components/ui/Button';
import { ClientSection, combineStatus } from '@/components/ui/ClientSection';
import { Icon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { StorageNote } from '@/components/ui/StorageNote';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';
import { WishlistReached, type ReachedRow } from './WishlistReached';
import { WishlistRow } from './WishlistRow';

type Props = { lang: Lang; dict: Dict };

export function WishlistView({ lang, dict }: Props) {
  const user = useUserData();
  const catalog = useCatalog();
  const [confirmReset, setConfirmReset] = useState(false);

  const status = combineStatus(user.status, catalog.status);
  const emptyImg = getImage('IMG-09', lang);

  const computed = useMemo(() => {
    if (!catalog.data) return null;
    const cat = catalog.data;
    const goodsMap = new Map(cat.goods.map((g) => [g.id, g]));
    const ipMap = new Map(cat.ips.map((i) => [i.slug, i]));

    const sorted = [...user.doc.wishlist].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    const rows = sorted.map((wish) => {
      const goods = goodsMap.get(wish.goodsId) ?? null;
      const ip = goods ? (ipMap.get(goods.ipSlug) ?? null) : null;
      const current = goods ? currentPrice(goods.id, cat.prices, cat.meta.generatedAt) : null;
      return { wish, goods, ip, current };
    });

    const reached: ReachedRow[] = rows
      .filter((r) => r.goods !== null && r.current !== null && wishReached(r.wish, r.current))
      .map((r) => ({ wish: r.wish, goods: r.goods!, ip: r.ip, current: r.current! }));

    const watches = user.doc.wishlist
      .filter((w) => w.targetPrice !== null)
      .map((w) => ({ goodsId: w.goodsId, targetPrice: w.targetPrice!, currency: w.currency }));

    return { rows, reached, watches };
  }, [catalog.data, user.doc.wishlist]);

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    reset();
  };

  return (
    <div className="container-main py-(--space-7)">
      <section>
        <h1 className="text-h1 text-secondary">{t(dict, 'wish.h1')}</h1>
        <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'wish.lead')}</p>
        <StorageNote dict={dict} className="mt-(--space-2)" />
      </section>

      <div className="mt-(--space-6)">
        <ClientSection
          status={status}
          isEmpty={user.doc.wishlist.length === 0}
          skeleton={
            <div className="space-y-(--space-3)">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-(--radius-lg)" />
              ))}
            </div>
          }
          error={
            <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-6) text-center">
              <Icon name="alert" size={32} className="mx-auto text-danger" />
              <p className="mt-(--space-3) text-body text-text">{t(dict, 'col.loadError')}</p>
              <div className="mt-(--space-4)">
                {user.status === 'error' ? (
                  <Button variant="secondary" onClick={handleResetClick}>
                    {confirmReset ? t(dict, 'col.removeConfirm') : t(dict, 'col.reset')}
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={catalog.retry}>
                    {t(dict, 'search.reload')}
                  </Button>
                )}
              </div>
            </div>
          }
          empty={
            <div className="flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
              <Image
                src={emptyImg.src}
                alt={emptyImg.alt}
                width={emptyImg.width}
                height={emptyImg.height}
                loading="lazy"
                className="h-[240px] w-[240px] object-contain"
              />
              <h2 className="mt-(--space-4) text-h2 text-secondary">{t(dict, 'wish.emptyTitle')}</h2>
              <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'wish.emptyBody')}</p>
              <div className="mt-(--space-5)">
                <Link href={`/${lang}/ip/`} className={buttonClass('secondary')}>
                  {t(dict, 'wish.emptyCta')}
                </Link>
              </div>
            </div>
          }
        >
          {computed ? (
            <div className="space-y-(--space-6)">
              <WishlistReached items={computed.reached} lang={lang} dict={dict} />

              <section>
                <ul className="rounded-(--radius-lg) border border-border bg-surface px-(--space-4) shadow-(--shadow-card)">
                  {computed.rows.map((r) => (
                    <WishlistRow
                      key={r.wish.goodsId}
                      wish={r.wish}
                      goods={r.goods}
                      ip={r.ip}
                      current={r.current}
                      lang={lang}
                      dict={dict}
                    />
                  ))}
                </ul>
              </section>

              <SubscribeBox
                lang={lang}
                dict={dict}
                topic="target_price"
                watches={computed.watches}
              />
            </div>
          ) : null}
        </ClientSection>
      </div>
    </div>
  );
}

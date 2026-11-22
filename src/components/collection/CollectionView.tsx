'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCatalog } from '@/lib/data/catalogClient';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import {
  collectionHistory,
  currentPrice,
  itemValueJPY,
  premiumRatio,
  toJPY,
} from '@/lib/price/price';
import { reset } from '@/lib/storage/store';
import { useUserData } from '@/lib/storage/useUserData';
import { Button, buttonClass } from '@/components/ui/Button';
import { ClientSection, combineStatus } from '@/components/ui/ClientSection';
import { Icon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { CollectionRow } from './CollectionRow';
import { CollectionSummary } from './CollectionSummary';
import { ValueChart } from './ValueChart';

type Props = { lang: Lang; dict: Dict };
type SortKey = 'value' | 'premium' | 'added';

export function CollectionView({ lang, dict }: Props) {
  const user = useUserData();
  const catalog = useCatalog();
  const [sort, setSort] = useState<SortKey>('value');
  const [confirmReset, setConfirmReset] = useState(false);

  const status = combineStatus(user.status, catalog.status);
  const emptyImg = getImage('IMG-08', lang);

  const computed = useMemo(() => {
    if (!catalog.data) return null;
    const cat = catalog.data;
    const goodsMap = new Map(cat.goods.map((g) => [g.id, g]));
    const ipMap = new Map(cat.ips.map((i) => [i.slug, i]));

    const rows = user.doc.collection.map((item) => {
      const goods = item.goodsId ? (goodsMap.get(item.goodsId) ?? null) : null;
      const ip = goods ? (ipMap.get(goods.ipSlug) ?? null) : null;
      const current = goods ? currentPrice(goods.id, cat.prices, cat.meta.generatedAt) : null;
      const valueJPY = itemValueJPY(item, cat);
      const retailJPY = item.manual
        ? toJPY(item.manual.price, item.manual.currency) * item.qty
        : goods
          ? toJPY(goods.retail.price, goods.retail.currency) * item.qty
          : 0;
      const ratio = goods && current ? premiumRatio(current.jpy, goods.retail) : null;
      return { item, goods, ip, current, valueJPY, retailJPY, ratio };
    });

    const totalJPY = rows.reduce((s, r) => s + r.valueJPY, 0);
    const retailTotalJPY = rows.reduce((s, r) => s + r.retailJPY, 0);
    const history = collectionHistory(user.doc.collection, cat);

    const sorted = [...rows].sort((a, b) => {
      if (sort === 'added') return b.item.addedAt.localeCompare(a.item.addedAt);
      if (sort === 'premium') {
        if (a.ratio !== null && b.ratio === null) return -1;
        if (a.ratio === null && b.ratio !== null) return 1;
        if (a.ratio !== null && b.ratio !== null && a.ratio !== b.ratio) return b.ratio - a.ratio;
      }
      return b.valueJPY - a.valueJPY;
    });

    return { rows: sorted, totalJPY, retailTotalJPY, history, cat };
  }, [catalog.data, user.doc.collection, sort]);

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
      <h1 className="text-h1 text-secondary">{t(dict, 'col.h1')}</h1>

      <div className="mt-(--space-5)">
        <ClientSection
          status={status}
          isEmpty={user.doc.collection.length === 0}
          skeleton={
            <div className="space-y-(--space-5)">
              <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-6)">
                <Skeleton className="h-10 w-48" />
                <div className="mt-(--space-4) grid grid-cols-1 gap-(--space-3) md:grid-cols-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
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
                  <Button variant="secondary" onClick={catalog.retry}>{t(dict, 'search.reload')}</Button>
                )}
              </div>
            </div>
          }
          empty={
            <div className="flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
              <Image src={emptyImg.src} alt={emptyImg.alt} width={emptyImg.width} height={emptyImg.height} loading="lazy" className="h-[240px] w-[240px] object-contain" />
              <h2 className="mt-(--space-4) text-h2 text-secondary">{t(dict, 'col.emptyTitle')}</h2>
              <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'col.emptyBody')}</p>
              <div className="mt-(--space-5) flex flex-col items-center gap-(--space-3) md:flex-row">
                <Link href={`/${lang}/scan/`} className={buttonClass('primary')}>
                  <Icon name="scan" size={20} />
                  <span>{t(dict, 'cta.scan')}</span>
                </Link>
                <Link href={`/${lang}/search/`} className={buttonClass('text')}>{t(dict, 'col.emptySearch')}</Link>
              </div>
            </div>
          }
        >
          {computed ? (
            <>
              <CollectionSummary
                lang={lang}
                dict={dict}
                totalJPY={computed.totalJPY}
                retailTotalJPY={computed.retailTotalJPY}
                itemCount={computed.rows.length}
                generatedAt={computed.cat.meta.generatedAt}
              />

              <ValueChart
                history={computed.history}
                retailTotalJPY={computed.retailTotalJPY}
                lang={lang}
                dict={dict}
              />

              <section className="mt-(--space-6)">
                <div className="flex items-center justify-end">
                  <label className="inline-flex items-center gap-(--space-2) text-small text-text-muted">
                    <span>{t(dict, 'ip.sortLabel')}</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="h-[40px] rounded-(--radius-md) border border-border bg-surface px-(--space-3) text-small text-text"
                    >
                      <option value="value">{t(dict, 'col.sortValue')}</option>
                      <option value="premium">{t(dict, 'col.sortPremium')}</option>
                      <option value="added">{t(dict, 'col.sortAdded')}</option>
                    </select>
                  </label>
                </div>

                <ul className="mt-(--space-4) rounded-(--radius-lg) border border-border bg-surface px-(--space-4) shadow-(--shadow-card)">
                  {computed.rows.map((r) => (
                    <CollectionRow
                      key={r.item.id}
                      item={r.item}
                      goods={r.goods}
                      ip={r.ip}
                      ips={computed.cat.ips}
                      current={r.current}
                      valueJPY={r.valueJPY}
                      lang={lang}
                      dict={dict}
                    />
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </ClientSection>
      </div>
    </div>
  );
}

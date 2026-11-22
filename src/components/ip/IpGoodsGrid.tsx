'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImage } from '@/lib/data/images';
import type { Goods, GoodsType, Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Current } from '@/lib/price/price';
import { Button } from '@/components/ui/Button';
import { GoodsCard } from '@/components/goods/GoodsCard';

export type IpGoodsItem = {
  goods: Goods;
  current: Current;
  premium: number | null;
};

type SortKey = 'premium' | 'release' | 'name';

type Props = {
  lang: Lang;
  dict: Dict;
  ip: Ip;
  items: IpGoodsItem[];
  availableTypes: GoodsType[];
  linkedTypes: GoodsType[];
  fixedType?: GoodsType;
};

function compareReleaseDesc(a: Goods, b: Goods): number {
  if (a.releaseDate && b.releaseDate) return b.releaseDate.localeCompare(a.releaseDate);
  if (a.releaseDate) return -1;
  if (b.releaseDate) return 1;
  return a.id.localeCompare(b.id);
}

export function IpGoodsGrid({
  lang,
  dict,
  ip,
  items,
  availableTypes,
  linkedTypes,
  fixedType,
}: Props) {
  const [selectedType, setSelectedType] = useState<GoodsType | 'all'>(fixedType ?? 'all');
  const [sort, setSort] = useState<SortKey>('premium');
  const emptyImg = getImage('IMG-06', lang);

  const visible = useMemo(() => {
    const filtered =
      fixedType || selectedType === 'all'
        ? items
        : items.filter((item) => item.goods.type === selectedType);

    return [...filtered].sort((a, b) => {
      if (sort === 'name') {
        const na = a.goods.name[lang] || a.goods.original;
        const nb = b.goods.name[lang] || b.goods.original;
        return na.localeCompare(nb, lang);
      }
      if (sort === 'release') {
        return compareReleaseDesc(a.goods, b.goods);
      }
      if (a.premium !== null && b.premium !== null) {
        return b.premium - a.premium || compareReleaseDesc(a.goods, b.goods);
      }
      if (a.premium !== null) return -1;
      if (b.premium !== null) return 1;
      return compareReleaseDesc(a.goods, b.goods);
    });
  }, [items, fixedType, selectedType, sort, lang]);

  const chipClass = (active: boolean) =>
    `inline-flex min-h-[40px] shrink-0 items-center rounded-(--radius-full) border px-(--space-4) text-small font-semibold transition-colors duration-150 ${
      active
        ? 'border-secondary bg-secondary-tint text-secondary'
        : 'border-border bg-surface text-text hover:bg-secondary-tint'
    }`;

  return (
    <section className="mt-(--space-7)">
      <div className="flex flex-col gap-(--space-3) md:flex-row md:items-center md:justify-between">
        <div className="flex flex-nowrap gap-(--space-2) overflow-x-auto pb-(--space-1) md:flex-wrap md:overflow-visible">
          {fixedType ? (
            <Link href={`/${lang}/ip/${ip.slug}/`} className={chipClass(false)}>
              {t(dict, 'ip.filterAll')}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              aria-pressed={selectedType === 'all'}
              className={chipClass(selectedType === 'all')}
            >
              {t(dict, 'ip.filterAll')}
            </button>
          )}

          {(fixedType ? linkedTypes : availableTypes).map((tp) => {
            const active = fixedType ? fixedType === tp : selectedType === tp;
            if (fixedType || linkedTypes.includes(tp)) {
              return (
                <Link
                  key={tp}
                  href={`/${lang}/ip/${ip.slug}/${tp}/`}
                  aria-current={active ? 'page' : undefined}
                  className={chipClass(active)}
                >
                  {t(dict, `type.${tp}`)}
                </Link>
              );
            }
            return (
              <button
                key={tp}
                type="button"
                onClick={() => setSelectedType(tp)}
                aria-pressed={active}
                className={chipClass(active)}
              >
                {t(dict, `type.${tp}`)}
              </button>
            );
          })}
        </div>

        <label className="flex shrink-0 items-center gap-(--space-2) text-small text-text-muted">
          <span>{t(dict, 'ip.sortLabel')}</span>
          <select
            aria-label={t(dict, 'ip.sortLabel')}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-[44px] w-full rounded-(--radius-md) border border-border bg-surface px-(--space-3) text-small text-text md:w-auto"
          >
            <option value="premium">{t(dict, 'ip.sortPremium')}</option>
            <option value="release">{t(dict, 'ip.sortRelease')}</option>
            <option value="name">{t(dict, 'ip.sortName')}</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="mt-(--space-7) flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
          <Image
            src={emptyImg.src}
            alt={emptyImg.alt}
            width={emptyImg.width}
            height={emptyImg.height}
            loading="lazy"
            className="h-auto w-[160px] object-contain"
          />
          <p className="mt-(--space-4) text-body text-text-muted">{t(dict, 'ip.emptyFilter')}</p>
          {!fixedType ? (
            <Button variant="text" onClick={() => setSelectedType('all')} className="mt-(--space-2)">
              {t(dict, 'ip.filterAll')}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-(--space-5) grid grid-cols-2 gap-(--space-4) md:grid-cols-3 md:gap-(--space-5) lg:grid-cols-4">
          {visible.map((item) => (
            <GoodsCard
              key={item.goods.id}
              goods={item.goods}
              ip={ip}
              lang={lang}
              dict={dict}
              current={item.current}
            />
          ))}
        </div>
      )}
    </section>
  );
}

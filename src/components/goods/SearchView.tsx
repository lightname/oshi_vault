'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCatalog } from '@/lib/data/catalogClient';
import { getImage } from '@/lib/data/images';
import type { Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { search } from '@/lib/match/match';
import { currentPrice } from '@/lib/price/price';
import { Button, buttonClass } from '@/components/ui/Button';
import { ClientSection } from '@/components/ui/ClientSection';
import { Icon } from '@/components/ui/icons';
import { GoodsCardSkeleton } from '@/components/ui/Skeleton';
import { GoodsCard } from './GoodsCard';

const subPopState = (cb: () => void) => {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
};
const getUrlQuery = () =>
  typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('q') ?? '';
const getServerQuery = () => '';

type Props = {
  lang: Lang;
  dict: Dict;
  ips: Ip[];
};

export function SearchView({ lang, dict, ips }: Props) {
  const urlQ = useSyncExternalStore(subPopState, getUrlQuery, getServerQuery);
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? urlQ;
  const [debounced, setDebounced] = useState<string | null>(null);
  const activeQuery = debounced ?? urlQ;
  const catalog = useCatalog(true);
  const emptyImg = getImage('IMG-06', lang);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query);
      if (typeof window !== 'undefined') {
        const trimmed = query.trim();
        const url = trimmed
          ? `${window.location.pathname}?q=${encodeURIComponent(trimmed)}`
          : window.location.pathname;
        window.history.replaceState(null, '', url);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [query]);

  const trimmed = activeQuery.trim();

  const results = useMemo(() => {
    if (!trimmed || !catalog.data) return [];
    return search(trimmed, catalog.data, 48);
  }, [trimmed, catalog.data]);

  const ipMap = useMemo(() => {
    const src = catalog.data?.ips ?? ips;
    return new Map(src.map((ip) => [ip.slug, ip]));
  }, [catalog.data, ips]);

  const skeleton = (
    <div className="mt-(--space-6) grid grid-cols-2 gap-(--space-4) md:grid-cols-3 md:gap-(--space-5) lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, idx) => (
        <GoodsCardSkeleton key={idx} />
      ))}
    </div>
  );

  const errorNode = (
    <div className="mt-(--space-6) flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
      <Icon name="alert" size={32} className="text-danger" />
      <p className="mt-(--space-3) text-body text-text">{t(dict, 'search.loadError')}</p>
      <Button variant="secondary" onClick={catalog.retry} className="mt-(--space-4)">
        {t(dict, 'search.reload')}
      </Button>
    </div>
  );

  return (
    <div className="container-main py-(--space-7)">
      <section>
        <h1 className="text-h2 text-secondary">{t(dict, 'search.h1')}</h1>
        <div className="relative mt-(--space-4) max-w-[520px]">
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute left-(--space-3) top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={t(dict, 'home.searchPlaceholder')}
            aria-label={t(dict, 'search.h1')}
            className="h-[52px] w-full rounded-(--radius-md) border border-border bg-surface pl-[44px] pr-(--space-3) text-body text-text transition-colors duration-150 focus:border-2 focus:border-secondary focus:outline-none"
          />
        </div>
      </section>

      {!trimmed ? (
        <section className="mt-(--space-7)">
          <h2 className="text-h3 text-secondary">{t(dict, 'search.browseIp')}</h2>
          <div className="mt-(--space-4) flex flex-wrap gap-(--space-2)">
            {ips.map((ip) => (
              <Link
                key={ip.slug}
                href={`/${lang}/ip/${ip.slug}/`}
                className="inline-flex h-[36px] items-center gap-(--space-2) rounded-(--radius-full) border border-border bg-surface px-(--space-4) text-small font-semibold text-text transition-colors duration-150 hover:bg-secondary-tint hover:text-secondary"
              >
                <span>{ip.name[lang]}</span>
                <span className="text-text-muted tabular-nums">{ip.goodsCount}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <ClientSection
          status={catalog.status}
          skeleton={skeleton}
          error={errorNode}
          isEmpty={results.length === 0}
          empty={
            <div className="mt-(--space-7) flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
              <Image
                src={emptyImg.src}
                alt={emptyImg.alt}
                width={emptyImg.width}
                height={emptyImg.height}
                loading="lazy"
                className="h-auto w-[200px] object-contain"
              />
              <h2 className="mt-(--space-4) text-h3 text-secondary">
                {t(dict, 'search.emptyTitle')}
              </h2>
              <p className="mt-(--space-2) text-body text-text-muted">
                {t(dict, 'search.emptyBody')}
              </p>
              <Link
                href={`/${lang}/scan/?manual=1&name=${encodeURIComponent(trimmed)}`}
                className={buttonClass('secondary', 'mt-(--space-5)')}
              >
                {t(dict, 'search.manualAdd')}
              </Link>
            </div>
          }
        >
          <section className="mt-(--space-6)">
            <p className="text-small text-text-muted tabular-nums">
              {t(dict, 'search.count', { n: results.length })}
            </p>
            <div className="mt-(--space-4) grid grid-cols-2 gap-(--space-4) md:grid-cols-3 md:gap-(--space-5) lg:grid-cols-4">
              {results.map((g) => {
                const ip = ipMap.get(g.ipSlug);
                if (!ip || !catalog.data) return null;
                const cur = currentPrice(
                  g.id,
                  catalog.data.prices,
                  catalog.data.meta.generatedAt
                );
                return (
                  <GoodsCard
                    key={g.id}
                    goods={g}
                    ip={ip}
                    lang={lang}
                    dict={dict}
                    current={cur}
                  />
                );
              })}
            </div>
          </section>
        </ClientSection>
      )}
    </div>
  );
}

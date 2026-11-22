'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Lang } from '@/lib/data/types';
import { useUserData } from '@/lib/storage/useUserData';
import { useCatalog } from '@/lib/data/catalogClient';
import { currentPrice, wishReached } from '@/lib/price/price';
import { Icon } from '@/components/ui/icons';
import { LanguageSelect } from './LanguageSelect';

type Props = {
  lang: Lang;
  dict: Dict;
  guideCount: number;
};

export function Header({ lang, dict, guideCount }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useUserData();
  const hasTargets =
    user.status === 'ready' && user.doc.wishlist.some((w) => w.targetPrice !== null);
  const catalog = useCatalog(hasTargets);

  let reachedCount = 0;
  if (hasTargets && catalog.status === 'ready' && catalog.data) {
    const { prices, meta } = catalog.data;
    reachedCount = user.doc.wishlist.filter((w) =>
      wishReached(w, currentPrice(w.goodsId, prices, meta.generatedAt))
    ).length;
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const navItems = [
    { href: `/${lang}/ip/`, label: t(dict, 'nav.ip') },
    ...(guideCount > 0 ? [{ href: `/${lang}/guides/`, label: t(dict, 'nav.guides') }] : []),
    { href: `/${lang}/tools/premium-calculator/`, label: t(dict, 'nav.calculator') },
    { href: `/${lang}/scan/`, label: t(dict, 'nav.scan') },
  ];

  const wishlistLink = (
    <Link
      href={`/${lang}/wishlist/`}
      aria-label={
        reachedCount > 0
          ? `${t(dict, 'nav.wishlist')} (${t(dict, 'nav.wishlistBadge', { n: reachedCount })})`
          : t(dict, 'nav.wishlist')
      }
      className="relative inline-flex h-[44px] w-[44px] items-center justify-center rounded-(--radius-md) text-text transition-colors duration-150 hover:bg-secondary-tint"
    >
      <Icon name="heart" size={24} />
      {reachedCount > 0 ? (
        <span className="absolute right-[4px] top-[4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-(--radius-full) bg-success px-[4px] text-label text-text-on-dark tabular-nums">
          {reachedCount}
        </span>
      ) : null}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="container-main flex h-[56px] items-center justify-between gap-(--space-4) lg:h-[64px]">
        <Link href={`/${lang}/`} className="inline-flex items-center gap-(--space-2) shrink-0">
          <Image
            src="/images/brand/logo-symbol.svg"
            alt=""
            width={32}
            height={32}
            className="h-[28px] w-[28px] lg:h-[32px] lg:w-[32px]"
          />
          <span className="text-[20px] font-bold tracking-[-0.01em] text-secondary">
            Oshi Vault
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-(--space-6) lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-semibold text-text transition-colors duration-150 hover:text-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-(--space-1)">
          <Link
            href={`/${lang}/search/`}
            aria-label={t(dict, 'nav.search')}
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-(--radius-md) text-text transition-colors duration-150 hover:bg-secondary-tint"
          >
            <Icon name="search" size={24} />
          </Link>
          <Link
            href={`/${lang}/collection/`}
            aria-label={t(dict, 'nav.collection')}
            className="hidden h-[44px] w-[44px] items-center justify-center rounded-(--radius-md) text-text transition-colors duration-150 hover:bg-secondary-tint lg:inline-flex"
          >
            <Icon name="shelf" size={24} />
          </Link>
          {wishlistLink}
          <div className="hidden lg:block">
            <LanguageSelect lang={lang} label={t(dict, 'lang.label')} variant="header" />
          </div>
          <button
            type="button"
            aria-label={t(dict, 'nav.menu')}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-(--radius-md) text-text transition-colors duration-150 hover:bg-secondary-tint lg:hidden"
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-text/30"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(dict, 'nav.menu')}
            className="absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col bg-surface p-(--space-5) shadow-(--shadow-raised) transition-transform duration-200 ease-out"
          >
            <div className="flex items-center justify-between pb-(--space-4)">
              <span className="text-[20px] font-bold tracking-[-0.01em] text-secondary">
                Oshi Vault
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-(--radius-md) text-text hover:bg-secondary-tint"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-(--space-2)">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex min-h-[44px] items-center rounded-(--radius-md) px-(--space-3) text-body font-semibold text-text hover:bg-secondary-tint hover:text-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${lang}/collection/`}
                onClick={() => setDrawerOpen(false)}
                className="flex min-h-[44px] items-center gap-(--space-2) rounded-(--radius-md) px-(--space-3) text-body font-semibold text-text hover:bg-secondary-tint hover:text-secondary"
              >
                <Icon name="shelf" size={20} />
                <span>{t(dict, 'nav.collection')}</span>
              </Link>
            </nav>
            <div className="mt-auto pt-(--space-5)">
              <LanguageSelect lang={lang} label={t(dict, 'lang.label')} variant="segment" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

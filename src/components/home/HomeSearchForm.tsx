'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

type ExampleChip = {
  id: string;
  label: string;
  href: string;
};

type Props = {
  lang: Lang;
  dict: Dict;
  examples: ExampleChip[];
  onNavigate?: (url: string) => void;
};

export function HomeSearchForm({ lang, dict, examples, onNavigate }: Props) {
  const [query, setQuery] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const trimmed = query.trim();
    if (!trimmed) {
      e.preventDefault();
      return;
    }
    if (onNavigate) {
      e.preventDefault();
      onNavigate(`/${lang}/search/?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="mt-(--space-5) max-w-[520px]">
      <form
        action={`/${lang}/search/`}
        method="GET"
        onSubmit={onSubmit}
        className="flex flex-col gap-(--space-2) md:relative md:block"
      >
        <div className="relative flex items-center">
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute left-(--space-3) text-text-muted"
          />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(dict, 'home.searchPlaceholder')}
            aria-label={t(dict, 'home.searchPlaceholder')}
            className="h-[52px] w-full rounded-(--radius-md) border border-border bg-surface pl-[44px] pr-(--space-3) text-body text-text transition-colors duration-150 focus:border-2 focus:border-secondary focus:outline-none md:pr-[124px]"
          />
          <div className="hidden md:absolute md:right-[4px] md:top-[4px] md:block">
            <Button type="submit" variant="primary" className="min-h-[44px]">
              {t(dict, 'home.searchButton')}
            </Button>
          </div>
        </div>
        <Button type="submit" variant="primary" className="min-h-[52px] w-full md:hidden">
          {t(dict, 'home.searchButton')}
        </Button>
      </form>

      {examples.length > 0 ? (
        <div className="mt-(--space-3) flex flex-wrap gap-(--space-2)">
          {examples.map((ex) => (
            <Link
              key={ex.id}
              href={ex.href}
              className="max-w-full truncate rounded-(--radius-full) border border-border bg-surface px-(--space-3) py-(--space-1) text-small text-text-muted transition-colors duration-150 hover:bg-secondary-tint hover:text-secondary"
            >
              {ex.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

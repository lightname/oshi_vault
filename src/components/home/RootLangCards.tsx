'use client';

import { useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics/track';
import type { Lang } from '@/lib/data/types';
import { Icon } from '@/components/ui/icons';

type CardCopy = {
  lang: Lang;
  name: string;
  desc: string;
  suggest: string;
};

const noopSub = () => () => {};
const getBrowserLang = (): Lang | null => {
  if (typeof navigator === 'undefined' || !navigator.language) return null;
  const code = navigator.language.slice(0, 2).toLowerCase();
  return code === 'ko' || code === 'en' || code === 'ja' ? code : null;
};
const getServerLang = (): Lang | null => null;

export function RootLangCards({ cards }: { cards: CardCopy[] }) {
  const suggested = useSyncExternalStore(noopSub, getBrowserLang, getServerLang);

  return (
    <div className="grid grid-cols-1 gap-(--space-4) md:grid-cols-3">
      {cards.map((c) => {
        const active = suggested === c.lang;
        return (
          <a
            key={c.lang}
            href={`/${c.lang}/`}
            hrefLang={c.lang}
            onClick={() => track('language_switch', { from_lang: 'root', to_lang: c.lang })}
            className={`relative flex min-h-[96px] items-center justify-between gap-(--space-3) rounded-(--radius-lg) bg-surface p-(--space-5) shadow-(--shadow-card) transition-all duration-150 ease-out hover:border-secondary hover:shadow-(--shadow-raised) ${
              active ? 'border-2 border-primary' : 'border border-border'
            }`}
          >
            {active ? (
              <span className="absolute right-(--space-3) top-(--space-3) rounded-(--radius-sm) bg-primary px-(--space-2) py-[2px] text-label text-text-on-dark">
                {c.suggest}
              </span>
            ) : null}
            <div className={active ? 'pt-(--space-3)' : ''}>
              <h2 className="text-h3 text-secondary">{c.name}</h2>
              <p className="mt-(--space-1) text-small text-text-muted">{c.desc}</p>
            </div>
            <Icon name="chevron-right" size={20} className="shrink-0 text-text-muted" />
          </a>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import type { Lang } from '@/lib/data/types';
import { Icon } from '@/components/ui/icons';

const SELF_NAMES: Record<Lang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

const noopSubscribe = () => () => {};
const getAltsRaw = () =>
  typeof document === 'undefined' ? '' : document.getElementById('lang-alternates')?.textContent ?? '';
const getServerAltsRaw = () => '';

type Props = {
  lang: Lang;
  label: string;
  variant: 'header' | 'segment';
  onDark?: boolean;
};

export function LanguageSelect({ lang, label, variant, onDark = false }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const altsRaw = useSyncExternalStore(noopSubscribe, getAltsRaw, getServerAltsRaw);

  const alts = useMemo<Partial<Record<Lang, string>>>(() => {
    if (!altsRaw) return {};
    try {
      return JSON.parse(altsRaw) as Partial<Record<Lang, string>>;
    } catch {
      return {};
    }
  }, [altsRaw]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const targetHref = (l: Lang) => alts[l] ?? `/${l}/`;
  const onSelect = (to: Lang) => {
    if (to !== lang) track('language_switch', { from_lang: lang, to_lang: to });
    setOpen(false);
  };

  if (variant === 'segment') {
    return (
      <div
        role="group"
        aria-label={label}
        className={`grid grid-cols-3 overflow-hidden rounded-(--radius-md) border ${
          onDark ? 'border-white/25 bg-white/10' : 'border-border bg-surface'
        }`}
      >
        {config.locales.map((l) => {
          const active = l === lang;
          return (
            <a
              key={l}
              href={targetHref(l)}
              hrefLang={l}
              onClick={() => onSelect(l)}
              aria-current={active ? 'true' : undefined}
              className={`flex h-[40px] items-center justify-center px-(--space-2) text-small font-semibold transition-colors duration-150 ${
                active
                  ? 'bg-secondary-tint text-secondary'
                  : onDark
                    ? 'text-text-on-dark hover:bg-white/15'
                    : 'text-text hover:bg-bg'
              }`}
            >
              {SELF_NAMES[l]}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[44px] items-center gap-(--space-1) rounded-(--radius-md) px-(--space-2) text-[15px] font-semibold text-secondary transition-colors duration-150 hover:underline underline-offset-[3px]"
      >
        <Icon name="globe" size={18} />
        <span>{SELF_NAMES[lang]}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-(--space-2) w-[180px] rounded-(--radius-md) border border-border bg-surface p-(--space-1) shadow-(--shadow-raised)"
        >
          {config.locales.map((l) => (
            <a
              key={l}
              role="menuitem"
              href={targetHref(l)}
              hrefLang={l}
              onClick={() => onSelect(l)}
              className="flex min-h-[44px] items-center justify-between rounded-(--radius-sm) px-(--space-3) text-small font-semibold text-text transition-colors duration-150 hover:bg-secondary-tint hover:text-secondary"
            >
              <span>{SELF_NAMES[l]}</span>
              {l === lang ? <Icon name="check" size={16} className="text-secondary" /> : null}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

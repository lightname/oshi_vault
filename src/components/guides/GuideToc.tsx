'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icons';

type TocItem = { id: string; text: string };
type Props = { toc: TocItem[]; label: string; mode: 'mobile' | 'desktop' };

export function GuideToc({ toc, label, mode }: Props) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? '');

  useEffect(() => {
    if (mode !== 'desktop' || toc.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-88px 0px -65% 0px' }
    );
    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [toc, mode]);

  if (toc.length === 0) return null;

  if (mode === 'mobile') {
    return (
      <details className="mb-(--space-5) rounded-(--radius-lg) border border-border bg-surface p-(--space-4) lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between text-h4 text-secondary">
          <span>{label}</span>
          <Icon name="chevron-down" size={18} />
        </summary>
        <ul className="mt-(--space-3) space-y-(--space-2) text-small">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-text-muted hover:text-secondary hover:underline">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <nav aria-label={label} className="sticky top-[88px] hidden w-[240px] shrink-0 lg:block">
      <p className="text-label text-text-muted">{label}</p>
      <ul className="mt-(--space-3) space-y-(--space-2) border-l border-border text-small">
        {toc.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={`-ml-[1px] block border-l-2 py-(--space-1) pl-(--space-3) transition-colors duration-150 ${
                  active
                    ? 'border-primary font-semibold text-secondary'
                    : 'border-transparent text-text-muted hover:text-secondary'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

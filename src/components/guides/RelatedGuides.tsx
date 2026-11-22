'use client';

import Image from 'next/image';
import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';

export type GuideSummary = {
  slug: string;
  title: string;
  description: string;
  cover: { src: string; width: number; height: number; alt: string };
};

type Props = {
  guides: GuideSummary[];
  lang: Lang;
  dict: Dict;
  title?: string;
};

export function RelatedGuides({ guides, lang, dict, title }: Props) {
  if (guides.length === 0) return null;

  return (
    <section className="mt-(--space-8)">
      <h2 className="text-h3 text-secondary">{title ?? t(dict, 'related.guidesTitle')}</h2>
      <div className="mt-(--space-4) grid grid-cols-1 gap-(--space-4)">
        {guides.slice(0, 3).map((g) => (
          <Link
            key={g.slug}
            href={`/${lang}/guides/${g.slug}/`}
            onClick={() =>
              track('internal_link_click', {
                block: 'related_guides',
                target_screen_id: 'S-11',
              })
            }
            className="flex items-start gap-(--space-4) rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card) transition-all duration-150 ease-out hover:border-secondary hover:shadow-(--shadow-raised)"
          >
            <Image
              src={g.cover.src}
              alt={g.cover.alt}
              width={g.cover.width}
              height={g.cover.height}
              loading="lazy"
              className="aspect-video w-[96px] shrink-0 rounded-(--radius-sm) object-cover md:w-[120px]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-h4 text-secondary">{g.title}</h3>
              <p className="mt-(--space-1) line-clamp-2 text-small text-text-muted">
                {g.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

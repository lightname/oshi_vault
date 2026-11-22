import Image from 'next/image';
import Link from 'next/link';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { buttonClass } from '@/components/ui/Button';

export type GuideCardItem = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  cover: { src: string; width: number; height: number; alt: string };
};

type Props = {
  lang: Lang;
  dict: Dict;
  guides: GuideCardItem[];
};

export function GuidesListView({ lang, dict, guides }: Props) {
  const banner = getImage('IMG-11', lang);

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'guides.h1') },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-h1 text-secondary">{t(dict, 'guides.h1')}</h1>
          <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'guides.lead')}</p>
        </div>
        <div className="hidden justify-end md:flex lg:col-span-5">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            loading="lazy"
            className="h-auto w-[320px] object-contain"
          />
        </div>
      </section>

      {guides.length === 0 ? (
        <section className="mt-(--space-7) flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            loading="lazy"
            className="h-auto w-[240px] object-contain"
          />
          <h2 className="mt-(--space-4) text-h2 text-secondary">{t(dict, 'guides.emptyTitle')}</h2>
          <div className="mt-(--space-5)">
            <Link href={`/${lang}/ip/`} className={buttonClass('secondary')}>
              {t(dict, 'guides.emptyCta')}
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-(--space-7) grid grid-cols-1 gap-(--space-5) md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/${lang}/guides/${g.slug}/`}
              className="group overflow-hidden rounded-(--radius-lg) border border-border bg-surface shadow-(--shadow-card) transition-shadow duration-200 ease-out hover:shadow-(--shadow-raised)"
            >
              <div className="overflow-hidden">
                <Image
                  src={g.cover.src}
                  alt={g.cover.alt}
                  width={g.cover.width}
                  height={g.cover.height}
                  loading="lazy"
                  className="aspect-video h-auto w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-(--space-4)">
                <h2 className="text-h3 text-secondary">{g.title}</h2>
                <p className="mt-(--space-2) line-clamp-3 text-small text-text-muted">
                  {g.description}
                </p>
                <p className="mt-(--space-3) text-small text-text-muted tabular-nums">
                  {t(dict, 'guides.updated', { date: formatDate(g.updated, lang) })}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

import Image from 'next/image';
import { ipColor } from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Ip, Lang } from '@/lib/data/types';
import { formatPercent } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Breadcrumb, type Crumb } from '@/components/ui/Breadcrumb';

type Props = {
  lang: Lang;
  dict: Dict;
  ip: Ip;
  crumbs: Crumb[];
  heading: string;
  lead: string;
  totalCount: number;
  pricedCount: number;
  avgPremium: number | null;
};

export function IpHubHeader({
  lang,
  dict,
  ip,
  crumbs,
  heading,
  lead,
  totalCount,
  pricedCount,
  avgPremium,
}: Props) {
  const banner = getImage('IMG-04', lang);
  const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
  const avgColor =
    avgPremium === null
      ? 'text-text-muted'
      : Math.round(avgPremium * 100) > 0
        ? 'text-success'
        : Math.round(avgPremium * 100) < 0
          ? 'text-danger'
          : 'text-text-muted';

  return (
    <>
      <Breadcrumb items={crumbs} label={t(dict, 'a11y.breadcrumb')} />

      <section className="grid grid-cols-1 items-center gap-(--space-6) md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="flex items-start gap-(--space-4)">
            <span
              aria-hidden="true"
              style={{ backgroundColor: ipColor(ip) }}
              className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-(--radius-full) text-[24px] font-bold text-text-on-dark"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <h1 className="text-h1 text-secondary">{heading}</h1>
              <p className="mt-(--space-1) text-small text-text-muted">{ip.original}</p>
              <p className="text-small text-text-muted">{ip.owner}</p>
            </div>
          </div>
          <p className="mt-(--space-4) text-body text-text-muted">{lead}</p>
        </div>
        <div className="hidden justify-end md:col-span-4 md:flex">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            loading="lazy"
            className="h-auto w-[200px] object-contain lg:w-[280px]"
          />
        </div>
      </section>

      <section className="mt-(--space-6) grid grid-cols-3 gap-(--space-3) md:gap-(--space-4)">
        <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)">
          <p className="text-h2 text-secondary tabular-nums">{totalCount}</p>
          <p className="mt-(--space-1) text-small text-text-muted">{t(dict, 'ip.statGoods')}</p>
        </div>
        <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)">
          <p className="text-h2 text-secondary tabular-nums">{pricedCount}</p>
          <p className="mt-(--space-1) text-small text-text-muted">{t(dict, 'ip.statPriced')}</p>
        </div>
        <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)">
          <p className={`text-h2 tabular-nums ${avgColor}`}>
            {avgPremium !== null ? formatPercent(avgPremium) : '—'}
          </p>
          <p className="mt-(--space-1) text-small text-text-muted">
            {t(dict, 'ip.statAvgPremium')}
          </p>
        </div>
      </section>
    </>
  );
}

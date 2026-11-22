import Image from 'next/image';
import Link from 'next/link';
import { ipColor } from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Chip } from '@/components/ui/Chip';

type Props = {
  lang: Lang;
  dict: Dict;
  ips: Ip[];
};

export function IpListView({ lang, dict, ips }: Props) {
  const banner = getImage('IMG-04', lang);

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        label={t(dict, 'a11y.breadcrumb')}
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'ip.listH1') },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-h1 text-secondary">{t(dict, 'ip.listH1')}</h1>
          <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'ip.listLead')}</p>
        </div>
        <div className="hidden justify-end md:flex lg:col-span-5">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            loading="lazy"
            className="h-auto w-[360px] object-contain"
          />
        </div>
      </section>

      <section className="mt-(--space-7) grid grid-cols-1 gap-(--space-4) md:grid-cols-2 md:gap-(--space-5) lg:grid-cols-3">
        {ips.map((ip) => {
          const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
          return (
            <Link
              key={ip.slug}
              href={`/${lang}/ip/${ip.slug}/`}
              className="flex items-start gap-(--space-4) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card) transition-all duration-150 ease-out hover:border-secondary hover:shadow-(--shadow-raised)"
            >
              <span
                aria-hidden="true"
                style={{ backgroundColor: ipColor(ip) }}
                className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-(--radius-full) text-[20px] font-bold text-text-on-dark"
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-h3 text-secondary">{ip.name[lang]}</h2>
                <p className="mt-(--space-1) truncate text-small text-text-muted">{ip.original}</p>
                <div className="mt-(--space-3) flex flex-wrap items-center gap-(--space-2)">
                  <Chip>{t(dict, `ip.category.${ip.category}`)}</Chip>
                  <span className="text-small text-text-muted tabular-nums">
                    {t(dict, 'ip.goodsCount', { n: ip.goodsCount })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

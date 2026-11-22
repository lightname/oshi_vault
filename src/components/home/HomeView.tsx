import Image from 'next/image';
import Link from 'next/link';
import { getImage } from '@/lib/data/images';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Current } from '@/lib/price/price';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { GoodsCard } from '@/components/goods/GoodsCard';
import { RelatedGuides, type GuideSummary } from '@/components/guides/RelatedGuides';
import { HomeSearchForm } from './HomeSearchForm';

export type FeaturedItem = {
  goods: Goods;
  ip: Ip;
  current: Current;
};

type Props = {
  lang: Lang;
  dict: Dict;
  generatedAt: string;
  usePremiumHeading: boolean;
  examples: { id: string; label: string; href: string }[];
  featured: FeaturedItem[];
  ips: Ip[];
  howToReadHref: string;
  guides: GuideSummary[];
};

export function HomeView({
  lang,
  dict,
  generatedAt,
  usePremiumHeading,
  examples,
  featured,
  ips,
  howToReadHref,
  guides,
}: Props) {
  const heroImg = getImage('IMG-01', lang);
  const scanImg = getImage('IMG-07', lang);
  const wishImg = getImage('IMG-09', lang);

  return (
    <>
      <section className="bg-bg py-(--space-8)">
        <div className="container-main grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-label text-primary">{t(dict, 'home.eyebrow')}</p>
            <h1 className="mt-(--space-2) text-h1 text-secondary">{t(dict, 'home.h1')}</h1>
            <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'home.lead')}</p>
            <HomeSearchForm lang={lang} dict={dict} examples={examples} />
          </div>
          <div className="flex justify-center md:justify-end lg:col-span-6">
            <Image
              src={heroImg.src}
              alt={heroImg.alt}
              width={heroImg.width}
              height={heroImg.height}
              priority
              className="h-auto w-full max-w-[320px] object-contain md:w-[360px] md:max-w-none lg:w-full"
            />
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="container-main">
          <h2 className="text-h2 text-secondary">
            {t(dict, usePremiumHeading ? 'home.premiumTitle' : 'home.recentTitle')}
          </h2>
          <p className="mt-(--space-1) text-small text-text-muted">
            {t(dict, 'home.premiumSub', { date: formatDate(generatedAt, lang) })}
          </p>
          <div className="mt-(--space-5) grid grid-cols-2 gap-(--space-4) md:grid-cols-3 md:gap-(--space-5) lg:grid-cols-4">
            {featured.map(({ goods, ip, current }) => (
              <GoodsCard key={goods.id} goods={goods} ip={ip} lang={lang} dict={dict} current={current} />
            ))}
          </div>
          <div className="mt-(--space-6) text-center">
            <Link href={`/${lang}/ip/`} className={buttonClass('text')}>
              {t(dict, 'home.allIp')}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface section-gap">
        <div className="container-main grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
          <div className="flex justify-center lg:col-span-6">
            <Image
              src={scanImg.src}
              alt={scanImg.alt}
              width={scanImg.width}
              height={scanImg.height}
              loading="lazy"
              className="h-auto w-full max-w-[420px] object-contain"
            />
          </div>
          <div className="lg:col-span-6">
            <h2 className="text-h2 text-secondary">{t(dict, 'home.shelfTitle')}</h2>
            <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'home.shelfBody')}</p>
            <div className="mt-(--space-5)">
              <Link href={`/${lang}/scan/`} className={buttonClass('secondary')}>
                <Icon name="scan" size={20} />
                <span>{t(dict, 'cta.scan')}</span>
              </Link>
            </div>
            <StorageNote dict={dict} className="mt-(--space-3)" />
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="container-main">
          <h2 className="text-h2 text-secondary">{t(dict, 'home.ipTitle')}</h2>
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
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="container-main grid grid-cols-1 items-center gap-(--space-6) md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-h2 text-secondary">{t(dict, 'home.wishTitle')}</h2>
            <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'home.wishBody')}</p>
            <div className="mt-(--space-4)">
              <Link href={`/${lang}/wishlist/`} className={buttonClass('text')}>
                {t(dict, 'home.toWishlist')}
              </Link>
            </div>
          </div>
          <div className="hidden justify-end md:col-span-4 md:flex">
            <Image
              src={wishImg.src}
              alt={wishImg.alt}
              width={wishImg.width}
              height={wishImg.height}
              loading="lazy"
              className="h-auto w-[240px] object-contain"
            />
          </div>
        </div>
      </section>

      <section className="section-gap pt-0">
        <div className="container-main">
          <h2 className="text-h2 text-secondary">{t(dict, 'home.howTitle')}</h2>
          <div className="mt-(--space-5) grid grid-cols-1 gap-(--space-4) md:grid-cols-3">
            {(
              [
                ['calculator', 'home.how1Title', 'home.how1Body'],
                ['shelf', 'home.how2Title', 'home.how2Body'],
                ['book', 'home.how3Title', 'home.how3Body'],
              ] as const
            ).map(([icon, tk, bk]) => (
              <div
                key={tk}
                className="rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)"
              >
                <Icon name={icon} size={32} className="text-secondary" />
                <h3 className="mt-(--space-3) text-h4 text-secondary">{t(dict, tk)}</h3>
                <p className="mt-(--space-2) text-small text-text-muted">{t(dict, bk)}</p>
              </div>
            ))}
          </div>
          <div className="mt-(--space-5)">
            <Link href={howToReadHref} className={buttonClass('text')}>
              {t(dict, 'trust.howToRead')}
            </Link>
          </div>

          <RelatedGuides guides={guides} lang={lang} dict={dict} title={t(dict, 'home.guidesTitle')} />
        </div>
      </section>
    </>
  );
}

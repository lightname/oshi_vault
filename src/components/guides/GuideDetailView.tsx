'use client';

import Image from 'next/image';
import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import type { Guide } from '@/lib/content/content';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { Current } from '@/lib/price/price';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RelatedGoods } from '@/components/goods/RelatedGoods';
import { GuideSlotA, GuideSlotB, type GuideSlotGoods } from './GuideCtaSlots';
import { GUIDE_PROSE_CLASS, splitGuideHtml } from './guideHtml';
import { GuideToc } from './GuideToc';
import { RelatedGuides, type GuideSummary } from './RelatedGuides';

type Props = {
  lang: Lang;
  dict: Dict;
  guide: Guide;
  cover: { src: string; width: number; height: number; alt: string };
  slotGoods: GuideSlotGoods[];
  primaryIp: Ip | null;
  relatedGoods: { goods: Goods; current: Current }[];
  relatedIps: Ip[];
  otherGuides: GuideSummary[];
};

export function GuideDetailView({
  lang,
  dict,
  guide,
  cover,
  slotGoods,
  primaryIp,
  relatedGoods,
  relatedIps,
  otherGuides,
}: Props) {
  const [beforeSlotA, afterSlotA] = splitGuideHtml(guide.html);

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'guides.h1'), href: `/${lang}/guides/` },
          { label: guide.title },
        ]}
      />

      <div className="max-w-[720px]">
        <h1 className="text-h1 text-secondary">{guide.title}</h1>
        <p className="mt-(--space-2) text-small text-text-muted tabular-nums">
          {t(dict, 'guides.updated', { date: formatDate(guide.updated, lang) })}
        </p>
        <div className="mt-(--space-5) overflow-hidden rounded-(--radius-lg)">
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            loading="lazy"
            className="aspect-video h-auto w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-(--space-6) flex flex-col gap-(--space-7) lg:flex-row lg:items-start">
        <article className="min-w-0 flex-1 max-w-[720px]">
          <GuideToc toc={guide.toc} label={t(dict, 'guide.toc')} mode="mobile" />
          <div className={GUIDE_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: beforeSlotA }} />
          <GuideSlotA items={slotGoods} slug={guide.slug} lang={lang} dict={dict} />
          {afterSlotA ? (
            <div className={GUIDE_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: afterSlotA }} />
          ) : null}
          <GuideSlotB
            endCta={guide.endCta}
            items={slotGoods}
            slug={guide.slug}
            lang={lang}
            dict={dict}
          />
        </article>

        <GuideToc toc={guide.toc} label={t(dict, 'guide.toc')} mode="desktop" />
      </div>

      {primaryIp && relatedGoods.length > 0 ? (
        <RelatedGoods
          lang={lang}
          dict={dict}
          ip={primaryIp}
          items={relatedGoods}
          title={t(dict, 'guide.relatedGoods')}
          max={4}
        />
      ) : null}

      {relatedIps.length > 0 ? (
        <section className="mt-(--space-7)">
          <h2 className="text-h3 text-secondary">{t(dict, 'guide.relatedIps')}</h2>
          <div className="mt-(--space-3) flex flex-wrap gap-(--space-2)">
            {relatedIps.map((ip) => (
              <Link
                key={ip.slug}
                href={`/${lang}/ip/${ip.slug}/`}
                onClick={() =>
                  track('internal_link_click', { block: 'related_ips', target_screen_id: 'S-03' })
                }
                className="inline-flex h-[36px] items-center gap-(--space-2) rounded-(--radius-full) border border-border bg-surface px-(--space-4) text-small font-semibold text-text transition-colors duration-150 hover:bg-secondary-tint hover:text-secondary"
              >
                <span>{ip.name[lang]}</span>
                <span className="text-text-muted tabular-nums">{ip.goodsCount}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <RelatedGuides guides={otherGuides} lang={lang} dict={dict} />
    </div>
  );
}

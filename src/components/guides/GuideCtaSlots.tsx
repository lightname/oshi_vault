'use client';

import Image from 'next/image';
import Link from 'next/link';
import { anyAffiliate } from '@/lib/affiliate/marketLink';
import { track } from '@/lib/analytics/track';
import type { Guide } from '@/lib/content/content';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { formatLocalMoney, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { premiumRatio, type Current } from '@/lib/price/price';
import { useUserData } from '@/lib/storage/useUserData';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { GoodsPlaceholder } from '@/components/goods/GoodsPlaceholder';
import { MarketButtons } from '@/components/goods/MarketButtons';
import { PremiumBadge } from '@/components/goods/PremiumBadge';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';

export type GuideSlotGoods = {
  goods: Goods;
  ip: Ip;
  current: NonNullable<Current>;
};

export function GuideSlotA({
  items,
  slug,
  lang,
  dict,
}: {
  items: GuideSlotGoods[];
  slug: string;
  lang: Lang;
  dict: Dict;
}) {
  if (items.length === 0) return null;
  const showAffiliate = anyAffiliate();

  return (
    <div
      className="my-(--space-6) space-y-(--space-4)"
      onClick={() => track('guide_cta_click', { guide_slug: slug, cta: 'primary' })}
    >
      {showAffiliate ? <p className="text-small text-text-muted">{t(dict, 'footer.affiliate')}</p> : null}
      <div className="grid grid-cols-1 gap-(--space-4)">
        {items.slice(0, 2).map(({ goods, ip, current }, idx) => {
          const displayName = goods.name[lang] || goods.original;
          const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
          return (
            <div
              key={goods.id}
              className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)"
            >
              <div className="flex items-start gap-(--space-4)">
                <div className="h-[96px] w-[96px] shrink-0 overflow-hidden rounded-(--radius-md)">
                  <GoodsPlaceholder
                    ipColor={ipColor(ip)}
                    ipInitial={initial}
                    type={goods.type}
                    size={96}
                    label={displayName}
                    className="h-[96px] w-[96px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label text-text-muted">{ip.name[lang]}</p>
                  <Link
                    href={goodsPath(lang, goods)}
                    className="mt-(--space-1) block text-h4 text-secondary hover:underline"
                  >
                    {displayName}
                  </Link>
                  <p className="mt-(--space-1) text-small text-text-muted tabular-nums">
                    {t(dict, 'goods.retail', {
                      price: formatMoney(goods.retail.price, goods.retail.currency, lang),
                    })}
                  </p>
                  <div className="mt-(--space-2) flex flex-wrap items-center gap-(--space-2)">
                    <span className="text-[16px] font-bold text-text tabular-nums">
                      {formatLocalMoney(current.jpy, lang)}
                    </span>
                    <PremiumBadge ratio={premiumRatio(current.jpy, goods.retail)} />
                  </div>
                </div>
              </div>
              <div className="mt-(--space-4)">
                <MarketButtons
                  goods={goods}
                  lang={lang}
                  dict={dict}
                  markets={current.markets.slice(0, 1)}
                  primaryFirst={idx === 0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GuideSlotB({
  endCta,
  items,
  slug,
  lang,
  dict,
}: {
  endCta: Guide['endCta'];
  items: GuideSlotGoods[];
  slug: string;
  lang: Lang;
  dict: Dict;
}) {
  const user = useUserData();

  if (endCta === 'primary') {
    return <GuideSlotA items={items} slug={slug} lang={lang} dict={dict} />;
  }

  if (endCta === 'secondary') {
    const watches = user.doc.wishlist
      .filter((w) => w.targetPrice !== null)
      .map((w) => ({ goodsId: w.goodsId, targetPrice: w.targetPrice!, currency: w.currency }));
    return (
      <div
        className="my-(--space-6)"
        onClick={() => track('guide_cta_click', { guide_slug: slug, cta: 'secondary' })}
      >
        <SubscribeBox lang={lang} dict={dict} topic="target_price" watches={watches} />
      </div>
    );
  }

  if (endCta === 'scan') {
    const img = getImage('IMG-07', lang);
    return (
      <div className="my-(--space-6) flex flex-col items-start gap-(--space-4) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card) md:flex-row md:items-center">
        <Image src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" className="h-auto w-[120px] shrink-0 object-contain" />
        <div className="flex-1">
          <p className="text-body font-semibold text-secondary">{t(dict, 'scan.lead')}</p>
          <div className="mt-(--space-3)">
            <Link
              href={`/${lang}/scan/`}
              onClick={() => track('guide_cta_click', { guide_slug: slug, cta: 'secondary' })}
              className={buttonClass('primary')}
            >
              <Icon name="scan" size={20} />
              <span>{t(dict, 'cta.scan')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shelfImg = getImage('IMG-08', lang);
  return (
    <div className="my-(--space-6) flex flex-col items-start gap-(--space-4) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card) md:flex-row md:items-center">
      <Image src={shelfImg.src} alt={shelfImg.alt} width={shelfImg.width} height={shelfImg.height} loading="lazy" className="h-auto w-[120px] shrink-0 object-contain" />
      <div className="flex-1">
        <p className="text-body font-semibold text-secondary">{t(dict, 'home.shelfBody')}</p>
        <div className="mt-(--space-3)">
          <Link
            href={`/${lang}/search/`}
            onClick={() => track('guide_cta_click', { guide_slug: slug, cta: 'secondary' })}
            className={buttonClass('secondary')}
          >
            {t(dict, 'col.emptySearch')}
          </Link>
        </div>
      </div>
    </div>
  );
}

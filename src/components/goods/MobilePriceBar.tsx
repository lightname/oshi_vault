'use client';

import { useEffect, useState } from 'react';
import { hasAffiliate, MARKET_LABEL } from '@/lib/affiliate/marketLink';
import { track } from '@/lib/analytics/track';
import type { Market } from '@/lib/data/types';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { PremiumBadge } from './PremiumBadge';

type Props = {
  goodsId: string;
  ipSlug: string;
  priceText: string;
  ratio: number;
  market: Market;
  ctaLabel: string;
  href: string;
};

export function MobilePriceBar({
  goodsId,
  ipSlug,
  priceText,
  ratio,
  market,
  ctaLabel,
  href,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('price-block-sentinel');
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-(--space-4) py-(--space-2) pb-[calc(var(--space-2)+env(safe-area-inset-bottom))] shadow-(--shadow-raised) transition-all duration-200 ease-out md:hidden">
      <div className="flex min-h-[56px] items-center justify-between gap-(--space-3)">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold leading-[22px] text-text tabular-nums">
            {priceText}
          </p>
          <div className="mt-[2px]">
            <PremiumBadge ratio={ratio} />
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener"
          aria-label={`${ctaLabel} (${MARKET_LABEL[market]})`}
          onClick={() =>
            track('affiliate_click', {
              goods_id: goodsId,
              ip_slug: ipSlug,
              market,
              has_affiliate: hasAffiliate(market),
            })
          }
          className={buttonClass('primary', 'min-h-[52px] shrink-0')}
        >
          <span>{ctaLabel}</span>
          <Icon name="external" size={16} />
        </a>
      </div>
    </div>
  );
}

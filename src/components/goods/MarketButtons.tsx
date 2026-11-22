'use client';

import {
  anyAffiliate,
  hasAffiliate,
  MARKET_LABEL,
  marketUrl,
} from '@/lib/affiliate/marketLink';
import { track } from '@/lib/analytics/track';
import type { Goods, Lang, Market, PriceSnapshot } from '@/lib/data/types';
import { formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

const SEARCH_MARKETS: Exclude<Market, 'other'>[] = ['ebay', 'mercari', 'kream'];

type Props = {
  goods: Goods;
  lang: Lang;
  dict: Dict;
  markets: PriceSnapshot[];
  primaryFirst?: boolean;
};

export function MarketButtons({ goods, lang, dict, markets, primaryFirst = true }: Props) {
  const showAffiliate = anyAffiliate();
  const hasPrices = markets.length > 0;

  const onMarketClick = (market: Market) => {
    track('affiliate_click', {
      goods_id: goods.id,
      ip_slug: goods.ipSlug,
      market,
      has_affiliate: hasAffiliate(market),
    });
  };

  return (
    <div className="space-y-(--space-3)">
      {hasPrices ? (
        <div className="flex flex-col gap-(--space-3) md:flex-row md:flex-wrap">
          {markets.map((m, idx) => {
            const url = marketUrl(goods, m.market, m.sourceUrl);
            if (!url) return null;
            const isPrimary = primaryFirst && idx === 0;
            const label = t(dict, 'cta.primary', { market: MARKET_LABEL[m.market] });
            const priceStr = formatMoney(m.median, m.currency, lang);
            return (
              <div key={m.market} className="flex flex-col gap-(--space-1) md:items-start">
                <a
                  href={url}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  onClick={() => onMarketClick(m.market)}
                  className={buttonClass(
                    isPrimary ? 'primary' : 'secondary',
                    `w-full md:w-auto ${isPrimary ? 'min-h-[52px] md:min-h-[48px]' : ''}`
                  )}
                >
                  <span>{label}</span>
                  <Icon name="external" size={16} />
                </a>
                <span className="text-small text-text-muted tabular-nums">
                  {MARKET_LABEL[m.market]} {priceStr}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-(--space-3) md:flex-row md:flex-wrap">
          {SEARCH_MARKETS.map((m) => {
            const url = marketUrl(goods, m, null);
            if (!url) return null;
            return (
              <a
                key={m}
                href={url}
                target="_blank"
                rel="sponsored nofollow noopener"
                onClick={() => onMarketClick(m)}
                className={buttonClass('secondary', 'w-full md:w-auto')}
              >
                <span>{t(dict, 'cta.searchMarket', { market: MARKET_LABEL[m] })}</span>
                <Icon name="external" size={16} />
              </a>
            );
          })}
        </div>
      )}

      <p className="text-small text-text-muted">
        {t(dict, 'cta.leaveNote')}
        {showAffiliate ? ` ${t(dict, 'footer.affiliate')}` : ''}
      </p>
    </div>
  );
}

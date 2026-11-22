import Image from 'next/image';
import { config } from '@/config';
import { MARKET_LABEL, marketUrl } from '@/lib/affiliate/marketLink';
import { getImage } from '@/lib/data/images';
import type { Goods, Ip, Lang, PriceSnapshot } from '@/lib/data/types';
import { formatDate, formatLocalMoney, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { premiumRatio, toJPY, type Current } from '@/lib/price/price';
import { Icon } from '@/components/ui/icons';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';
import { HowToReadLink } from './HowToReadLink';
import { MarketButtons } from './MarketButtons';
import { MobilePriceBar } from './MobilePriceBar';
import { PremiumBadge } from './PremiumBadge';
import { PriceChart } from './PriceChart';
import { RelatedGoods } from './RelatedGoods';
import { TrustLine } from './TrustLine';

type Props = {
  goods: Goods;
  ip: Ip;
  lang: Lang;
  dict: Dict;
  prices: PriceSnapshot[];
  current: Current;
  howToReadHref: string;
  relatedGoods: { goods: Goods; current: Current }[];
};

export function GoodsPriceSection({
  goods,
  ip,
  lang,
  dict,
  prices,
  current,
  howToReadHref,
  relatedGoods,
}: Props) {
  const displayName = goods.name[lang] || goods.original;

  if (!current) {
    const img = getImage('IMG-05', lang);
    return (
      <>
        <section className="mt-(--space-7) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
          <div className="flex flex-col items-center text-center">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              className="h-auto w-[160px] object-contain md:w-[200px]"
            />
            <h2 className="mt-(--space-4) text-h3 text-secondary">
              {t(dict, 'goods.collectingTitle')}
            </h2>
            <p className="mt-(--space-2) text-body text-text-muted">
              {t(dict, 'goods.collectingBody')}
            </p>
          </div>
          <div className="mt-(--space-5)">
            <MarketButtons goods={goods} lang={lang} dict={dict} markets={[]} />
          </div>
          <div className="mt-(--space-6)">
            <SubscribeBox
              lang={lang}
              dict={dict}
              topic="tracking_request"
              requests={[{ name: displayName, ipName: ip.name.ko, code: goods.code }]}
            />
          </div>
        </section>
        <RelatedGoods lang={lang} dict={dict} ip={ip} items={relatedGoods} />
      </>
    );
  }

  const ratio = premiumRatio(current.jpy, goods.retail);
  const topMarket = current.markets[0];
  const topMarketUrl = topMarket ? marketUrl(goods, topMarket.market, topMarket.sourceUrl) : null;
  const localPrice = formatLocalMoney(current.jpy, lang);
  const sortedRows = [...prices]
    .sort((a, b) => b.date.localeCompare(a.date) || b.samples - a.samples)
    .slice(0, 20);

  return (
    <>
      <section className="mt-(--space-7) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
        <h2 className="text-h2 text-secondary">{t(dict, 'goods.priceTitle')}</h2>
        <p className="mt-(--space-1) text-small text-text-muted">{t(dict, 'home.h1')}</p>

        <div className="mt-(--space-4) flex flex-wrap items-baseline gap-(--space-3)">
          <span className="text-price-xl text-text">{localPrice}</span>
          {topMarket ? (
            <span className="text-small text-text-muted tabular-nums">
              ({formatMoney(topMarket.median, topMarket.currency, lang)})
            </span>
          ) : null}
          <PremiumBadge ratio={ratio} />
          <span className="text-small text-text-muted">{t(dict, 'goods.vsRetail')}</span>
        </div>

        <div className="mt-(--space-3) flex flex-wrap items-center justify-between gap-(--space-2)">
          {topMarket ? (
            <TrustLine snapshot={topMarket} stale={current.stale} lang={lang} dict={dict} />
          ) : null}
          <HowToReadLink href={howToReadHref} label={t(dict, 'trust.howToRead')} />
        </div>

        <div className="mt-(--space-5)">
          <MarketButtons goods={goods} lang={lang} dict={dict} markets={current.markets} />
        </div>
        <div id="price-block-sentinel" aria-hidden="true" className="h-[1px] w-full" />
      </section>

      <section className="mt-(--space-7)">
        <h3 className="mb-(--space-3) text-h3 text-secondary">{t(dict, 'goods.chartTitle')}</h3>
        <PriceChart prices={prices} retail={goods.retail} lang={lang} dict={dict} />
      </section>

      <section className="mt-(--space-7)">
        <h3 className="mb-(--space-3) text-h3 text-secondary">{t(dict, 'goods.tableTitle')}</h3>
        <div className="overflow-x-auto rounded-(--radius-lg) border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full border-collapse text-left text-small">
            <thead className="border-b border-border bg-bg text-text-muted">
              <tr>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colDate')}</th>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colMarket')}</th>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colMedian')}</th>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colConverted')}</th>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colSamples')}</th>
                <th className="px-(--space-3) py-(--space-3) font-semibold">{t(dict, 'goods.colSource')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {sortedRows.map((row) => (
                <tr key={`${row.date}-${row.market}`}>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {formatDate(row.date, lang)}
                  </td>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {MARKET_LABEL[row.market]}
                  </td>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {formatMoney(row.median, row.currency, lang)}
                  </td>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {formatLocalMoney(toJPY(row.median, row.currency), lang)}
                  </td>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {t(dict, 'trust.samples', { n: row.samples })}
                  </td>
                  <td className="whitespace-nowrap px-(--space-3) py-(--space-3)">
                    {row.sourceUrl ? (
                      <a
                        href={row.sourceUrl}
                        target="_blank"
                        rel="nofollow noopener"
                        className="inline-flex items-center gap-[3px] font-semibold text-secondary hover:underline"
                      >
                        <span>{t(dict, 'trust.source')}</span>
                        <Icon name="external" size={14} />
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-(--space-2) text-small text-text-muted">
          {t(dict, 'goods.fxNote', { date: formatDate(config.fx.baseDate, lang) })}
        </p>
      </section>

      {topMarket && topMarketUrl ? (
        <MobilePriceBar
          goodsId={goods.id}
          ipSlug={goods.ipSlug}
          priceText={localPrice}
          ratio={ratio}
          market={topMarket.market}
          ctaLabel={t(dict, 'cta.primary', { market: MARKET_LABEL[topMarket.market] })}
          href={topMarketUrl}
        />
      ) : null}
    </>
  );
}

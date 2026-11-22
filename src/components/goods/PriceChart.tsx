import { config } from '@/config';
import { MARKET_LABEL } from '@/lib/affiliate/marketLink';
import { layout, type Pt } from '@/lib/chart/scale';
import type { Goods, Lang, Market, PriceSnapshot } from '@/lib/data/types';
import { formatDate, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { fromJPY, toJPY } from '@/lib/price/price';

const MARKET_COLOR: Record<Market, string> = {
  ebay: 'var(--color-chart-ebay)',
  mercari: 'var(--color-chart-mercari)',
  kream: 'var(--color-chart-kream)',
  other: 'var(--color-chart-other)',
};

type Props = {
  prices: PriceSnapshot[];
  retail: Goods['retail'];
  lang: Lang;
  dict: Dict;
};

export function PriceChart({ prices, retail, lang, dict }: Props) {
  if (prices.length === 0) return null;

  const cur = config.localeCurrency[lang];
  const convert = (amount: number, from: Goods['retail']['currency']) =>
    fromJPY(toJPY(amount, from), cur);

  const retailLocal = convert(retail.price, retail.currency);
  const byMarket = new Map<Market, (Pt & { samples: number })[]>();
  for (const p of prices) {
    const arr = byMarket.get(p.market) ?? [];
    arr.push({ date: p.date, value: convert(p.median, p.currency), samples: p.samples });
    byMarket.set(p.market, arr);
  }
  const markets = [...byMarket.entries()].map(([m, pts]) => ({
    market: m,
    pts: [...pts].sort((a, b) => a.date.localeCompare(b.date)),
  }));

  const W = 720;
  const H = 280;
  const PAD = { l: 72, r: 56, t: 16, b: 32 };
  const scale = layout(
    markets.map((m) => m.pts),
    retailLocal,
    W,
    H,
    PAD
  );
  const dates = [...new Set(prices.map((p) => p.date))].sort();
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const retailY = scale.y(retailLocal);

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)">
      <div className="mb-(--space-3) flex flex-wrap items-center gap-(--space-4)">
        {markets.map(({ market }) => (
          <span key={market} className="inline-flex items-center gap-(--space-2) text-small text-text">
            <span
              aria-hidden="true"
              style={{ backgroundColor: MARKET_COLOR[market] }}
              className="inline-block h-[8px] w-[8px] rounded-(--radius-full)"
            />
            {MARKET_LABEL[market]}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t(dict, 'goods.chartTitle')}
        className="h-auto w-full"
      >
        {scale.ticks.map((tick, idx) => {
          const yPos = scale.y(tick);
          return (
            <g key={idx}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yPos}
                y2={yPos}
                stroke="var(--color-chart-grid)"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 8}
                y={yPos + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--color-text-muted)"
              >
                {formatMoney(tick, cur, lang)}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={retailY}
          y2={retailY}
          stroke="var(--color-chart-retail)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
        <text
          x={W - PAD.r + 6}
          y={retailY + 4}
          fontSize={11}
          fill="var(--color-chart-retail)"
        >
          {t(dict, 'goods.retailLine')}
        </text>

        {markets.map(({ market, pts }) => (
          <g key={market}>
            {pts.length >= 2 ? (
              <path
                d={scale.path(pts)}
                fill="none"
                stroke={MARKET_COLOR[market]}
                strokeWidth={2}
              />
            ) : null}
            {pts.map((pt) => (
              <g key={`${market}-${pt.date}`} tabIndex={0}>
                <title>
                  {`${formatDate(pt.date, lang)} · ${MARKET_LABEL[market]} · ${formatMoney(pt.value, cur, lang)} · ${t(dict, 'trust.samples', { n: pt.samples })}`}
                </title>
                <circle
                  cx={scale.x(pt.date)}
                  cy={scale.y(pt.value)}
                  r={4}
                  fill={MARKET_COLOR[market]}
                />
              </g>
            ))}
          </g>
        ))}

        <text
          x={scale.x(firstDate)}
          y={H - 8}
          textAnchor={firstDate === lastDate ? 'middle' : 'start'}
          fontSize={11}
          fill="var(--color-text-muted)"
        >
          {formatDate(firstDate, lang)}
        </text>
        {lastDate !== firstDate ? (
          <text
            x={scale.x(lastDate)}
            y={H - 8}
            textAnchor="end"
            fontSize={11}
            fill="var(--color-text-muted)"
          >
            {formatDate(lastDate, lang)}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

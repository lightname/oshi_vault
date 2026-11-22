'use client';

import { config } from '@/config';
import { layout } from '@/lib/chart/scale';
import type { Lang } from '@/lib/data/types';
import { formatDate, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { fromJPY } from '@/lib/price/price';

type Props = {
  history: { date: string; jpy: number }[];
  retailTotalJPY: number;
  lang: Lang;
  dict: Dict;
};

export function ValueChart({ history, retailTotalJPY, lang, dict }: Props) {
  if (history.length < 2) return null;

  const cur = config.localeCurrency[lang];
  const pts = history.map((h) => ({ date: h.date, value: fromJPY(h.jpy, cur) }));
  const retailLocal = fromJPY(retailTotalJPY, cur);

  const W = 720;
  const H = 280;
  const PAD = { l: 72, r: 56, t: 16, b: 32 };
  const scale = layout([pts], retailLocal, W, H, PAD);
  const firstDate = pts[0].date;
  const lastDate = pts[pts.length - 1].date;
  const retailY = scale.y(retailLocal);

  return (
    <section className="mt-(--space-6)">
      <h2 className="text-h3 text-secondary">{t(dict, 'col.chartTitle')}</h2>
      <div className="mt-(--space-3) rounded-(--radius-lg) border border-border bg-surface p-(--space-4) shadow-(--shadow-card)">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t(dict, 'col.chartTitle')}
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
          <text x={W - PAD.r + 6} y={retailY + 4} fontSize={11} fill="var(--color-chart-retail)">
            {t(dict, 'goods.retailLine')}
          </text>

          <path d={scale.path(pts)} fill="none" stroke="var(--color-secondary)" strokeWidth={2} />
          {pts.map((pt) => (
            <g key={pt.date} tabIndex={0}>
              <title>{`${formatDate(pt.date, lang)} · ${formatMoney(pt.value, cur, lang)}`}</title>
              <circle cx={scale.x(pt.date)} cy={scale.y(pt.value)} r={4} fill="var(--color-secondary)" />
            </g>
          ))}

          <text x={scale.x(firstDate)} y={H - 8} textAnchor="start" fontSize={11} fill="var(--color-text-muted)">
            {formatDate(firstDate, lang)}
          </text>
          <text x={scale.x(lastDate)} y={H - 8} textAnchor="end" fontSize={11} fill="var(--color-text-muted)">
            {formatDate(lastDate, lang)}
          </text>
        </svg>
      </div>
    </section>
  );
}

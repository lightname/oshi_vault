'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import type { Currency, Lang } from '@/lib/data/types';
import { formatDate, formatMoney, formatPercent, formatRatio } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { fromJPY, toJPY } from '@/lib/price/price';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

type Props = { lang: Lang; dict: Dict };

const CURRENCIES: Currency[] = ['JPY', 'KRW', 'USD'];
const MAX_AMOUNT = 10_000_000_000;

function parseAmount(raw: string): { value: number | null; invalid: boolean } {
  const trimmed = raw.trim();
  if (trimmed === '') return { value: null, invalid: false };
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT) return { value: null, invalid: true };
  return { value: n, invalid: false };
}

export function CalculatorCard({ lang, dict }: Props) {
  const localCur = config.localeCurrency[lang];
  const [retailRaw, setRetailRaw] = useState('');
  const [retailCur, setRetailCur] = useState<Currency>(localCur);
  const [soldRaw, setSoldRaw] = useState('');
  const [soldCur, setSoldCur] = useState<Currency>(localCur);
  const trackedRef = useRef(false);

  const retailParsed = parseAmount(retailRaw);
  const soldParsed = parseAmount(soldRaw);

  const result = useMemo(() => {
    if (retailParsed.value === null || soldParsed.value === null) return null;
    const retailJPY = toJPY(retailParsed.value, retailCur);
    const soldJPY = toJPY(soldParsed.value, soldCur);
    const ratio = (soldJPY - retailJPY) / retailJPY;
    const diffLocal = fromJPY(soldJPY - retailJPY, localCur);
    const rounded = Math.round(ratio * 100);
    return { ratio, diffLocal, rounded };
  }, [retailParsed.value, soldParsed.value, retailCur, soldCur, localCur]);

  useEffect(() => {
    if (!result || trackedRef.current) return;
    trackedRef.current = true;
    track('calculator_use', { from_currency: retailCur, to_currency: soldCur });
  }, [result, retailCur, soldCur]);

  const inputCls = (invalid: boolean) =>
    `h-[48px] flex-1 rounded-(--radius-md) border bg-surface px-(--space-3) text-body text-text tabular-nums transition-colors duration-150 ${
      invalid ? 'border-danger' : 'border-border focus:border-secondary'
    }`;

  const ratioColor = !result
    ? 'text-text-muted'
    : result.rounded > 0
      ? 'text-success'
      : result.rounded < 0
        ? 'text-danger'
        : 'text-text-muted';

  return (
    <>
      <section className="mt-(--space-6) grid grid-cols-1 gap-(--space-5) lg:grid-cols-12">
        <div className="space-y-(--space-4) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card) lg:col-span-6">
          <div>
            <label htmlFor="calc-retail" className="block text-small font-semibold text-text">
              {t(dict, 'calc.retail')}
            </label>
            <div className="mt-(--space-1) flex gap-(--space-2)">
              <input
                id="calc-retail"
                type="number"
                inputMode="decimal"
                value={retailRaw}
                onChange={(e) => setRetailRaw(e.target.value)}
                aria-invalid={retailParsed.invalid}
                className={inputCls(retailParsed.invalid)}
              />
              <select
                aria-label={`${t(dict, 'calc.retail')} ${t(dict, 'calc.currency')}`}
                value={retailCur}
                onChange={(e) => setRetailCur(e.target.value as Currency)}
                className="h-[48px] rounded-(--radius-md) border border-border bg-surface px-(--space-3) text-body text-text"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {retailParsed.invalid ? (
              <p className="mt-(--space-1) text-small text-danger">{t(dict, 'calc.invalid')}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="calc-sold" className="block text-small font-semibold text-text">
              {t(dict, 'calc.sold')}
            </label>
            <div className="mt-(--space-1) flex gap-(--space-2)">
              <input
                id="calc-sold"
                type="number"
                inputMode="decimal"
                value={soldRaw}
                onChange={(e) => setSoldRaw(e.target.value)}
                aria-invalid={soldParsed.invalid}
                className={inputCls(soldParsed.invalid)}
              />
              <select
                aria-label={`${t(dict, 'calc.sold')} ${t(dict, 'calc.currency')}`}
                value={soldCur}
                onChange={(e) => setSoldCur(e.target.value as Currency)}
                className="h-[48px] rounded-(--radius-md) border border-border bg-surface px-(--space-3) text-body text-text"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {soldParsed.invalid ? (
              <p className="mt-(--space-1) text-small text-danger">{t(dict, 'calc.invalid')}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-(--radius-lg) border-2 border-secondary bg-surface p-(--space-5) shadow-(--shadow-card) lg:col-span-6">
          {result ? (
            <div className="space-y-(--space-3)">
              <p className="text-small text-text-muted">{t(dict, 'calc.premium')}</p>
              <p className={`text-price-xl ${ratioColor}`}>{formatPercent(result.ratio)}</p>
              <div className="flex flex-wrap items-baseline gap-(--space-4)">
                <p className="text-h4 text-text tabular-nums">
                  {t(dict, 'calc.diff')}: {formatMoney(result.diffLocal, localCur, lang)}
                </p>
                <p className="text-small text-text-muted tabular-nums">
                  {t(dict, 'calc.ratio', { x: formatRatio(result.ratio) })}
                </p>
              </div>
              <p className="text-small text-text-muted">
                {t(dict, 'goods.fxNote', { date: formatDate(config.fx.baseDate, lang) })}
              </p>
            </div>
          ) : (
            <p className="text-body text-text-muted">{t(dict, 'calc.placeholder')}</p>
          )}
        </div>
      </section>

      <section className="mt-(--space-5) flex flex-col gap-(--space-3) md:flex-row md:items-center">
        <Link href={`/${lang}/search/`} className={buttonClass('secondary', 'w-full md:w-auto')}>
          <Icon name="search" size={20} />
          <span>{t(dict, 'calc.findGoods')}</span>
        </Link>
        <Link href={`/${lang}/scan/`} className={buttonClass('text', 'w-full md:w-auto')}>
          {t(dict, 'cta.scan')}
        </Link>
      </section>
    </>
  );
}

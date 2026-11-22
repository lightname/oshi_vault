import { config } from '@/config';
import type { Currency, Lang } from '@/lib/data/types';
import { fromJPY } from '@/lib/price/price';

const TAG: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };

export const formatMoney = (amount: number, currency: Currency, lang: Lang): string =>
  new Intl.NumberFormat(TAG[lang], {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);

export const formatLocalMoney = (jpy: number, lang: Lang): string =>
  formatMoney(fromJPY(jpy, config.localeCurrency[lang]), config.localeCurrency[lang], lang);

export function formatPercent(ratio: number): string {
  const n = Math.round(ratio * 100);
  return n > 0 ? `+${n}%` : n < 0 ? `−${Math.abs(n)}%` : '±0%';
}

export const formatDate = (iso: string, lang: Lang): string =>
  new Intl.DateTimeFormat(TAG[lang], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

export const formatRatio = (ratio: number): string => (1 + ratio).toFixed(2);

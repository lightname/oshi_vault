'use client';

import Link from 'next/link';
import type { Lang } from '@/lib/data/types';
import { formatDate, formatLocalMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { PremiumBadge } from '@/components/goods/PremiumBadge';

type Props = {
  lang: Lang;
  dict: Dict;
  totalJPY: number;
  retailTotalJPY: number;
  itemCount: number;
  generatedAt: string;
};

export function CollectionSummary({
  lang,
  dict,
  totalJPY,
  retailTotalJPY,
  itemCount,
  generatedAt,
}: Props) {
  return (
    <section className="rounded-(--radius-lg) border border-border bg-surface p-(--space-6) shadow-(--shadow-card)">
      <div className="flex flex-col gap-(--space-5) lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="text-small text-text-muted">{t(dict, 'col.total')}</p>
          <p className="mt-(--space-1) text-price-xl text-text">
            {formatLocalMoney(totalJPY, lang)}
          </p>
          <div className="mt-(--space-4) grid grid-cols-1 gap-(--space-3) md:grid-cols-3">
            <div>
              <p className="text-small text-text-muted">{t(dict, 'col.retailTotal')}</p>
              <p className="mt-(--space-1) text-h4 text-text tabular-nums">
                {formatLocalMoney(retailTotalJPY, lang)}
              </p>
            </div>
            <div>
              <p className="text-small text-text-muted">{t(dict, 'goods.vsRetail')}</p>
              <div className="mt-(--space-1)">
                {retailTotalJPY > 0 ? (
                  <PremiumBadge ratio={(totalJPY - retailTotalJPY) / retailTotalJPY} />
                ) : (
                  <span className="text-h4 text-text-muted">—</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-small text-text-muted">
                {t(dict, 'col.items', { n: itemCount })}
              </p>
            </div>
          </div>
          <p className="mt-(--space-4) text-small text-text-muted">
            {t(dict, 'col.asOf', { date: formatDate(generatedAt, lang) })}
          </p>
          <StorageNote dict={dict} className="mt-(--space-2)" />
        </div>

        <div className="shrink-0">
          {itemCount >= 3 ? (
            <Link href={`/${lang}/share/`} className={buttonClass('primary', 'w-full lg:w-auto')}>
              <Icon name="share" size={20} />
              <span>{t(dict, 'col.share')}</span>
            </Link>
          ) : (
            <Link href={`/${lang}/scan/`} className={buttonClass('secondary', 'w-full lg:w-auto')}>
              <Icon name="scan" size={20} />
              <span>{t(dict, 'cta.scan')}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

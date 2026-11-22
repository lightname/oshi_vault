import { MARKET_LABEL } from '@/lib/affiliate/marketLink';
import type { Lang, PriceSnapshot } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/icons';

type Props = {
  snapshot: PriceSnapshot;
  stale: boolean;
  lang: Lang;
  dict: Dict;
};

export function TrustLine({ snapshot, stale, lang, dict }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-(--space-2) text-small text-text-muted tabular-nums">
      {stale ? (
        <Chip tone="warning">
          <Icon name="info" size={12} />
          <span>{t(dict, 'trust.stale')}</span>
        </Chip>
      ) : null}
      <span>
        {MARKET_LABEL[snapshot.market]}
        {' · '}
        {t(dict, 'trust.samples', { n: snapshot.samples })}
        {' · '}
        {t(dict, 'trust.asOf', { date: formatDate(snapshot.date, lang) })}
      </span>
      {snapshot.sourceUrl ? (
        <>
          <span aria-hidden="true">·</span>
          <a
            href={snapshot.sourceUrl}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center gap-[3px] font-semibold text-secondary hover:underline"
          >
            <span>{t(dict, 'trust.source')}</span>
            <Icon name="external" size={14} />
          </a>
        </>
      ) : null}
    </div>
  );
}

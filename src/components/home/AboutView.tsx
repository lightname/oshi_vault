import Image from 'next/image';
import { config } from '@/config';
import { anyAffiliate } from '@/lib/affiliate/marketLink';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

type Props = {
  lang: Lang;
  dict: Dict;
  marketsLabel: string;
  goodsCount: number;
};

export function AboutView({ lang, dict, marketsLabel, goodsCount }: Props) {
  const img = getImage('IMG-18', lang);
  const fxDate = formatDate(config.fx.baseDate, lang);
  const showAffiliate = anyAffiliate();

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        label={t(dict, 'a11y.breadcrumb')}
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'about.h1') },
        ]}
      />

      <section className="grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-h1 text-secondary">{t(dict, 'about.h1')}</h1>
          <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'about.lead')}</p>
        </div>
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading="lazy"
            className="h-auto w-full max-w-[280px] object-contain lg:w-[320px] lg:max-w-none"
          />
        </div>
      </section>

      <div className="mt-(--space-7) max-w-[720px] space-y-(--space-7)">
        <section>
          <h2 className="text-h2 text-secondary">{t(dict, 'about.sourcesTitle')}</h2>
          <p className="mt-(--space-3) text-body text-text">
            {t(dict, 'about.sourcesBody', { markets: marketsLabel })}
          </p>
        </section>

        <section>
          <h2 className="text-h2 text-secondary">{t(dict, 'about.methodTitle')}</h2>
          <p className="mt-(--space-3) text-body text-text">{t(dict, 'about.methodBody1')}</p>
          <div className="mt-(--space-3) rounded-(--radius-md) border border-border bg-surface p-(--space-4) text-body font-semibold text-secondary">
            {t(dict, 'about.methodBody2')}
          </div>
          <p className="mt-(--space-3) text-body text-text">
            {t(dict, 'about.methodBody3', { date: fxDate })}
          </p>
        </section>

        <section>
          <h2 className="text-h2 text-secondary">{t(dict, 'about.updateTitle')}</h2>
          <p className="mt-(--space-3) text-body text-text">{t(dict, 'about.updateBody')}</p>
        </section>

        <section>
          <h2 className="text-h2 text-secondary">{t(dict, 'about.limitsTitle')}</h2>
          <ul className="mt-(--space-3) list-disc space-y-(--space-2) pl-(--space-5) text-body text-text">
            <li>{t(dict, 'about.limitsBody1', { n: goodsCount })}</li>
            <li>{t(dict, 'about.limitsBody2', { days: config.price.staleDays })}</li>
            <li>{t(dict, 'about.limitsBody3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-h2 text-secondary">{t(dict, 'about.unofficialTitle')}</h2>
          <p className="mt-(--space-3) text-body text-text">{t(dict, 'footer.unofficial')}</p>
          {showAffiliate ? (
            <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'footer.affiliate')}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

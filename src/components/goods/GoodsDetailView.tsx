import Link from 'next/link';
import { config } from '@/config';
import { ipColor } from '@/lib/data/catalog';
import type { Goods, Ip, Lang, PriceSnapshot } from '@/lib/data/types';
import { formatDate, formatLocalMoney, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { toJPY, type Current } from '@/lib/price/price';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/icons';
import { RelatedGuides, type GuideSummary } from '@/components/guides/RelatedGuides';
import { GoodsActions } from './GoodsActions';
import { GoodsPlaceholder } from './GoodsPlaceholder';
import { GoodsPriceSection } from './GoodsPriceSection';
import { GoodsSubscribe } from './GoodsSubscribe';
import { RelatedGoods } from './RelatedGoods';

type Props = {
  goods: Goods;
  ip: Ip;
  lang: Lang;
  dict: Dict;
  prices: PriceSnapshot[];
  current: Current;
  limitGuideHref: string | null;
  howToReadHref: string;
  relatedGoods: { goods: Goods; current: Current }[];
  relatedGuides: GuideSummary[];
};

export function GoodsDetailView({
  goods,
  ip,
  lang,
  dict,
  prices,
  current,
  limitGuideHref,
  howToReadHref,
  relatedGoods,
  relatedGuides,
}: Props) {
  const displayName = goods.name[lang] || goods.original;
  const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
  const localeCur = config.localeCurrency[lang];
  const retailStr = formatMoney(goods.retail.price, goods.retail.currency, lang);
  const retailLocalStr =
    goods.retail.currency !== localeCur
      ? formatLocalMoney(toJPY(goods.retail.price, goods.retail.currency), lang)
      : null;
  const limitLabel = t(dict, `limit.${goods.limit}`);
  const note = goods.note[lang];

  return (
    <div className="container-main py-(--space-7)">
      <Breadcrumb
        label={t(dict, 'a11y.breadcrumb')}
        items={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: ip.name[lang], href: `/${lang}/ip/${ip.slug}/` },
          { label: displayName },
        ]}
      />

      <section className="grid grid-cols-1 gap-(--space-6) md:grid-cols-8 lg:grid-cols-12">
        <div className="mx-auto w-full max-w-[280px] md:col-span-4 md:max-w-none lg:col-span-5">
          <div className="overflow-hidden rounded-(--radius-lg) border border-border bg-surface">
            <GoodsPlaceholder
              ipColor={ipColor(ip)}
              ipInitial={initial}
              type={goods.type}
              size={480}
              label={displayName}
              className="aspect-square h-auto w-full"
            />
          </div>
        </div>

        <div className="md:col-span-4 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-(--space-2)">
            <Link
              href={`/${lang}/ip/${ip.slug}/`}
              className="text-label text-secondary hover:underline"
            >
              {ip.name[lang]}
            </Link>
            {limitGuideHref ? (
              <Link href={limitGuideHref}>
                <Chip tone="selected">{limitLabel}</Chip>
              </Link>
            ) : (
              <span title={limitLabel}>
                <Chip tone="selected">{limitLabel}</Chip>
              </span>
            )}
          </div>

          <h1 className="mt-(--space-2) text-h1 text-secondary">{displayName}</h1>
          {goods.original !== displayName ? (
            <p className="mt-(--space-1) text-body text-text-muted">{goods.original}</p>
          ) : null}

          <dl className="mt-(--space-5) divide-y divide-border border-y border-border text-small">
            {goods.code ? (
              <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
                <dt className="text-text-muted">{t(dict, 'goods.code')}</dt>
                <dd className="col-span-2 font-semibold text-text tabular-nums">{goods.code}</dd>
              </div>
            ) : null}
            {goods.maker ? (
              <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
                <dt className="text-text-muted">{t(dict, 'goods.maker')}</dt>
                <dd className="col-span-2 text-text">{goods.maker}</dd>
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
              <dt className="text-text-muted">{t(dict, 'goods.type')}</dt>
              <dd className="col-span-2 text-text">{t(dict, `type.${goods.type}`)}</dd>
            </div>
            {goods.releaseDate ? (
              <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
                <dt className="text-text-muted">{t(dict, 'goods.release')}</dt>
                <dd className="col-span-2 text-text tabular-nums">
                  {formatDate(goods.releaseDate, lang)}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
              <dt className="text-text-muted">{t(dict, 'goods.retailPrice')}</dt>
              <dd className="col-span-2 font-semibold text-text tabular-nums">
                {retailStr}
                {retailLocalStr ? (
                  <span className="ml-(--space-2) font-normal text-text-muted">
                    ({retailLocalStr})
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
              <dt className="text-text-muted">{t(dict, 'goods.seller')}</dt>
              <dd className="col-span-2 flex flex-wrap items-center gap-(--space-2) text-text">
                <span>{goods.seller}</span>
                <Chip>{t(dict, `status.${goods.status}`)}</Chip>
                <a
                  href={goods.officialUrl}
                  target="_blank"
                  rel="nofollow noopener"
                  className="inline-flex items-center gap-[3px] font-semibold text-secondary hover:underline"
                >
                  <span>{t(dict, 'goods.officialLink')}</span>
                  <Icon name="external" size={14} />
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-(--space-3) py-(--space-2)">
              <dt className="text-text-muted">{t(dict, 'goods.verified', { date: '' }).trim()}</dt>
              <dd className="col-span-2 text-text tabular-nums">
                {t(dict, 'goods.verified', { date: formatDate(goods.verifiedAt, lang) })}
              </dd>
            </div>
          </dl>

          {note ? <p className="mt-(--space-3) text-small text-text-muted">{note}</p> : null}

          <GoodsActions goodsId={goods.id} lang={lang} dict={dict} />
        </div>
      </section>

      <GoodsPriceSection
        goods={goods}
        ip={ip}
        lang={lang}
        dict={dict}
        prices={prices}
        current={current}
        howToReadHref={howToReadHref}
        relatedGoods={relatedGoods}
      />

      {current ? (
        <>
          <section className="mt-(--space-8)">
            <GoodsSubscribe goodsId={goods.id} lang={lang} dict={dict} />
          </section>
          <RelatedGoods lang={lang} dict={dict} ip={ip} items={relatedGoods} />
        </>
      ) : null}

      <RelatedGuides guides={relatedGuides} lang={lang} dict={dict} />
    </div>
  );
}

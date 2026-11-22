import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/config';
import {
  getAllPrices,
  getGoods,
  getGoodsByIp,
  getIp,
  getIps,
  getMeta,
  goodsPath,
} from '@/lib/data/catalog';
import type { GoodsType, Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { averagePremium, currentPrice, premiumRatio } from '@/lib/price/price';
import { typePageGenerated } from '@/lib/seo/indexing';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { IpHubHeader } from '@/components/ip/IpHubHeader';
import { IpGoodsGrid } from '@/components/ip/IpGoodsGrid';
import { ALL_GOODS_TYPES, collectTypeCombos } from '@/components/ip/typeParams';

export const dynamicParams = false;

export function generateStaticParams() {
  const combos = collectTypeCombos(getIps(), getGoods());
  if (combos.length === 0) {
    return [{ lang: config.defaultLocale, ipSlug: '_none', type: '_none' }];
  }
  return config.locales.flatMap((lang) => combos.map((c) => ({ lang, ...c })));
}

const isGoodsType = (v: string): v is GoodsType => (ALL_GOODS_TYPES as string[]).includes(v);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; ipSlug: string; type: string }>;
}): Promise<Metadata> {
  const { lang: raw, ipSlug, type } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const ip = getIp(ipSlug);
  if (!ip || !isGoodsType(type)) return { robots: { index: false, follow: false } };
  const list = getGoodsByIp(ip.slug).filter((g) => g.type === type);
  if (!typePageGenerated(list.length)) return { robots: { index: false, follow: false } };

  const dict = getDictionary(lang);
  const typeLabel = t(dict, `type.${type}`);
  const meta = getMeta();
  const titleText = t(dict, 'ip.typeH1', { ip: ip.name[lang], type: typeLabel });

  return buildMetadata({
    lang,
    path: `/${lang}/ip/${ip.slug}/${type}/`,
    pageName: titleText,
    description: t(dict, 'meta.ipType.description', {
      ip: ip.name[lang],
      type: typeLabel,
      n: list.length,
      date: formatDate(meta.generatedAt, lang),
    }),
    indexable: true,
    alternates: {
      ko: `/ko/ip/${ip.slug}/${type}/`,
      en: `/en/ip/${ip.slug}/${type}/`,
      ja: `/ja/ip/${ip.slug}/${type}/`,
    },
    ogImage: ogPath(lang, ip.slug),
  });
}

export default async function IpTypePage({
  params,
}: {
  params: Promise<{ lang: string; ipSlug: string; type: string }>;
}) {
  const { lang: raw, ipSlug, type } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const ip = getIp(ipSlug);
  if (!ip || !isGoodsType(type)) notFound();

  const allIpGoods = getGoodsByIp(ip.slug);
  const typedGoods = allIpGoods.filter((g) => g.type === type);
  if (!typePageGenerated(typedGoods.length)) notFound();

  const dict = getDictionary(lang);
  const meta = getMeta();
  const prices = getAllPrices();
  const typeLabel = t(dict, `type.${type}`);

  const items = typedGoods.map((g) => {
    const cur = currentPrice(g.id, prices, meta.generatedAt);
    return {
      goods: g,
      current: cur,
      premium: cur ? premiumRatio(cur.jpy, g.retail) : null,
    };
  });

  const pricedRatios = items.map((i) => i.premium).filter((p): p is number => p !== null);
  const siblingTypes = ALL_GOODS_TYPES.filter((tp) =>
    typePageGenerated(allIpGoods.filter((g) => g.type === tp).length)
  );

  return (
    <div className="container-main py-(--space-7)">
      <ScreenMark screen="S-14" />
      <LangAlternates
        map={{
          ko: `/ko/ip/${ip.slug}/${type}/`,
          en: `/en/ip/${ip.slug}/${type}/`,
          ja: `/ja/ip/${ip.slug}/${type}/`,
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'ip.listH1'), path: `/${lang}/ip/` },
          { name: ip.name[lang], path: `/${lang}/ip/${ip.slug}/` },
          { name: typeLabel, path: `/${lang}/ip/${ip.slug}/${type}/` },
        ])}
      />
      <JsonLd
        data={itemListLd(
          typedGoods.map((g) => ({ name: g.name[lang] || g.original, path: goodsPath(lang, g) }))
        )}
      />

      <IpHubHeader
        lang={lang}
        dict={dict}
        ip={ip}
        crumbs={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'ip.listH1'), href: `/${lang}/ip/` },
          { label: ip.name[lang], href: `/${lang}/ip/${ip.slug}/` },
          { label: typeLabel },
        ]}
        heading={t(dict, 'ip.typeH1', { ip: ip.name[lang], type: typeLabel })}
        lead={t(dict, 'ip.typeLead', { ip: ip.name[lang], type: typeLabel })}
        totalCount={typedGoods.length}
        pricedCount={pricedRatios.length}
        avgPremium={averagePremium(pricedRatios)}
      />

      <IpGoodsGrid
        lang={lang}
        dict={dict}
        ip={ip}
        items={items}
        availableTypes={siblingTypes}
        linkedTypes={siblingTypes}
        fixedType={type}
      />
    </div>
  );
}

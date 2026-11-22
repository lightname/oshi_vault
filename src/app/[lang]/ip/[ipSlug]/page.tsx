import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/config';
import { coverImageId, listGuides } from '@/lib/content/content';
import {
  getAllPrices,
  getGoodsByIp,
  getIp,
  getIps,
  getMeta,
  goodsPath,
} from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { GoodsType, Lang } from '@/lib/data/types';
import { formatDate } from '@/lib/format/format';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { averagePremium, currentPrice, premiumRatio } from '@/lib/price/price';
import { ipHubGenerated, ipHubIndexable, typePageGenerated } from '@/lib/seo/indexing';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { IpHubHeader } from '@/components/ip/IpHubHeader';
import { IpGoodsGrid } from '@/components/ip/IpGoodsGrid';
import { RelatedGuides } from '@/components/guides/RelatedGuides';

export const dynamicParams = false;

export function generateStaticParams() {
  const ips = getIps().filter(ipHubGenerated);
  return config.locales.flatMap((lang) => ips.map((ip) => ({ lang, ipSlug: ip.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; ipSlug: string }>;
}): Promise<Metadata> {
  const { lang: raw, ipSlug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const ip = getIp(ipSlug);
  if (!ip) return {};
  const dict = getDictionary(lang);
  const meta = getMeta();
  const idx = ipHubIndexable(ip);
  return buildMetadata({
    lang,
    path: `/${lang}/ip/${ip.slug}/`,
    pageName: t(dict, 'meta.ipHub.title', { ip: ip.name[lang] }),
    description: t(dict, 'meta.ipHub.description', {
      ip: ip.name[lang],
      n: ip.goodsCount,
      date: formatDate(meta.generatedAt, lang),
    }),
    indexable: idx,
    alternates: idx
      ? { ko: `/ko/ip/${ip.slug}/`, en: `/en/ip/${ip.slug}/`, ja: `/ja/ip/${ip.slug}/` }
      : {},
    ogImage: ogPath(lang, ip.slug),
  });
}

export default async function IpHubPage({
  params,
}: {
  params: Promise<{ lang: string; ipSlug: string }>;
}) {
  const { lang: raw, ipSlug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const ip = getIp(ipSlug);
  if (!ip || !ipHubGenerated(ip)) notFound();

  const dict = getDictionary(lang);
  const meta = getMeta();
  const prices = getAllPrices();
  const goodsList = getGoodsByIp(ip.slug);

  const items = goodsList.map((g) => {
    const cur = currentPrice(g.id, prices, meta.generatedAt);
    return {
      goods: g,
      current: cur,
      premium: cur ? premiumRatio(cur.jpy, g.retail) : null,
    };
  });

  const pricedRatios = items.map((i) => i.premium).filter((p): p is number => p !== null);
  const typeCounts = new Map<GoodsType, number>();
  for (const g of goodsList) typeCounts.set(g.type, (typeCounts.get(g.type) ?? 0) + 1);
  const availableTypes = [...typeCounts.keys()];
  const linkedTypes = availableTypes.filter((tp) => typePageGenerated(typeCounts.get(tp) ?? 0));

  const guides = listGuides(lang)
    .filter((g) => g.ipSlugs.includes(ip.slug))
    .slice(0, 3)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      description: g.description,
      cover: getImage(coverImageId(g.slug), lang),
    }));

  const heading = t(dict, 'ip.hubH1', { ip: ip.name[lang] });

  return (
    <div className="container-main py-(--space-7)">
      <ScreenMark screen="S-03" />
      <LangAlternates
        map={{ ko: `/ko/ip/${ip.slug}/`, en: `/en/ip/${ip.slug}/`, ja: `/ja/ip/${ip.slug}/` }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'ip.listH1'), path: `/${lang}/ip/` },
          { name: ip.name[lang], path: `/${lang}/ip/${ip.slug}/` },
        ])}
      />
      <JsonLd
        data={itemListLd(
          goodsList.map((g) => ({ name: g.name[lang] || g.original, path: goodsPath(lang, g) }))
        )}
      />

      <IpHubHeader
        lang={lang}
        dict={dict}
        ip={ip}
        crumbs={[
          { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
          { label: t(dict, 'ip.listH1'), href: `/${lang}/ip/` },
          { label: ip.name[lang] },
        ]}
        heading={heading}
        lead={t(dict, 'home.h1')}
        totalCount={goodsList.length}
        pricedCount={pricedRatios.length}
        avgPremium={averagePremium(pricedRatios)}
      />

      <IpGoodsGrid
        lang={lang}
        dict={dict}
        ip={ip}
        items={items}
        availableTypes={availableTypes}
        linkedTypes={linkedTypes}
      />

      <RelatedGuides guides={guides} lang={lang} dict={dict} />
    </div>
  );
}

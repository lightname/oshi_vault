import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/config';
import { coverImageId, guideLangs, hasGuide, listGuides, readGuide } from '@/lib/content/content';
import { getAllPrices, getGoods, getIp, getMeta } from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { currentPrice, premiumRatio } from '@/lib/price/price';
import { guideIndexable } from '@/lib/seo/indexing';
import { articleLd, breadcrumbLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { GuideDetailView } from '@/components/guides/GuideDetailView';
import type { GuideSlotGoods } from '@/components/guides/GuideCtaSlots';

export const dynamicParams = false;

export function generateStaticParams() {
  const params = config.locales.flatMap((lang) =>
    listGuides(lang).map((g) => ({ lang, slug: g.slug }))
  );
  if (params.length === 0) {
    return [{ lang: config.defaultLocale, slug: '_none' }];
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  if (!hasGuide(lang, slug)) return { robots: { index: false, follow: false } };

  const guide = readGuide(lang, slug);
  const len = guide.description.length;
  const badLen = lang === 'en' ? len < 70 || len > 160 : len < 40 || len > 80;
  if (badLen) console.warn('[content] description length', lang, slug, len);

  const indexable = guideIndexable(guide.reviewed);
  const alternates: Partial<Record<Lang, string>> = {};
  if (indexable) {
    for (const l of guideLangs(slug)) {
      if (readGuide(l, slug).reviewed) alternates[l] = `/${l}/guides/${slug}/`;
    }
  }

  return buildMetadata({
    lang,
    path: `/${lang}/guides/${slug}/`,
    pageName: guide.title,
    description: guide.description,
    indexable,
    alternates,
    ogImage: ogPath(lang),
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  if (!hasGuide(lang, slug)) notFound();

  const guide = readGuide(lang, slug);
  const dict = getDictionary(lang);
  const cover = getImage(coverImageId(slug), lang);
  const meta = getMeta();
  const prices = getAllPrices();
  const allGoods = getGoods();

  const relatedIps = guide.ipSlugs
    .map((s) => getIp(s))
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const ipSet = new Set(guide.ipSlugs);

  const slotGoods: GuideSlotGoods[] = allGoods
    .filter((g) => ipSet.has(g.ipSlug))
    .map((g) => {
      const cur = currentPrice(g.id, prices, meta.generatedAt);
      const ip = getIp(g.ipSlug);
      if (!cur || !ip) return null;
      return { goods: g, ip, current: cur, ratio: premiumRatio(cur.jpy, g.retail) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 2)
    .map(({ goods, ip, current }) => ({ goods, ip, current }));

  const primaryIp = relatedIps[0] ?? null;
  const relatedGoods = primaryIp
    ? allGoods
        .filter((g) => g.ipSlug === primaryIp.slug)
        .map((g) => ({ goods: g, current: currentPrice(g.id, prices, meta.generatedAt) }))
        .sort((a, b) => Number(b.current !== null) - Number(a.current !== null))
        .slice(0, 4)
    : [];

  const otherGuides = listGuides(lang)
    .filter((g) => g.slug !== slug)
    .slice(0, 3)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      description: g.description,
      cover: getImage(coverImageId(g.slug), lang),
    }));

  const altMap = Object.fromEntries(guideLangs(slug).map((l) => [l, `/${l}/guides/${slug}/`]));

  return (
    <>
      <ScreenMark screen="S-11" />
      <LangAlternates map={altMap} />
      <JsonLd data={articleLd(guide, lang, cover.src)} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'guides.h1'), path: `/${lang}/guides/` },
          { name: guide.title, path: `/${lang}/guides/${slug}/` },
        ])}
      />
      <GuideDetailView
        lang={lang}
        dict={dict}
        guide={guide}
        cover={cover}
        slotGoods={slotGoods}
        primaryIp={primaryIp}
        relatedGoods={relatedGoods}
        relatedIps={relatedIps}
        otherGuides={otherGuides}
      />
    </>
  );
}

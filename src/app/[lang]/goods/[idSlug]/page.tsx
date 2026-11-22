import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/config';
import { coverImageId, hasGuide, listGuides } from '@/lib/content/content';
import {
  getAllPrices,
  getGoods,
  getGoodsById,
  getGoodsByIp,
  getIp,
  getMeta,
  getPrices,
  goodsPath,
} from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Goods, Lang } from '@/lib/data/types';
import { formatLocalMoney, formatMoney, formatPercent } from '@/lib/format/format';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { currentPrice, premiumRatio } from '@/lib/price/price';
import { goodsIndexable } from '@/lib/seo/indexing';
import { breadcrumbLd, productLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { GoodsDetailView } from '@/components/goods/GoodsDetailView';

export const dynamicParams = false;

const makeIdSlug = (g: Pick<Goods, 'id' | 'slug'>) =>
  g.slug ? `${g.id.toLowerCase()}-${g.slug}` : g.id.toLowerCase();

export function generateStaticParams() {
  const goods = getGoods();
  return config.locales.flatMap((lang) => goods.map((g) => ({ lang, idSlug: makeIdSlug(g) })));
}

function resolveGoods(idSlug: string): Goods | null {
  const id = idSlug.slice(0, 8).toUpperCase();
  const g = getGoodsById(id);
  if (!g || makeIdSlug(g) !== idSlug) return null;
  return g;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; idSlug: string }>;
}): Promise<Metadata> {
  const { lang: raw, idSlug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const g = resolveGoods(idSlug);
  const ip = g ? getIp(g.ipSlug) : undefined;
  if (!g || !ip) return {};

  const dict = getDictionary(lang);
  const meta = getMeta();
  const cur = currentPrice(g.id, getPrices(g.id), meta.generatedAt);
  const displayName = g.name[lang] || g.original;
  const retailStr = formatMoney(g.retail.price, g.retail.currency, lang);
  const description = cur
    ? t(dict, 'meta.goods.descPriced', {
        name: displayName,
        retail: retailStr,
        median: formatLocalMoney(cur.jpy, lang),
        premium: formatPercent(premiumRatio(cur.jpy, g.retail)),
      })
    : t(dict, 'meta.goods.descCollecting', {
        name: displayName,
        retail: retailStr,
        ip: ip.name[lang],
        limit: t(dict, `limit.${g.limit}`),
      });

  const idx = goodsIndexable(g, lang);
  const alternates: Partial<Record<Lang, string>> = {};
  if (idx) {
    for (const l of config.locales) {
      if (goodsIndexable(g, l)) alternates[l] = goodsPath(l, g);
    }
  }

  return buildMetadata({
    lang,
    path: goodsPath(lang, g),
    pageName: t(dict, 'meta.goods.title', { name: displayName }),
    description,
    indexable: idx,
    alternates,
    ogImage: ogPath(lang, ip.slug),
  });
}

export default async function GoodsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; idSlug: string }>;
}) {
  const { lang: raw, idSlug } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const g = resolveGoods(idSlug);
  const ip = g ? getIp(g.ipSlug) : undefined;
  if (!g || !ip) notFound();

  const dict = getDictionary(lang);
  const meta = getMeta();
  const prices = getPrices(g.id);
  const allPrices = getAllPrices();
  const cur = currentPrice(g.id, prices, meta.generatedAt);
  const displayName = g.name[lang] || g.original;

  const relatedGoods = getGoodsByIp(ip.slug)
    .filter((other) => other.id !== g.id)
    .map((other) => ({
      goods: other,
      current: currentPrice(other.id, allPrices, meta.generatedAt),
    }))
    .sort((a, b) => {
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      return (b.goods.releaseDate ?? '').localeCompare(a.goods.releaseDate ?? '');
    })
    .slice(0, 6);

  const relatedGuides = listGuides(lang)
    .filter((guide) => guide.ipSlugs.includes(ip.slug))
    .slice(0, 3)
    .map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      description: guide.description,
      cover: getImage(coverImageId(guide.slug), lang),
    }));

  const limitGuideHref = hasGuide(lang, 'limited-edition-types')
    ? `/${lang}/guides/limited-edition-types/`
    : null;
  const howToReadHref = hasGuide(lang, 'how-to-read-prices')
    ? `/${lang}/guides/how-to-read-prices/`
    : `/${lang}/about/`;

  return (
    <>
      <ScreenMark screen="S-04" />
      <LangAlternates
        map={{ ko: goodsPath('ko', g), en: goodsPath('en', g), ja: goodsPath('ja', g) }}
      />
      <JsonLd data={productLd(g, ip, lang)} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: ip.name[lang], path: `/${lang}/ip/${ip.slug}/` },
          { name: displayName, path: goodsPath(lang, g) },
        ])}
      />
      <GoodsDetailView
        goods={g}
        ip={ip}
        lang={lang}
        dict={dict}
        prices={prices}
        current={cur}
        limitGuideHref={limitGuideHref}
        howToReadHref={howToReadHref}
        relatedGoods={relatedGoods}
        relatedGuides={relatedGuides}
      />
    </>
  );
}

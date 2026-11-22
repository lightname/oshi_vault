import type { Metadata } from 'next';
import { config } from '@/config';
import { coverImageId, hasGuide, listGuides } from '@/lib/content/content';
import {
  getAllPrices,
  getGoods,
  getIps,
  getMeta,
  goodsPath,
} from '@/lib/data/catalog';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { currentPrice, premiumRatio } from '@/lib/price/price';
import { ipHubGenerated } from '@/lib/seo/indexing';
import { organizationLd, websiteLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { HomeView, type FeaturedItem } from '@/components/home/HomeView';

export const dynamicParams = false;

export function generateStaticParams() {
  return config.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  return buildMetadata({
    lang,
    path: `/${lang}/`,
    pageName: null,
    fullTitle: `${config.site.name[lang]} | ${t(dict, 'site.slogan')}`,
    description: t(dict, 'meta.home.description'),
    indexable: true,
    alternates: { ko: '/ko/', en: '/en/', ja: '/ja/' },
    ogImage: ogPath(lang),
  });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const meta = getMeta();
  const ips = getIps();
  const activeIps = ips.filter(ipHubGenerated);
  const ipMap = new Map(ips.map((ip) => [ip.slug, ip]));
  const goods = getGoods();
  const prices = getAllPrices();

  const priced = goods
    .map((g) => {
      const cur = currentPrice(g.id, prices, meta.generatedAt);
      const ip = ipMap.get(g.ipSlug);
      if (!cur || !ip) return null;
      return { goods: g, ip, current: cur, ratio: premiumRatio(cur.jpy, g.retail) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.ratio - a.ratio);

  const usePremiumHeading = priced.length >= 4;
  const featured: FeaturedItem[] = usePremiumHeading
    ? priced.slice(0, 8).map(({ goods: g, ip, current }) => ({ goods: g, ip, current }))
    : [...goods]
        .sort((a, b) => b.firstCollectedAt.localeCompare(a.firstCollectedAt) || a.id.localeCompare(b.id))
        .slice(0, 8)
        .map((g) => ({
          goods: g,
          ip: ipMap.get(g.ipSlug)!,
          current: currentPrice(g.id, prices, meta.generatedAt),
        }))
        .filter((x) => Boolean(x.ip));

  const examples = priced.slice(0, 3).map(({ goods: g }) => ({
    id: g.id,
    label: g.name[lang] || g.original,
    href: goodsPath(lang, g),
  }));

  const howToReadHref = hasGuide(lang, 'how-to-read-prices')
    ? `/${lang}/guides/how-to-read-prices/`
    : `/${lang}/about/`;

  const guides = listGuides(lang)
    .slice(0, 3)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      description: g.description,
      cover: getImage(coverImageId(g.slug), lang),
    }));

  return (
    <>
      <ScreenMark screen="S-01" />
      <LangAlternates map={{ ko: '/ko/', en: '/en/', ja: '/ja/' }} />
      <JsonLd data={websiteLd(lang)} />
      <JsonLd data={organizationLd()} />
      <HomeView
        lang={lang}
        dict={dict}
        generatedAt={meta.generatedAt}
        usePremiumHeading={usePremiumHeading}
        examples={examples}
        featured={featured}
        ips={activeIps}
        howToReadHref={howToReadHref}
        guides={guides}
      />
    </>
  );
}

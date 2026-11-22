import type { Metadata } from 'next';
import { config } from '@/config';
import { MARKET_LABEL } from '@/lib/affiliate/marketLink';
import { getAllPrices, getGoods } from '@/lib/data/catalog';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { breadcrumbLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { AboutView } from '@/components/home/AboutView';

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
    path: `/${lang}/about/`,
    pageName: t(dict, 'meta.about.title'),
    description: t(dict, 'meta.about.description'),
    indexable: true,
    alternates: { ko: '/ko/about/', en: '/en/about/', ja: '/ja/about/' },
    ogImage: ogPath(lang),
  });
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const prices = getAllPrices();
  const seenMarkets = [...new Set(prices.map((p) => MARKET_LABEL[p.market]))];
  const marketsLabel = seenMarkets.length > 0 ? seenMarkets.join(', ') : 'eBay, Mercari, KREAM';
  const goodsCount = getGoods().length;

  return (
    <>
      <ScreenMark screen="S-12" />
      <LangAlternates map={{ ko: '/ko/about/', en: '/en/about/', ja: '/ja/about/' }} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'about.h1'), path: `/${lang}/about/` },
        ])}
      />
      <AboutView lang={lang} dict={dict} marketsLabel={marketsLabel} goodsCount={goodsCount} />
    </>
  );
}

import type { Metadata } from 'next';
import { config } from '@/config';
import { getIps } from '@/lib/data/catalog';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { ipHubGenerated } from '@/lib/seo/indexing';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { SearchView } from '@/components/goods/SearchView';

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
    path: `/${lang}/search/`,
    pageName: t(dict, 'search.h1'),
    description: t(dict, 'home.lead'),
    indexable: false,
    alternates: {},
    ogImage: ogPath(lang),
  });
}

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const ips = getIps().filter(ipHubGenerated);

  return (
    <>
      <ScreenMark screen="S-05" />
      <LangAlternates map={{ ko: '/ko/search/', en: '/en/search/', ja: '/ja/search/' }} />
      <SearchView lang={lang} dict={dict} ips={ips} />
    </>
  );
}

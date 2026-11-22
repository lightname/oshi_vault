import type { Metadata } from 'next';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { CollectionView } from '@/components/collection/CollectionView';

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
    path: `/${lang}/collection/`,
    pageName: t(dict, 'col.h1'),
    description: t(dict, 'col.emptyBody'),
    indexable: false,
    alternates: {},
    ogImage: ogPath(lang),
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <ScreenMark screen="S-07" />
      <LangAlternates map={{ ko: '/ko/collection/', en: '/en/collection/', ja: '/ja/collection/' }} />
      <CollectionView lang={lang} dict={dict} />
    </>
  );
}

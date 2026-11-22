import type { Metadata } from 'next';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { WishlistView } from '@/components/collection/WishlistView';

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
    path: `/${lang}/wishlist/`,
    pageName: t(dict, 'wish.h1'),
    description: t(dict, 'wish.lead'),
    indexable: false,
    alternates: {},
    ogImage: ogPath(lang),
  });
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <ScreenMark screen="S-08" />
      <LangAlternates map={{ ko: '/ko/wishlist/', en: '/en/wishlist/', ja: '/ja/wishlist/' }} />
      <WishlistView lang={lang} dict={dict} />
    </>
  );
}

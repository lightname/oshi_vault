import type { Metadata } from 'next';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { ShareView } from '@/components/share/ShareView';

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
    path: `/${lang}/share/`,
    pageName: t(dict, 'share.h1'),
    description: t(dict, 'share.lead'),
    indexable: false,
    alternates: {},
    ogImage: ogPath(lang),
  });
}

export default async function SharePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <ScreenMark screen="S-09" />
      <LangAlternates map={{ ko: '/ko/share/', en: '/en/share/', ja: '/ja/share/' }} />
      <ShareView lang={lang} dict={dict} />
    </>
  );
}

import type { Metadata } from 'next';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';

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
  return (
    <div className="container-main py-(--space-8)">
      <ScreenMark screen="S-01" />
      <LangAlternates map={{ ko: '/ko/', en: '/en/', ja: '/ja/' }} />
      <h1 className="text-h1 text-secondary">{t(dict, 'home.h1')}</h1>
    </div>
  );
}

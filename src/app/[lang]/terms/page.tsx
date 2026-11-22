import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/config';
import { hasLegal, legalLangs, readLegal } from '@/lib/content/content';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { guideIndexable } from '@/lib/seo/indexing';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { LegalView } from '@/components/home/LegalView';

export const dynamicParams = false;

export function generateStaticParams() {
  return legalLangs('terms').map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  if (!hasLegal(lang, 'terms')) return { robots: { index: false, follow: false } };

  const doc = readLegal(lang, 'terms');
  const dict = getDictionary(lang);
  const indexable = guideIndexable(doc.reviewed);
  const alternates: Partial<Record<Lang, string>> = {};
  if (indexable) {
    for (const l of legalLangs('terms')) {
      if (readLegal(l, 'terms').reviewed) alternates[l] = `/${l}/terms/`;
    }
  }

  return buildMetadata({
    lang,
    path: `/${lang}/terms/`,
    pageName: t(dict, 'legal.terms'),
    description: t(dict, 'meta.terms.description'),
    indexable,
    alternates,
    ogImage: ogPath(lang),
  });
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  if (!hasLegal(lang, 'terms')) notFound();

  const doc = readLegal(lang, 'terms');
  const dict = getDictionary(lang);
  const altMap = Object.fromEntries(legalLangs('terms').map((l) => [l, `/${l}/terms/`]));

  return (
    <>
      <ScreenMark screen="S-13" />
      <LangAlternates map={altMap} />
      <LegalView lang={lang} dict={dict} doc={doc} />
    </>
  );
}

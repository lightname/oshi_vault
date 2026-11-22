import type { Metadata } from 'next';
import { config } from '@/config';
import { hasGuide } from '@/lib/content/content';
import { getIps } from '@/lib/data/catalog';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { ipHubGenerated } from '@/lib/seo/indexing';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { ScanView } from '@/components/scan/ScanView';

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
    path: `/${lang}/scan/`,
    pageName: t(dict, 'scan.h1'),
    description: t(dict, 'scan.lead'),
    indexable: false,
    alternates: {},
    ogImage: ogPath(lang),
  });
}

export default async function ScanPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const ips = getIps().filter(ipHubGenerated);
  const hasBarcodeGuide = hasGuide(lang, 'find-barcode-product-code');

  return (
    <>
      <ScreenMark screen="S-06" />
      <LangAlternates map={{ ko: '/ko/scan/', en: '/en/scan/', ja: '/ja/scan/' }} />
      <ScanView lang={lang} dict={dict} ips={ips} hasBarcodeGuide={hasBarcodeGuide} />
    </>
  );
}

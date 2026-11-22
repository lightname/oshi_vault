import type { Metadata } from 'next';
import { config } from '@/config';
import type { Lang } from '@/lib/data/types';

export type MetaInput = {
  lang: Lang | null;
  path: string;
  pageName: string | null;
  fullTitle?: string;
  description: string;
  indexable: boolean;
  alternates: Partial<Record<Lang, string>>;
  ogImage: string;
};

export function ogPath(lang: Lang | null, ipSlug?: string): string {
  const l = lang ?? 'en';
  return ipSlug ? `/images/og/og-ip-${ipSlug}-${l}.png` : `/images/og/og-default-${l}.png`;
}

export function buildMetadata(m: MetaInput): Metadata {
  const site = m.lang ? config.site.name[m.lang] : config.site.name.en;
  const title = m.fullTitle ?? (m.pageName ? `${m.pageName} | ${site}` : site);
  const abs = (p: string) => `${config.site.url}${p}`;
  const languages = m.indexable
    ? {
        ...Object.fromEntries(
          Object.entries(m.alternates).map(([l, p]) => [l, abs(p as string)])
        ),
        'x-default': abs('/'),
      }
    : undefined;
  return {
    title,
    description: m.description,
    alternates: { canonical: abs(m.path), languages },
    robots: m.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description: m.description,
      url: abs(m.path),
      type: 'website',
      siteName: site,
      locale: m.lang ? { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' }[m.lang] : 'en_US',
      images: [{ url: abs(m.ogImage), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: m.description,
      images: [abs(m.ogImage)],
    },
    verification: config.seo.gscVerification ? { google: config.seo.gscVerification } : undefined,
  };
}

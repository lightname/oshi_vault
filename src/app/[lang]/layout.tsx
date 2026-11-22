import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { config } from '@/config';
import { listGuides } from '@/lib/content/content';
import { getMeta } from '@/lib/data/catalog';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang } from '@/lib/i18n/dictionary';
import { getFont } from '@/lib/i18n/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConsentBanner } from '@/components/layout/ConsentBanner';

export const dynamicParams = false;

export function generateStaticParams() {
  return config.locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#3B2F6B',
};

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const font = getFont(lang);
  const dict = getDictionary(lang);
  const guideCount = listGuides(lang).filter((g) => g.reviewed).length;
  const year = Number(getMeta().generatedAt.slice(0, 4)) || 2026;

  return (
    <html lang={lang}>
      <body className={`${font.className} min-h-screen flex flex-col bg-bg text-text antialiased`}>
        <Header lang={lang} dict={dict} guideCount={guideCount} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} dict={dict} guideCount={guideCount} year={year} />
        <ConsentBanner dict={dict} />
      </body>
    </html>
  );
}

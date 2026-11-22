import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import rootMessages from '@/messages/root.json';
import { getBrandLogo, getImage } from '@/lib/data/images';
import { inter } from '@/lib/i18n/fonts';
import { organizationLd, websiteLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { RootLangCards } from '@/components/home/RootLangCards';

export const viewport: Viewport = {
  themeColor: '#3B2F6B',
};

export const metadata: Metadata = {
  ...buildMetadata({
    lang: null,
    path: '/',
    pageName: null,
    fullTitle: 'Oshi Vault | What your favorite merch is worth now',
    description:
      'Compare retail and sold prices of limited Japanese merch. Choose Korean, English, or Japanese.',
    indexable: true,
    alternates: { ko: '/ko/', en: '/en/', ja: '/ja/' },
    ogImage: ogPath(null),
  }),
  manifest: '/manifest.webmanifest',
};

export default function RootPage() {
  const hero = getImage('IMG-02', 'en');
  const cards = [
    {
      lang: 'ko' as const,
      name: rootMessages['root.ko.name'],
      desc: rootMessages['root.ko.desc'],
      suggest: rootMessages['root.ko.suggest'],
    },
    {
      lang: 'en' as const,
      name: rootMessages['root.en.name'],
      desc: rootMessages['root.en.desc'],
      suggest: rootMessages['root.en.suggest'],
    },
    {
      lang: 'ja' as const,
      name: rootMessages['root.ja.name'],
      desc: rootMessages['root.ja.desc'],
      suggest: rootMessages['root.ja.suggest'],
    },
  ];

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-bg text-text antialiased`}>
        <ScreenMark screen="S-00" />
        <JsonLd data={websiteLd('en')} />
        <JsonLd data={organizationLd()} />
        <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center px-(--space-4) py-(--space-7) md:px-(--space-5)">
          <section className="flex flex-col items-center text-center">
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              priority
              className="h-auto w-[240px] object-contain md:w-[min(320px,80%)]"
            />
            <div className="mt-(--space-5) inline-flex items-center gap-(--space-2)">
              <Image
                src={getBrandLogo('default').src}
                alt=""
                width={40}
                height={40}
                className="h-[40px] w-[40px]"
              />
              <span className="text-[20px] font-bold tracking-[-0.01em] text-secondary">
                Oshi Vault
              </span>
            </div>
          </section>

          <section className="mt-(--space-5) text-center">
            <h1 className="text-h1 text-secondary">Oshi Vault</h1>
            <div className="mt-(--space-3) space-y-(--space-1) text-body text-text-muted">
              <p>{rootMessages['root.ko.slogan']}</p>
              <p>{rootMessages['root.en.slogan']}</p>
              <p>{rootMessages['root.ja.slogan']}</p>
            </div>
          </section>

          <section className="mt-(--space-7)">
            <RootLangCards cards={cards} />
          </section>
        </main>
      </body>
    </html>
  );
}

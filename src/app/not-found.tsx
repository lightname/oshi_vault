import type { Metadata } from 'next';
import Image from 'next/image';
import rootMessages from '@/messages/root.json';
import { getImage } from '@/lib/data/images';
import { inter } from '@/lib/i18n/fonts';
import { buttonClass } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page not found | Oshi Vault',
  robots: { index: false, follow: true },
};

const BLOCKS = [
  {
    lang: 'ko',
    title: rootMessages['notFound.ko.title'],
    home: rootMessages['notFound.ko.home'],
    search: rootMessages['notFound.ko.search'],
  },
  {
    lang: 'en',
    title: rootMessages['notFound.en.title'],
    home: rootMessages['notFound.en.home'],
    search: rootMessages['notFound.en.search'],
  },
  {
    lang: 'ja',
    title: rootMessages['notFound.ja.title'],
    home: rootMessages['notFound.ja.home'],
    search: rootMessages['notFound.ja.search'],
  },
] as const;

export default function NotFound() {
  const img = getImage('IMG-20', 'en');

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-bg text-text antialiased`}>
        <main className="mx-auto max-w-[560px] px-(--space-4) py-(--space-9)">
          <h1 className="sr-only">Page not found</h1>
          <div className="flex justify-center">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              className="h-auto w-[180px] object-contain md:w-[240px]"
            />
          </div>
          <div className="mt-(--space-7) divide-y divide-border">
            {BLOCKS.map((b) => (
              <section key={b.lang} lang={b.lang} className="py-(--space-6) first:pt-0">
                <h2 className="text-h2 text-secondary">{b.title}</h2>
                <div className="mt-(--space-4) flex flex-col gap-(--space-2) md:flex-row md:items-center">
                  <a href={`/${b.lang}/`} className={buttonClass('secondary', 'w-full md:w-auto')}>
                    {b.home}
                  </a>
                  <a
                    href={`/${b.lang}/search/`}
                    className={buttonClass('text', 'w-full md:w-auto')}
                  >
                    {b.search}
                  </a>
                </div>
              </section>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import { config } from '@/config';
import { hasGuide } from '@/lib/content/content';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { breadcrumbLd, webAppLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { JsonLd } from '@/components/ui/JsonLd';
import { CalculatorCard } from '@/components/calc/CalculatorCard';
import { HowToReadLink } from '@/components/goods/HowToReadLink';

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
    path: `/${lang}/tools/premium-calculator/`,
    pageName: t(dict, 'calc.h1'),
    description: t(dict, 'meta.calc.description'),
    indexable: true,
    alternates: {
      ko: '/ko/tools/premium-calculator/',
      en: '/en/tools/premium-calculator/',
      ja: '/ja/tools/premium-calculator/',
    },
    ogImage: ogPath(lang),
  });
}

export default async function PremiumCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const img = getImage('IMG-21', lang);
  const howToReadHref = hasGuide(lang, 'how-to-read-prices')
    ? `/${lang}/guides/how-to-read-prices/`
    : `/${lang}/about/`;

  return (
    <>
      <ScreenMark screen="S-16" />
      <LangAlternates
        map={{
          ko: '/ko/tools/premium-calculator/',
          en: '/en/tools/premium-calculator/',
          ja: '/ja/tools/premium-calculator/',
        }}
      />
      <JsonLd data={webAppLd(lang, t(dict, 'calc.h1'))} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'calc.h1'), path: `/${lang}/tools/premium-calculator/` },
        ])}
      />

      <div className="container-main py-(--space-7)">
        <Breadcrumb
          label={t(dict, 'a11y.breadcrumb')}
          items={[
            { label: t(dict, 'breadcrumb.home'), href: `/${lang}/` },
            { label: t(dict, 'calc.h1') },
          ]}
        />

        <section className="grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-h1 text-secondary">{t(dict, 'calc.h1')}</h1>
            <p className="mt-(--space-3) text-body text-text-muted">{t(dict, 'calc.lead')}</p>
          </div>
          <div className="hidden justify-end lg:col-span-5 lg:flex">
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              className="h-auto w-[280px] object-contain"
            />
          </div>
        </section>

        <CalculatorCard lang={lang} dict={dict} />

        <section className="mt-(--space-8) max-w-[720px]">
          <h2 className="text-h2 text-secondary">{t(dict, 'calc.howTitle')}</h2>
          <div className="mt-(--space-3) rounded-(--radius-md) border border-border bg-surface p-(--space-4) text-body font-semibold text-secondary">
            {t(dict, 'about.methodBody2')}
          </div>
          <p className="mt-(--space-3) text-body text-text">{t(dict, 'calc.howBody')}</p>
          <div className="mt-(--space-4)">
            <HowToReadLink href={howToReadHref} label={t(dict, 'trust.howToRead')} />
          </div>
        </section>
      </div>
    </>
  );
}

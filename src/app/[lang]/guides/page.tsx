import type { Metadata } from 'next';
import { config } from '@/config';
import { coverImageId, listGuides } from '@/lib/content/content';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { guidesListIndexable } from '@/lib/seo/indexing';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { GuidesListView } from '@/components/guides/GuidesListView';

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

  const reviewedCount = listGuides(lang).filter((g) => g.reviewed).length;
  const indexable = guidesListIndexable(reviewedCount);
  const alternates: Partial<Record<Lang, string>> = {};
  if (indexable) {
    for (const l of config.locales) {
      if (guidesListIndexable(listGuides(l).filter((g) => g.reviewed).length)) {
        alternates[l] = `/${l}/guides/`;
      }
    }
  }

  return buildMetadata({
    lang,
    path: `/${lang}/guides/`,
    pageName: t(dict, 'guides.h1'),
    description: t(dict, 'meta.guides.description'),
    indexable,
    alternates,
    ogImage: ogPath(lang),
  });
}

export default async function GuidesListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const rawGuides = listGuides(lang);
  const guides = rawGuides.map((g) => ({
    slug: g.slug,
    title: g.title,
    description: g.description,
    updated: g.updated,
    cover: getImage(coverImageId(g.slug), lang),
  }));

  return (
    <>
      <ScreenMark screen="S-10" />
      <LangAlternates map={{ ko: '/ko/guides/', en: '/en/guides/', ja: '/ja/guides/' }} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'guides.h1'), path: `/${lang}/guides/` },
        ])}
      />
      <JsonLd
        data={itemListLd(
          guides.map((g) => ({ name: g.title, path: `/${lang}/guides/${g.slug}/` }))
        )}
      />
      <GuidesListView lang={lang} dict={dict} guides={guides} />
    </>
  );
}

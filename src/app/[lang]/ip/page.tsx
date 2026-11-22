import type { Metadata } from 'next';
import { config } from '@/config';
import { getIps } from '@/lib/data/catalog';
import type { Lang } from '@/lib/data/types';
import { getDictionary, isLang, t } from '@/lib/i18n/dictionary';
import { ipHubGenerated } from '@/lib/seo/indexing';
import { breadcrumbLd, itemListLd } from '@/lib/seo/jsonld';
import { buildMetadata, ogPath } from '@/lib/seo/metadata';
import { LangAlternates } from '@/components/layout/LangAlternates';
import { ScreenMark } from '@/components/layout/ScreenMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { IpListView } from '@/components/ip/IpListView';

export const dynamicParams = false;

export function generateStaticParams() {
  return config.locales.map((lang) => ({ lang }));
}

function activeIps() {
  const ips = getIps().filter(ipHubGenerated);
  if (ips.length === 0) throw new Error('[S-02] no generated IPs');
  return ips;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const ips = activeIps();
  const top = ips.slice(0, 3).map((ip) => ip.name[lang]);
  return buildMetadata({
    lang,
    path: `/${lang}/ip/`,
    pageName: t(dict, 'ip.listH1'),
    description: t(dict, 'meta.ipList.description', {
      ip1: top[0] ?? '',
      ip2: top[1] ?? '',
      ip3: top[2] ?? '',
    }),
    indexable: true,
    alternates: { ko: '/ko/ip/', en: '/en/ip/', ja: '/ja/ip/' },
    ogImage: ogPath(lang),
  });
}

export default async function IpListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : config.defaultLocale;
  const dict = getDictionary(lang);
  const ips = activeIps();

  return (
    <>
      <ScreenMark screen="S-02" />
      <LangAlternates map={{ ko: '/ko/ip/', en: '/en/ip/', ja: '/ja/ip/' }} />
      <JsonLd
        data={breadcrumbLd([
          { name: t(dict, 'breadcrumb.home'), path: `/${lang}/` },
          { name: t(dict, 'ip.listH1'), path: `/${lang}/ip/` },
        ])}
      />
      <JsonLd
        data={itemListLd(
          ips.map((ip) => ({ name: ip.name[lang], path: `/${lang}/ip/${ip.slug}/` }))
        )}
      />
      <IpListView lang={lang} dict={dict} ips={ips} />
    </>
  );
}

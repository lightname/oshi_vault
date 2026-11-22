import { config } from '@/config';
import type { Guide } from '@/lib/content/content';
import type { Goods, Ip, Lang, SaleStatus } from '@/lib/data/types';

const abs = (p: string) => `${config.site.url}${p}`;

const AVAILABILITY: Record<SaleStatus, string> = {
  preorder: 'https://schema.org/PreOrder',
  onsale: 'https://schema.org/InStock',
  soldout: 'https://schema.org/SoldOut',
  ended: 'https://schema.org/Discontinued',
};

export function websiteLd(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.name[lang],
    url: abs(`/${lang}/`),
    inLanguage: lang,
  };
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oshi Vault',
    url: config.site.url,
    logo: abs('/icons/icon-512.png'),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function itemListLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: abs(item.path),
    })),
  };
}

export function productLd(g: Goods, ip: Ip, lang: Lang) {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: g.name[lang] || g.original,
    sku: g.id,
    brand: { '@type': 'Brand', name: ip.name[lang] },
    offers: {
      '@type': 'Offer',
      price: g.retail.price,
      priceCurrency: g.retail.currency,
      url: g.officialUrl,
      availability: AVAILABILITY[g.status],
    },
  };
  if (g.codeType === 'jan13' && g.code) base.gtin13 = g.code;
  return base;
}

export function articleLd(guide: Guide, lang: Lang, coverSrc: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.date,
    dateModified: guide.updated,
    inLanguage: lang,
    image: abs(coverSrc),
  };
}

export function webAppLd(lang: Lang, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: config.localeCurrency[lang],
    },
  };
}

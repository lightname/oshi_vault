import fs from 'node:fs';
import path from 'node:path';
import { config } from '@/config';
import { getAllPrices, getGoods, getIps, getMeta, goodsPath } from '@/lib/data/catalog';
import { hasLegal, listGuides, readLegal } from '@/lib/content/content';
import {
  goodsIndexable,
  guideIndexable,
  guidesListIndexable,
  ipHubGenerated,
  ipHubIndexable,
  lastmodOverride,
  typePageGenerated,
} from '@/lib/seo/indexing';
import type { Goods, GoodsType, Lang, SeoManifest, SeoManifestEntry } from '@/lib/data/types';

const APP = path.join(process.cwd(), 'src/app');
const hasPage = (rel: string) => fs.existsSync(path.join(APP, rel));
const maxDate = (dates: string[], fallback: string) =>
  dates.filter(Boolean).sort().at(-1) ?? fallback;

function allLangAlts(fn: (l: Lang) => string): Record<string, string> {
  return Object.fromEntries(config.locales.map((l) => [l, fn(l)]));
}

export function buildSeoManifest(): SeoManifest {
  const entries: SeoManifestEntry[] = [];
  const meta = getMeta();
  const ips = getIps();
  const goods = getGoods();
  const prices = getAllPrices();
  const ov = lastmodOverride();
  const lm = (d: string) => ov ?? d;

  const latestPriceByGoods = new Map<string, string>();
  for (const p of prices) {
    const prev = latestPriceByGoods.get(p.goodsId);
    if (!prev || p.date > prev) latestPriceByGoods.set(p.goodsId, p.date);
  }
  const goodsLm = (g: Goods) => maxDate([g.verifiedAt, latestPriceByGoods.get(g.id) ?? ''], meta.generatedAt);

  if (hasPage('page.tsx')) {
    entries.push({
      path: '/', lang: null, screen: 'S-00', indexable: true,
      lastmod: lm(meta.generatedAt), alternates: allLangAlts((l) => `/${l}/`),
    });
  }
  if (hasPage('[lang]/page.tsx')) {
    const alts = allLangAlts((l) => `/${l}/`);
    for (const lang of config.locales) {
      entries.push({ path: `/${lang}/`, lang, screen: 'S-01', indexable: true, lastmod: lm(meta.generatedAt), alternates: alts });
    }
  }
  if (hasPage('[lang]/ip/page.tsx')) {
    const alts = allLangAlts((l) => `/${l}/ip/`);
    for (const lang of config.locales) {
      entries.push({ path: `/${lang}/ip/`, lang, screen: 'S-02', indexable: true, lastmod: lm(meta.generatedAt), alternates: alts });
    }
  }
  if (hasPage('[lang]/ip/[ipSlug]/page.tsx')) {
    for (const ip of ips) {
      if (!ipHubGenerated(ip)) continue;
      const ipGoods = goods.filter((g) => g.ipSlug === ip.slug);
      const d = lm(maxDate(ipGoods.map(goodsLm), meta.generatedAt));
      const idx = ipHubIndexable(ip);
      const alts = idx ? allLangAlts((l) => `/${l}/ip/${ip.slug}/`) : {};
      for (const lang of config.locales) {
        entries.push({ path: `/${lang}/ip/${ip.slug}/`, lang, screen: 'S-03', indexable: idx, lastmod: d, alternates: alts });
      }
    }
  }
  if (hasPage('[lang]/ip/[ipSlug]/[type]/page.tsx')) {
    const types: GoodsType[] = ['figure', 'plush', 'badge', 'card', 'kuji', 'apparel', 'other'];
    for (const ip of ips) {
      for (const type of types) {
        const sub = goods.filter((g) => g.ipSlug === ip.slug && g.type === type);
        if (!typePageGenerated(sub.length)) continue;
        const d = lm(maxDate(sub.map(goodsLm), meta.generatedAt));
        const alts = allLangAlts((l) => `/${l}/ip/${ip.slug}/${type}/`);
        for (const lang of config.locales) {
          entries.push({ path: `/${lang}/ip/${ip.slug}/${type}/`, lang, screen: 'S-14', indexable: true, lastmod: d, alternates: alts });
        }
      }
    }
  }
  if (hasPage('[lang]/goods/[idSlug]/page.tsx')) {
    for (const g of goods) {
      const d = lm(goodsLm(g));
      const idxAlts: Record<string, string> = {};
      for (const l of config.locales) {
        if (goodsIndexable(g, l)) idxAlts[l] = goodsPath(l, g);
      }
      for (const lang of config.locales) {
        const idx = goodsIndexable(g, lang);
        entries.push({ path: goodsPath(lang, g), lang, screen: 'S-04', indexable: idx, lastmod: d, alternates: idx ? idxAlts : {} });
      }
    }
  }
  if (hasPage('[lang]/guides/page.tsx')) {
    const byLang = Object.fromEntries(config.locales.map((l) => [l, listGuides(l)])) as Record<Lang, ReturnType<typeof listGuides>>;
    const idxAlts: Record<string, string> = {};
    for (const l of config.locales) {
      if (guidesListIndexable(byLang[l].filter((g) => g.reviewed).length)) idxAlts[l] = `/${l}/guides/`;
    }
    for (const lang of config.locales) {
      const rev = byLang[lang].filter((g) => g.reviewed);
      const idx = guidesListIndexable(rev.length);
      entries.push({
        path: `/${lang}/guides/`, lang, screen: 'S-10', indexable: idx,
        lastmod: lm(maxDate(byLang[lang].map((g) => g.updated), meta.generatedAt)),
        alternates: idx ? idxAlts : {},
      });
    }
  }
  if (hasPage('[lang]/guides/[slug]/page.tsx')) {
    const byLang = Object.fromEntries(config.locales.map((l) => [l, listGuides(l)])) as Record<Lang, ReturnType<typeof listGuides>>;
    for (const lang of config.locales) {
      for (const g of byLang[lang]) {
        const idx = guideIndexable(g.reviewed);
        const alts: Record<string, string> = {};
        if (idx) {
          for (const l of config.locales) {
            const match = byLang[l].find((x) => x.slug === g.slug && x.reviewed);
            if (match) alts[l] = `/${l}/guides/${g.slug}/`;
          }
        }
        entries.push({ path: `/${lang}/guides/${g.slug}/`, lang, screen: 'S-11', indexable: idx, lastmod: lm(g.updated), alternates: alts });
      }
    }
  }
  if (hasPage('[lang]/about/page.tsx')) {
    const alts = allLangAlts((l) => `/${l}/about/`);
    for (const lang of config.locales) {
      entries.push({ path: `/${lang}/about/`, lang, screen: 'S-12', indexable: true, lastmod: lm(meta.generatedAt), alternates: alts });
    }
  }
  for (const kind of ['privacy', 'terms'] as const) {
    if (!hasPage(`[lang]/${kind}/page.tsx`)) continue;
    const docs = new Map<Lang, ReturnType<typeof readLegal>>();
    const idxAlts: Record<string, string> = {};
    for (const l of config.locales) {
      if (hasLegal(l, kind)) {
        const doc = readLegal(l, kind);
        docs.set(l, doc);
        if (guideIndexable(doc.reviewed)) idxAlts[l] = `/${l}/${kind}/`;
      }
    }
    for (const [lang, doc] of docs) {
      const idx = guideIndexable(doc.reviewed);
      entries.push({
        path: `/${lang}/${kind}/`, lang, screen: 'S-13', indexable: idx,
        lastmod: lm(doc.effective), alternates: idx ? idxAlts : {},
      });
    }
  }
  if (hasPage('[lang]/tools/premium-calculator/page.tsx')) {
    const alts = allLangAlts((l) => `/${l}/tools/premium-calculator/`);
    for (const lang of config.locales) {
      entries.push({
        path: `/${lang}/tools/premium-calculator/`, lang, screen: 'S-16', indexable: true,
        lastmod: lm(config.fx.baseDate), alternates: alts,
      });
    }
  }
  return { siteUrl: config.site.url, entries };
}

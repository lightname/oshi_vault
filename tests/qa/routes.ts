import fs from 'node:fs';
import path from 'node:path';
import type { Goods, Ip, Lang, PriceSnapshot } from '@/lib/data/types';

export type QaRoute = { screen: string; lang: Lang | 'root'; path: string };

const ROOT = process.cwd();
const ips = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/generated/ips.json'), 'utf8')) as Ip[];
const goods = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/generated/goods.json'), 'utf8')) as Goods[];
const prices = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/generated/prices.json'), 'utf8')) as PriceSnapshot[];

const topIp = [...ips].sort((a, b) => b.goodsCount - a.goodsCount || a.order - b.order)[0];
const pricedIds = new Set(prices.map((p) => p.goodsId));
const sampleGoods = goods.find((g) => pricedIds.has(g.id)) ?? goods[0];

function firstGuideSlug(lang: Lang): string | null {
  const dir = path.join(ROOT, 'content', lang, 'guides');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((x) => x.endsWith('.md'));
  return f ? f.replace(/\.md$/, '') : null;
}

export function getQaRoutes(): QaRoute[] {
  const routes: QaRoute[] = [
    { screen: 'S-00', lang: 'root', path: '/' },
    { screen: 'S-15', lang: 'root', path: '/__missing__/' },
  ];
  const langs: Lang[] = ['ko', 'en', 'ja'];
  for (const lang of langs) {
    routes.push({ screen: 'S-01', lang, path: `/${lang}/` });
    routes.push({ screen: 'S-02', lang, path: `/${lang}/ip/` });
    if (topIp) routes.push({ screen: 'S-03', lang, path: `/${lang}/ip/${topIp.slug}/` });
    if (sampleGoods) {
      const slug = sampleGoods.slug
        ? `${sampleGoods.id.toLowerCase()}-${sampleGoods.slug}`
        : sampleGoods.id.toLowerCase();
      routes.push({ screen: 'S-04', lang, path: `/${lang}/goods/${slug}/` });
    }
    routes.push({ screen: 'S-05', lang, path: `/${lang}/search/` });
    routes.push({ screen: 'S-06', lang, path: `/${lang}/scan/` });
    routes.push({ screen: 'S-07', lang, path: `/${lang}/collection/` });
    routes.push({ screen: 'S-08', lang, path: `/${lang}/wishlist/` });
    routes.push({ screen: 'S-09', lang, path: `/${lang}/share/` });
    routes.push({ screen: 'S-10', lang, path: `/${lang}/guides/` });
    const guideSlug = firstGuideSlug(lang);
    if (guideSlug) routes.push({ screen: 'S-11', lang, path: `/${lang}/guides/${guideSlug}/` });
    routes.push({ screen: 'S-12', lang, path: `/${lang}/about/` });
    routes.push({ screen: 'S-13', lang, path: `/${lang}/privacy/` });
    routes.push({ screen: 'S-16', lang, path: `/${lang}/tools/premium-calculator/` });
  }
  return routes;
}

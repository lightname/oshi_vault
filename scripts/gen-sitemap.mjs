import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'out');
const manifestPath = path.join(OUT, 'seo-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('[sitemap] missing out/seo-manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const siteUrl = manifest.siteUrl.replace(/\/$/, '');
const locales = ['ko', 'en', 'ja'];
const buckets = { ko: [], en: [], ja: [] };

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

for (const entry of manifest.entries) {
  if (!entry.indexable) continue;
  const target = entry.lang && buckets[entry.lang] ? entry.lang : 'en';
  buckets[target].push(entry);
}

for (const lang of locales) {
  const urls = buckets[lang].map((e) => {
    const loc = `${siteUrl}${e.path}`;
    const links = Object.entries(e.alternates || {}).map(
      ([hreflang, p]) =>
        `    <xhtml:link rel="alternate" hreflang="${esc(hreflang)}" href="${esc(`${siteUrl}${p}`)}" />`
    );
    links.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(`${siteUrl}/`)}" />`
    );
    return [
      '  <url>',
      `    <loc>${esc(loc)}</loc>`,
      `    <lastmod>${esc(e.lastmod)}</lastmod>`,
      ...links,
      '  </url>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT, `sitemap-${lang}.xml`), xml, 'utf8');
}

const indexXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...locales.map(
    (lang) => `  <sitemap>\n    <loc>${esc(`${siteUrl}/sitemap-${lang}.xml`)}</loc>\n  </sitemap>`
  ),
  '</sitemapindex>',
  '',
].join('\n');

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), indexXml, 'utf8');

for (const lang of locales) {
  for (const rel of [
    `${lang}/guides/_none`,
    `${lang}/guides/_none.txt`,
    `${lang}/ip/_none`,
    `${lang}/ip/_none.txt`,
  ]) {
    fs.rmSync(path.join(OUT, rel), { recursive: true, force: true });
  }
}

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const issues = [];
const fail = (p, rule) => issues.push(`[seo] ${p} ${rule}`);

const manifestPath = path.join(OUT, 'seo-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('[seo] /seo-manifest.json missing');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const siteUrl = manifest.siteUrl.replace(/\/$/, '');

const htmlPath = (p) => {
  const clean = p.replace(/^\//, '');
  return clean === '' ? path.join(OUT, 'index.html') : path.join(OUT, clean, 'index.html');
};

const getAttr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return m ? m[1] : null;
};

const hasNoindex = (html) => {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  return metas.some((m) => /name=["']robots["']/i.test(m) && /noindex/i.test(getAttr(m, 'content') || ''));
};

const indexableLocs = new Set();

for (const e of manifest.entries) {
  const file = htmlPath(e.path);
  if (!fs.existsSync(file)) {
    fail(e.path, 'missing html file');
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titles.length !== 1 || titles[0][1].trim() === '') fail(e.path, 'invalid <title>');

  const links = html.match(/<link\b[^>]*>/gi) || [];
  const canonicals = links.filter((l) => /rel=["']canonical["']/i.test(l));
  const expectedCanon = `${siteUrl}${e.path}`;
  if (canonicals.length !== 1 || getAttr(canonicals[0], 'href') !== expectedCanon) {
    fail(e.path, `canonical mismatch (expected ${expectedCanon})`);
  }

  const noindex = hasNoindex(html);
  if (!e.indexable && !noindex) fail(e.path, 'expected noindex');
  if (e.indexable && noindex) fail(e.path, 'unexpected noindex');

  if (e.indexable) {
    indexableLocs.add(expectedCanon);
    const alts = new Map();
    for (const l of links) {
      if (/rel=["']alternate["']/i.test(l) && /hreflang=/i.test(l)) {
        const hl = getAttr(l, 'hreflang');
        const href = getAttr(l, 'href');
        if (hl && href) alts.set(hl, href);
      }
    }
    const expectedAlts = new Map(
      Object.entries(e.alternates || {}).map(([l, p]) => [l, `${siteUrl}${p}`])
    );
    expectedAlts.set('x-default', `${siteUrl}/`);
    if (alts.size !== expectedAlts.size || [...expectedAlts.entries()].some(([k, v]) => alts.get(k) !== v)) {
      fail(e.path, 'hreflang set mismatch');
    }
  }

  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of ldBlocks) {
    try { JSON.parse(b[1]); } catch { fail(e.path, 'invalid json-ld'); }
  }

  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const ogImg = metas.find((m) => /property=["']og:image["']/i.test(m));
  const ogUrl = ogImg ? getAttr(ogImg, 'content') : null;
  const siteOrigin = new URL(siteUrl).origin.toLowerCase();
  if (!ogUrl || !ogUrl.toLowerCase().startsWith(siteOrigin)) {
    fail(e.path, 'missing og:image');
  } else {
    const rel = ogUrl.slice(siteOrigin.length).replace(/^\//, '');
    if (!fs.existsSync(path.join(OUT, rel))) fail(e.path, `missing og:image file ${rel}`);
  }
}

const sitemapPath = path.join(OUT, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  fail('/sitemap.xml', 'missing sitemap index');
} else {
  const idx = fs.readFileSync(sitemapPath, 'utf8');
  const subLocs = new Set();
  for (const lang of ['ko', 'en', 'ja']) {
    const expectedSub = `${siteUrl}/sitemap-${lang}.xml`;
    if (!idx.includes(`<loc>${expectedSub}</loc>`)) fail('/sitemap.xml', `missing ${expectedSub}`);
    const subFile = path.join(OUT, `sitemap-${lang}.xml`);
    if (!fs.existsSync(subFile)) { fail(`/sitemap-${lang}.xml`, 'missing file'); continue; }
    const subXml = fs.readFileSync(subFile, 'utf8');
    for (const m of subXml.matchAll(/<loc>([^<]+)<\/loc>/g)) subLocs.add(m[1]);
  }
  if (subLocs.size !== indexableLocs.size || [...indexableLocs].some((u) => !subLocs.has(u))) {
    fail('/sitemap.xml', 'sitemap locs mismatch indexable entries');
  }
}

const robotsPath = path.join(OUT, 'robots.txt');
if (!fs.existsSync(robotsPath) || !/^Sitemap:\s+\S+/m.test(fs.readFileSync(robotsPath, 'utf8'))) {
  fail('/robots.txt', 'missing Sitemap line');
}

const noindexPages = ['search', 'scan', 'collection', 'wishlist', 'share'];
for (const slug of noindexPages) {
  if (!fs.existsSync(path.join(ROOT, 'src/app/[lang]', slug, 'page.tsx'))) continue;
  for (const lang of ['ko', 'en', 'ja']) {
    const p = `/${lang}/${slug}/`;
    const file = htmlPath(p);
    if (!fs.existsSync(file) || !hasNoindex(fs.readFileSync(file, 'utf8'))) {
      fail(p, 'missing noindex on utility page');
    }
  }
}

if (fs.existsSync(path.join(ROOT, 'src/app/not-found.tsx')) && !fs.existsSync(path.join(OUT, '404.html'))) {
  fail('/404.html', 'missing 404.html');
}

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(`[seo] OK (${manifest.entries.length} entries, ${indexableLocs.size} indexable)`);

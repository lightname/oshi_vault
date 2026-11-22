import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { config } from '@/config';
import type { ImageId } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';

const ROOT = path.join(process.cwd(), 'content');

export type Guide = {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  date: string;
  updated: string;
  ipSlugs: string[];
  reviewed: boolean;
  endCta: 'primary' | 'secondary' | 'scan' | 'shelf';
  html: string;
  toc: { id: string; text: string }[];
};

export type LegalKind = 'privacy' | 'terms';

export type LegalDoc = {
  kind: LegalKind;
  lang: Lang;
  title: string;
  effective: string;
  reviewed: boolean;
  html: string;
};

const COVER_MAP: Record<string, ImageId> = {
  'how-to-check-resale-price': 'IMG-13',
  'find-barcode-product-code': 'IMG-14',
  'limited-edition-types': 'IMG-15',
  'ways-to-buy-japan-exclusive': 'IMG-16',
  'how-to-read-prices': 'IMG-17',
};

export const coverImageId = (slug: string): ImageId => COVER_MAP[slug] ?? 'IMG-12';

export function hasGuide(lang: Lang, slug: string): boolean {
  return fs.existsSync(path.join(ROOT, lang, 'guides', `${slug}.md`));
}

export function listGuides(lang: Lang): Guide[] {
  const dir = path.join(ROOT, lang, 'guides');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readGuide(lang, f.replace(/\.md$/, '')))
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}

export function readGuide(lang: Lang, slug: string): Guide {
  const { data, content } = matter(
    fs.readFileSync(path.join(ROOT, lang, 'guides', `${slug}.md`), 'utf8')
  );
  for (const k of ['title', 'description', 'date', 'updated', 'ipSlugs', 'reviewed', 'endCta']) {
    if (data[k] === undefined) throw new Error(`[content] ${lang}/${slug}: missing ${k}`);
  }
  const toc: Guide['toc'] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((tok) => ('text' in tok ? String(tok.text) : '')).join('');
    if (depth !== 2) return `<h${depth}>${text}</h${depth}>`;
    const id = `s-${toc.length + 1}`;
    toc.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  };
  const html = marked.parse(content, { renderer, async: false }) as string;
  return {
    slug,
    lang,
    title: String(data.title),
    description: String(data.description),
    date: String(data.date).slice(0, 10),
    updated: String(data.updated).slice(0, 10),
    ipSlugs: Array.isArray(data.ipSlugs) ? data.ipSlugs.map(String) : [],
    reviewed: Boolean(data.reviewed),
    endCta: data.endCta as Guide['endCta'],
    html,
    toc,
  };
}

export const guideLangs = (slug: string): Lang[] =>
  config.locales.filter((l) => hasGuide(l, slug));

export function hasLegal(lang: Lang, kind: LegalKind): boolean {
  return fs.existsSync(path.join(ROOT, lang, 'legal', `${kind}.md`));
}

export function readLegal(lang: Lang, kind: LegalKind): LegalDoc {
  const { data, content } = matter(
    fs.readFileSync(path.join(ROOT, lang, 'legal', `${kind}.md`), 'utf8')
  );
  for (const k of ['title', 'effective', 'reviewed']) {
    if (data[k] === undefined) throw new Error(`[content] ${lang}/legal/${kind}: missing ${k}`);
  }
  const html = marked.parse(content, { async: false }) as string;
  return {
    kind,
    lang,
    title: String(data.title),
    effective: String(data.effective).slice(0, 10),
    reviewed: Boolean(data.reviewed),
    html,
  };
}

export const legalLangs = (kind: LegalKind): Lang[] =>
  config.locales.filter((l) => hasLegal(l, kind));

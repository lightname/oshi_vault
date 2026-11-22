import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { config } from '@/config';
import { setConsent } from '@/lib/analytics/consent';
import type { Guide } from '@/lib/content/content';
import { getImage } from '@/lib/data/images';
import { getDictionary } from '@/lib/i18n/dictionary';
import { currentPrice } from '@/lib/price/price';
import { guideIndexable } from '@/lib/seo/indexing';
import { generateStaticParams } from '@/app/[lang]/guides/[slug]/page';
import { GuideDetailView } from '@/components/guides/GuideDetailView';
import { splitGuideHtml } from '@/components/guides/guideHtml';
import { fixtureCatalog, fixtureGoods, fixtureIps, fixturePrices } from '../fixtures/catalog';

function loadFixtureGuide(slug: string): Guide {
  const file = path.join(
    process.cwd(),
    'tests/unit/fixtures/content/ko/guides',
    `${slug}.md`
  );
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
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
  const toIso = (v: unknown) =>
    v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
  return {
    slug,
    lang: 'ko',
    title: String(data.title),
    description: String(data.description),
    date: toIso(data.date),
    updated: toIso(data.updated),
    ipSlugs: data.ipSlugs as string[],
    reviewed: Boolean(data.reviewed),
    endCta: data.endCta as Guide['endCta'],
    html,
    toc,
  };
}

describe('S-11 GuideDetailView & routing', () => {
  const dict = getDictionary('ko');
  const cur = currentPrice('PKM-0001', fixturePrices, fixtureCatalog.meta.generatedAt)!;
  const slotGoods = [{ goods: fixtureGoods[0], ip: fixtureIps[0], current: cur }];

  it('splits HTML before s-3, renders TOC, Slot A, and all 4 endCta modes', () => {
    const base = loadFixtureGuide('sample-guide');
    const [before, after] = splitGuideHtml(base.html);
    expect(before).toContain('id="s-2"');
    expect(after).toContain('id="s-3"');

    const { rerender } = render(
      <GuideDetailView
        lang="ko"
        dict={dict}
        guide={base}
        cover={getImage('IMG-13', 'ko')}
        slotGoods={slotGoods}
        primaryIp={fixtureIps[0]}
        relatedGoods={[{ goods: fixtureGoods[0], current: cur }]}
        relatedIps={[fixtureIps[0]]}
        otherGuides={[]}
      />
    );
    expect(screen.getByRole('heading', { level: 1, name: base.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['cta.scan'] })).toBeInTheDocument();

    rerender(
      <GuideDetailView
        lang="ko"
        dict={dict}
        guide={{ ...base, endCta: 'shelf' }}
        cover={getImage('IMG-13', 'ko')}
        slotGoods={slotGoods}
        primaryIp={fixtureIps[0]}
        relatedGoods={[]}
        relatedIps={[]}
        otherGuides={[]}
      />
    );
    expect(screen.getByRole('link', { name: dict['col.emptySearch'] })).toBeInTheDocument();

    rerender(
      <GuideDetailView
        lang="ko"
        dict={dict}
        guide={{ ...base, endCta: 'secondary' }}
        cover={getImage('IMG-13', 'ko')}
        slotGoods={slotGoods}
        primaryIp={fixtureIps[0]}
        relatedGoods={[]}
        relatedIps={[]}
        otherGuides={[]}
      />
    );
    expect(screen.getByRole('button', { name: dict['cta.secondary'] })).toBeInTheDocument();

    rerender(
      <GuideDetailView
        lang="ko"
        dict={dict}
        guide={{ ...base, endCta: 'primary' }}
        cover={getImage('IMG-13', 'ko')}
        slotGoods={slotGoods}
        primaryIp={fixtureIps[0]}
        relatedGoods={[]}
        relatedIps={[]}
        otherGuides={[]}
      />
    );
    expect(screen.getAllByRole('link', { name: /Mercari에서 매물 보기/ }).length).toBe(2);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
    delete window.gtag;
    (config.analytics as { ga4Id: string }).ga4Id = '';
    (config.api as { mode: 'mock' | 'live' }).mode = 'mock';
    (config.google as { clientId: string }).clientId = '';
  });

  it('fires guide_cta_click only on actual CTA clicks, not container or checkbox clicks', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    vi.stubEnv('NODE_ENV', 'production');
    (config.analytics as { ga4Id: string }).ga4Id = 'G-TEST';
    (config.api as { mode: 'mock' | 'live' }).mode = 'live';
    (config.google as { clientId: string }).clientId = 'client-1';
    setConsent('granted');
    Object.defineProperty(window, 'location', {
      value: { hostname: 'oshivault.example', pathname: '/ko/guides/sample-guide/' },
      configurable: true,
    });
    document.body.dataset.screen = 'S-11';

    const base = loadFixtureGuide('sample-guide');
    render(
      <GuideDetailView
        lang="ko"
        dict={dict}
        guide={{ ...base, endCta: 'secondary' }}
        cover={getImage('IMG-13', 'ko')}
        slotGoods={slotGoods}
        primaryIp={fixtureIps[0]}
        relatedGoods={[]}
        relatedIps={[]}
        otherGuides={[]}
      />
    );

    // Click non-CTA text inside Slot A and Slot B -> 0 guide_cta_click
    fireEvent.click(screen.getByText(dict['subscribe.targetTitle']));
    expect(gtag.mock.calls.filter((c) => c[1] === 'guide_cta_click')).toHaveLength(0);

    // Click actual CTA in Slot A -> 1 primary
    fireEvent.click(screen.getByRole('link', { name: /Mercari에서 매물 보기/ }));
    expect(gtag.mock.calls.filter((c) => c[1] === 'guide_cta_click')).toHaveLength(1);

    // Click stage-1 CTA in Slot B -> 1 secondary; then checkbox click -> still 2 total
    fireEvent.click(screen.getByRole('button', { name: dict['cta.secondary'] }));
    expect(gtag.mock.calls.filter((c) => c[1] === 'guide_cta_click')).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(gtag.mock.calls.filter((c) => c[1] === 'guide_cta_click')).toHaveLength(2);
  });

  it('marks reviewed=false as noindex and does not generate missing slugs', () => {
    const unrev = loadFixtureGuide('unreviewed');
    expect(guideIndexable(unrev.reviewed)).toBe(false);
    const params = generateStaticParams();
    expect(params.some((p) => p.slug === 'non-existent-slug')).toBe(false);
  });
});

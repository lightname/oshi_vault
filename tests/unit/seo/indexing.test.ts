import { afterEach, describe, expect, it } from 'vitest';
import { config } from '@/config';
import {
  goodsComplete,
  goodsIndexable,
  guideIndexable,
  guidesListIndexable,
  ipHubGenerated,
  ipHubIndexable,
  lastmodOverride,
  typePageGenerated,
} from '@/lib/seo/indexing';
import { fixtureGoods, fixtureIps } from '../fixtures/catalog';

const mutableSeo = config.seo as { indexLevel: 1 | 2 | 3 | 4 };

afterEach(() => {
  mutableSeo.indexLevel = 1;
});

describe('SEO indexing rules (C-29)', () => {
  it('evaluates goodsComplete and goodsIndexable across index levels', () => {
    const reviewedBoth = fixtureGoods[0];
    const unreviewed = fixtureGoods[1];
    const incomplete = fixtureGoods[3];

    expect(goodsComplete(reviewedBoth)).toBe(true);
    expect(goodsComplete(incomplete)).toBe(false);

    mutableSeo.indexLevel = 1;
    expect(goodsIndexable(reviewedBoth, 'ko')).toBe(true);
    expect(goodsIndexable(reviewedBoth, 'en')).toBe(true);
    expect(goodsIndexable(unreviewed, 'ko')).toBe(true);
    expect(goodsIndexable(unreviewed, 'en')).toBe(false);
    expect(goodsIndexable(incomplete, 'ko')).toBe(false);

    mutableSeo.indexLevel = 3;
    expect(goodsIndexable(incomplete, 'en')).toBe(true);
  });

  it('evaluates IP hub, type page, guides, and lastmod override', () => {
    const activeIp = fixtureIps[0];
    const emptyIp = { ...fixtureIps[0], goodsCount: 0 };

    mutableSeo.indexLevel = 1;
    expect(ipHubGenerated(activeIp)).toBe(true);
    expect(ipHubIndexable(emptyIp)).toBe(false);
    expect(typePageGenerated(10)).toBe(false);
    expect(lastmodOverride()).toBeNull();

    mutableSeo.indexLevel = 2;
    expect(typePageGenerated(2)).toBe(false);
    expect(typePageGenerated(3)).toBe(true);

    mutableSeo.indexLevel = 3;
    expect(ipHubGenerated(emptyIp)).toBe(true);
    expect(typePageGenerated(0)).toBe(false);
    expect(typePageGenerated(1)).toBe(true);

    mutableSeo.indexLevel = 4;
    expect(lastmodOverride()).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(guideIndexable(true)).toBe(true);
    expect(guideIndexable(false)).toBe(false);
    expect(guidesListIndexable(0)).toBe(false);
    expect(guidesListIndexable(1)).toBe(true);
  });
});

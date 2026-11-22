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
    const noEnName = fixtureGoods[3];
    const missingKo = { ...fixtureGoods[3], name: { ...fixtureGoods[3].name, ko: '' } };
    const missingJa = { ...fixtureGoods[3], name: { ...fixtureGoods[3].name, ja: '' } };
    const zeroPrice = { ...fixtureGoods[3], retail: { ...fixtureGoods[3].retail, price: 0 } };
    const reviewedNoEn = { ...fixtureGoods[3], review: { en: true, ja: true } };

    expect(goodsComplete(reviewedBoth)).toBe(true);
    expect(goodsComplete(reviewedBoth, 'en')).toBe(true);
    expect(goodsComplete(noEnName)).toBe(true);
    expect(goodsComplete(noEnName, 'ko')).toBe(true);
    expect(goodsComplete(noEnName, 'en')).toBe(false);
    expect(goodsComplete(missingKo)).toBe(false);
    expect(goodsComplete(missingJa)).toBe(false);
    expect(goodsComplete(zeroPrice)).toBe(false);

    mutableSeo.indexLevel = 1;
    expect(goodsIndexable(reviewedBoth, 'ko')).toBe(true);
    expect(goodsIndexable(reviewedBoth, 'en')).toBe(true);
    expect(goodsIndexable(unreviewed, 'ko')).toBe(true);
    expect(goodsIndexable(unreviewed, 'en')).toBe(false);
    expect(goodsIndexable(noEnName, 'ko')).toBe(true);
    expect(goodsIndexable(reviewedNoEn, 'en')).toBe(false);
    expect(goodsIndexable(reviewedNoEn, 'ja')).toBe(true);
    expect(goodsIndexable(missingKo, 'ko')).toBe(false);

    mutableSeo.indexLevel = 3;
    expect(goodsIndexable(missingKo, 'en')).toBe(true);
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

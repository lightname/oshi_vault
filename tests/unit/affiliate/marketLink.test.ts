import { afterEach, describe, expect, it } from 'vitest';
import { config } from '@/config';
import { anyAffiliate, hasAffiliate, MARKET_LABEL, marketUrl } from '@/lib/affiliate/marketLink';
import { fixtureGoods } from '../fixtures/catalog';

const mutableAff = config.affiliate as Record<
  'ebay' | 'mercari' | 'kream',
  { param: string; value: string } | null
>;

afterEach(() => {
  mutableAff.ebay = null;
  mutableAff.mercari = null;
  mutableAff.kream = null;
});

describe('market links and affiliate parameters (C-38)', () => {
  it('builds search URLs when sourceUrl is null and preserves sourceUrl otherwise', () => {
    const g = fixtureGoods[0];
    const gNoEn = fixtureGoods[3];
    expect(marketUrl(g, 'ebay', null)).toContain('ebay.com');
    expect(marketUrl(gNoEn, 'ebay', null)).toContain(encodeURIComponent(gNoEn.original));
    expect(marketUrl(g, 'mercari', null)).toContain('jp.mercari.com');
    expect(marketUrl(g, 'kream', null)).toContain('kream.co.kr');
    expect(marketUrl(g, 'other', null)).toBeNull();
    expect(marketUrl(g, 'other', 'https://other.example/1')).toBe('https://other.example/1');
    expect(MARKET_LABEL.ebay).toBe('eBay');
  });

  it('appends affiliate query params when configured', () => {
    const g = fixtureGoods[0];
    expect(anyAffiliate()).toBe(false);
    expect(hasAffiliate('ebay')).toBe(false);
    expect(hasAffiliate('other')).toBe(false);

    mutableAff.ebay = { param: 'campid', value: '12345' };
    expect(anyAffiliate()).toBe(true);
    expect(hasAffiliate('ebay')).toBe(true);
    const url = marketUrl(g, 'ebay', 'https://www.ebay.com/itm/1');
    expect(url).toBe('https://www.ebay.com/itm/1?campid=12345');
  });
});

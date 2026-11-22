import { describe, expect, it } from 'vitest';
import { matchCode, norm, search } from '@/lib/match/match';
import { fixtureCatalog, fixtureGoods } from '../fixtures/catalog';

describe('catalog matching and search (C-39)', () => {
  it('normalizes strings and matches codes', () => {
    expect(norm('ＡＢ-12 3・4')).toBe('ab1234');
    expect(matchCode('4521329300001', fixtureGoods)?.id).toBe('PKM-0001');
    expect(matchCode('4521-3293-00001', fixtureGoods)?.id).toBe('PKM-0001');
    expect(matchCode('CHK_A100', fixtureGoods)?.id).toBe('CHK-0001');
    expect(matchCode('999', fixtureGoods)).toBeNull();
  });

  it('searches by code first then name/IP and handles empty query', () => {
    expect(search('   ', fixtureCatalog)).toEqual([]);
    const byCode = search('4521329300001', fixtureCatalog);
    expect(byCode[0].id).toBe('PKM-0001');

    const byIp = search('포켓몬', fixtureCatalog);
    expect(byIp.map((g) => g.id)).toEqual(['PKM-0001', 'PKM-0002']);

    const byEn = search('chiikawa', fixtureCatalog);
    expect(byEn).toHaveLength(2);

    const orphanCatalog = {
      ...fixtureCatalog,
      ips: [],
    };
    expect(search('피카츄', orphanCatalog)).toHaveLength(1);
  });
});

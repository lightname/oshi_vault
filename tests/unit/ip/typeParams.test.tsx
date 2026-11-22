import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { config } from '@/config';
import { getDictionary } from '@/lib/i18n/dictionary';
import { collectTypeCombos } from '@/components/ip/typeParams';
import { IpGoodsGrid } from '@/components/ip/IpGoodsGrid';
import { fixtureCatalog, fixtureGoods, fixtureIps } from '../fixtures/catalog';

const mutableSeo = config.seo as { indexLevel: 1 | 2 | 3 | 4 };

afterEach(() => {
  mutableSeo.indexLevel = 1;
});

describe('S-14 IP x Type generation and view', () => {
  it('generates 0 combos at L1, >=3 count combos at L2, and >=1 count combos at L3', () => {
    const extraGoods = [
      ...fixtureGoods,
      { ...fixtureGoods[0], id: 'PKM-0003' },
      { ...fixtureGoods[0], id: 'PKM-0004' },
    ];

    mutableSeo.indexLevel = 1;
    expect(collectTypeCombos(fixtureIps, extraGoods)).toEqual([]);

    mutableSeo.indexLevel = 2;
    expect(collectTypeCombos(fixtureIps, extraGoods)).toEqual([
      { ipSlug: 'pokemon', type: 'figure' },
    ]);

    mutableSeo.indexLevel = 3;
    expect(collectTypeCombos(fixtureIps, extraGoods)).toHaveLength(4);
  });

  it('renders S-14 sibling type links and filterAll link back to S-03', () => {
    const dict = getDictionary('ko');
    const ip = fixtureCatalog.ips[0];
    const items = fixtureGoods
      .filter((g) => g.ipSlug === 'pokemon' && g.type === 'figure')
      .map((g) => ({ goods: g, current: null, premium: null }));

    render(
      <IpGoodsGrid
        lang="ko"
        dict={dict}
        ip={ip}
        items={items}
        availableTypes={['figure', 'plush']}
        linkedTypes={['figure', 'plush']}
        fixedType="figure"
      />
    );

    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute('href', '/ko/ip/pokemon');
    expect(screen.getByRole('link', { name: '피규어' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '인형' })).toHaveAttribute(
      'href',
      '/ko/ip/pokemon/plush'
    );
  });
});

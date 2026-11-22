import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { marketUrl } from '@/lib/affiliate/marketLink';
import { getDictionary } from '@/lib/i18n/dictionary';
import { currentPrice } from '@/lib/price/price';
import { MarketButtons } from '@/components/goods/MarketButtons';
import { fixtureCatalog } from '../fixtures/catalog';

describe('C-08 MarketButtons (QA-02)', () => {
  const dict = getDictionary('ko');
  const goods = fixtureCatalog.goods[0];
  const cur = currentPrice(goods.id, fixtureCatalog.prices, fixtureCatalog.meta.generatedAt)!;

  it('renders 2 market links with primary-first hierarchy, attributes, and C-38 URLs', () => {
    render(<MarketButtons goods={goods} lang="ko" dict={dict} markets={cur.markets} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0]).toHaveTextContent('Mercari에서 매물 보기');
    expect(links[0]).toHaveClass('bg-primary');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'sponsored nofollow noopener');
    expect(links[0]).toHaveAttribute(
      'href',
      marketUrl(goods, cur.markets[0].market, cur.markets[0].sourceUrl)
    );

    expect(links[1]).toHaveTextContent('eBay에서 매물 보기');
    expect(links[1]).not.toHaveClass('bg-primary');
    expect(links[1]).toHaveClass('border-secondary');
    expect(links[1]).toHaveAttribute('target', '_blank');
    expect(links[1]).toHaveAttribute('rel', 'sponsored nofollow noopener');
    expect(links[1]).toHaveAttribute(
      'href',
      marketUrl(goods, cur.markets[1].market, cur.markets[1].sourceUrl)
    );
  });

  it('renders 3 secondary search buttons and zero primary buttons when no markets exist', () => {
    render(<MarketButtons goods={goods} lang="ko" dict={dict} markets={[]} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent)).toEqual([
      'eBay에서 검색하기',
      'Mercari에서 검색하기',
      'KREAM에서 검색하기',
    ]);
    for (const link of links) {
      expect(link).not.toHaveClass('bg-primary');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'sponsored nofollow noopener');
    }
  });
});

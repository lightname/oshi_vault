import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getDictionary } from '@/lib/i18n/dictionary';
import { currentPrice, premiumRatio } from '@/lib/price/price';
import { IpGoodsGrid } from '@/components/ip/IpGoodsGrid';
import { fixtureCatalog } from '../fixtures/catalog';

describe('S-03 IpGoodsGrid', () => {
  const ip = fixtureCatalog.ips[0];
  const pkmGoods = fixtureCatalog.goods.filter((g) => g.ipSlug === ip.slug);
  const items = pkmGoods.map((g) => {
    const cur = currentPrice(g.id, fixtureCatalog.prices, fixtureCatalog.meta.generatedAt);
    return { goods: g, current: cur, premium: cur ? premiumRatio(cur.jpy, g.retail) : null };
  });

  it('renders goods cards, filters by type, and sorts by name', () => {
    const dict = getDictionary('ko');
    render(
      <IpGoodsGrid
        lang="ko"
        dict={dict}
        ip={ip}
        items={items}
        availableTypes={['figure', 'plush']}
        linkedTypes={[]}
      />
    );

    expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();
    expect(screen.getByText('이브이 인형')).toBeInTheDocument();
    expect(screen.getByText('시세 수집 중')).toBeInTheDocument();
    expect(screen.getByText('+56%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '인형' }));
    expect(screen.queryByText('피카츄 피규어')).not.toBeInTheDocument();
    expect(screen.getByText('이브이 인형')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    fireEvent.change(screen.getByLabelText('정렬'), { target: { value: 'name' } });
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['이브이 인형', '피카츄 피규어']);
  });

  it('shows empty filter state and resets filter', () => {
    const dict = getDictionary('ko');
    render(
      <IpGoodsGrid
        lang="ko"
        dict={dict}
        ip={ip}
        items={items}
        availableTypes={['figure', 'card']}
        linkedTypes={[]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '카드' }));
    expect(screen.getByText('이 유형의 굿즈가 아직 없어요.')).toBeInTheDocument();
    const allBtns = screen.getAllByRole('button', { name: '전체' });
    fireEvent.click(allBtns[allBtns.length - 1]);
    expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();
  });
});

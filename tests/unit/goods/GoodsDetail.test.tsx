import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getDictionary } from '@/lib/i18n/dictionary';
import { currentPrice } from '@/lib/price/price';
import { _resetStoreForTest, getSnapshot } from '@/lib/storage/store';
import { GoodsDetailView } from '@/components/goods/GoodsDetailView';
import { generateStaticParams } from '@/app/[lang]/goods/[idSlug]/page';
import { fixtureCatalog } from '../fixtures/catalog';

beforeEach(() => {
  window.localStorage.clear();
  _resetStoreForTest();
});

describe('S-04 GoodsDetailView & static params', () => {
  it('renders priced goods with chart, sales table, market CTA, and validates target price form', async () => {
    const dict = getDictionary('ko');
    const g = fixtureCatalog.goods[0];
    const ip = fixtureCatalog.ips[0];
    const prices = fixtureCatalog.prices.filter((p) => p.goodsId === g.id);
    const cur = currentPrice(g.id, prices, fixtureCatalog.meta.generatedAt);

    render(
      <GoodsDetailView
        goods={g}
        ip={ip}
        lang="ko"
        dict={dict}
        prices={prices}
        current={cur}
        limitGuideHref={null}
        howToReadHref="/ko/about/"
        relatedGoods={[{ goods: fixtureCatalog.goods[1], current: null }]}
        relatedGuides={[]}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('피카츄 피규어');
    expect(screen.getByText('Mercari에서 매물 보기')).toBeInTheDocument();
    expect(screen.getByText('거래가 추이')).toBeInTheDocument();
    expect(screen.getByText('거래 기록')).toBeInTheDocument();

    const shelfBtn = screen.getByRole('button', { name: '진열장에 담기' });
    await waitFor(() => expect(shelfBtn).not.toBeDisabled());
    fireEvent.click(shelfBtn);
    expect(getSnapshot().doc.collection[0].goodsId).toBe('PKM-0001');

    fireEvent.click(screen.getByRole('button', { name: '위시리스트에 담기' }));
    const targetInput = screen.getByLabelText('목표가');
    fireEvent.change(targetInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: '목표가 저장하기' }));
    expect(screen.getByRole('alert')).toHaveTextContent('입력 내용을 확인해 주세요.');

    fireEvent.change(targetInput, { target: { value: '50000' } });
    fireEvent.click(screen.getByRole('button', { name: '목표가 저장하기' }));
    expect(getSnapshot().doc.wishlist[0].targetPrice).toBe(50000);
    expect(getSnapshot().doc.wishlist[0].currency).toBe('KRW');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'USD' } });
    fireEvent.change(targetInput, { target: { value: '40' } });
    fireEvent.click(screen.getByRole('button', { name: '목표가 저장하기' }));
    expect(getSnapshot().doc.wishlist[0].targetPrice).toBe(40);
    expect(getSnapshot().doc.wishlist[0].currency).toBe('USD');
  });

  it('renders collecting state with search buttons when price data is absent', () => {
    const dict = getDictionary('ko');
    const g = fixtureCatalog.goods[1];
    const ip = fixtureCatalog.ips[0];

    render(
      <GoodsDetailView
        goods={g}
        ip={ip}
        lang="ko"
        dict={dict}
        prices={[]}
        current={null}
        limitGuideHref={null}
        howToReadHref="/ko/about/"
        relatedGoods={[]}
        relatedGuides={[]}
      />
    );

    expect(screen.getByText('이 굿즈는 시세를 수집하고 있어요')).toBeInTheDocument();
    expect(screen.getByText('eBay에서 검색하기')).toBeInTheDocument();
    expect(screen.getByText('Mercari에서 검색하기')).toBeInTheDocument();
    expect(screen.getByText('KREAM에서 검색하기')).toBeInTheDocument();
    expect(screen.queryByText('거래 기록')).not.toBeInTheDocument();
  });

  it('generateStaticParams excludes unknown ids and slugs', () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThan(0);
    expect(params.some((p) => p.idSlug === 'xxx-9999-missing')).toBe(false);
  });
});

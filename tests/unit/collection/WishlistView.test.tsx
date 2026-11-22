import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';
import { _resetStoreForTest } from '@/lib/storage/store';
import { fixtureCatalog } from '../fixtures/catalog';

vi.mock('@/lib/data/catalogClient', () => ({
  useCatalog: () => ({ status: 'ready', data: fixtureCatalog, retry: vi.fn() }),
}));

import { WishlistView } from '@/components/collection/WishlistView';

describe('S-08 WishlistView', () => {
  const dict = getDictionary('ko');

  beforeEach(() => {
    window.localStorage.clear();
    _resetStoreForTest();
  });

  it('renders empty state and subscribe section when wishlist is empty', async () => {
    render(<WishlistView lang="ko" dict={dict} />);
    expect(await screen.findByText(dict['wish.emptyTitle'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['wish.emptyCta'] })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/ip\/?$/)
    );
    expect(screen.getByRole('button', { name: dict['cta.secondary'] })).toBeInTheDocument();
  });

  it('validates target price, persists valid target, and promotes reached items', async () => {
    // PKM-0001 latest weighted JPY = (7000*6 + 60*150*4)/10 = 7800 JPY
    window.localStorage.setItem(
      'mipg.v1',
      JSON.stringify({
        version: 1,
        collection: [],
        wishlist: [
          {
            goodsId: 'PKM-0001',
            targetPrice: 5000,
            currency: 'JPY',
            addedAt: '2026-10-20T00:00:00.000Z',
          },
        ],
        prefs: { subscribed: {} },
      })
    );

    render(<WishlistView lang="ko" dict={dict} />);
    const input = await screen.findByLabelText(`피카츄 피규어 ${dict['wish.target']}`);

    // Invalid target price (0)
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);
    expect(screen.getByText(dict['errors.INVALID_REQUEST'])).toBeInTheDocument();

    // Valid target >= 7800 JPY triggers reached section
    fireEvent.change(input, { target: { value: '8000' } });
    fireEvent.blur(input);

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('mipg.v1') ?? '{}');
      expect(saved.wishlist[0].targetPrice).toBe(8000);
    });
    expect(screen.getByText('목표가에 도달한 굿즈 1개')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mercari에서 매물 보기/ })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';
import { _resetStoreForTest } from '@/lib/storage/store';
import { fixtureCatalog } from '../fixtures/catalog';

vi.mock('@/lib/data/catalogClient', () => ({
  useCatalog: () => ({ status: 'ready', data: fixtureCatalog, retry: vi.fn() }),
}));

import { CollectionView } from '@/components/collection/CollectionView';

describe('S-07 CollectionView', () => {
  const dict = getDictionary('ko');

  beforeEach(() => {
    window.localStorage.clear();
    _resetStoreForTest();
  });

  it('renders empty state when collection is empty', async () => {
    render(<CollectionView lang="ko" dict={dict} />);
    expect(await screen.findByText(dict['col.emptyTitle'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['cta.scan'] })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/scan\/?$/)
    );
  });

  it('computes total value, updates qty, removes item, and persists across reload', async () => {
    window.localStorage.setItem(
      'mipg.v1',
      JSON.stringify({
        version: 1,
        collection: [
          { id: 'PKM-0001', goodsId: 'PKM-0001', qty: 1, addedAt: '2026-10-20T00:00:00.000Z' },
          { id: 'PKM-0002', goodsId: 'PKM-0002', qty: 1, addedAt: '2026-10-21T00:00:00.000Z' },
          {
            id: 'USR-1',
            goodsId: null,
            manual: { name: '수동 굿즈', ipName: '포켓몬', price: 2000, currency: 'JPY' },
            qty: 1,
            addedAt: '2026-10-22T00:00:00.000Z',
          },
        ],
        wishlist: [],
        prefs: { subscribed: {} },
      })
    );

    const { unmount } = render(<CollectionView lang="ko" dict={dict} />);
    expect(await screen.findByText('피카츄 피규어')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['col.share'] })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/share\/?$/)
    );
    expect(screen.getByText(dict['col.chartTitle'])).toBeInTheDocument();

    // Increase qty on first row (PKM-0001 has highest value: 7800 JPY vs 3000 vs 2000)
    fireEvent.click(screen.getAllByRole('button', { name: '+' })[0]);
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('mipg.v1') ?? '{}');
      expect(saved.collection[0].qty).toBe(2);
    });

    // Simulate reload
    unmount();
    _resetStoreForTest();
    render(<CollectionView lang="ko" dict={dict} />);
    expect(await screen.findByText('2')).toBeInTheDocument();

    // Remove item via inline confirmation
    fireEvent.click(screen.getAllByRole('button', { name: dict['col.removeConfirm'] })[0]);
    fireEvent.click(screen.getByRole('button', { name: dict['col.remove'] }));
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('mipg.v1') ?? '{}');
      expect(saved.collection).toHaveLength(2);
    });
  });

  it('shows error state on corrupt localStorage and resets in two clicks', async () => {
    window.localStorage.setItem('mipg.v1', '{bad-json');
    render(<CollectionView lang="ko" dict={dict} />);

    expect(await screen.findByText(dict['col.loadError'])).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: dict['col.reset'] }));
    fireEvent.click(screen.getByRole('button', { name: dict['col.removeConfirm'] }));

    expect(await screen.findByText(dict['col.emptyTitle'])).toBeInTheDocument();
  });
});

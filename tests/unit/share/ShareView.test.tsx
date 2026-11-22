import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';
import { _resetStoreForTest } from '@/lib/storage/store';
import { fixtureCatalog } from '../fixtures/catalog';

const mockBlob = new Blob(['png'], { type: 'image/png' });
const renderCardMock = vi.fn().mockResolvedValue(mockBlob);
const downloadMock = vi.fn();

vi.mock('@/lib/data/catalogClient', () => ({
  useCatalog: () => ({ status: 'ready', data: fixtureCatalog, retry: vi.fn() }),
}));

vi.mock('@/lib/share/renderCard', () => ({
  renderCard: (...args: unknown[]) => renderCardMock(...args),
}));

vi.mock('@/lib/share/shareActions', () => ({
  canWebShareFile: () => false,
  shareCardFile: vi.fn(),
  downloadCardFile: (...args: unknown[]) => downloadMock(...args),
}));

import { ShareView } from '@/components/share/ShareView';

describe('S-09 ShareView', () => {
  const dict = getDictionary('ko');

  beforeEach(() => {
    window.localStorage.clear();
    _resetStoreForTest();
    renderCardMock.mockClear();
    downloadMock.mockClear();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  it('renders empty state when collection is empty', async () => {
    render(<ShareView lang="ko" dict={dict} />);
    expect(await screen.findByText(dict['share.emptyTitle'])).toBeInTheDocument();
  });

  it('shows grade, rejects oversized photo, creates card, and downloads', async () => {
    window.localStorage.setItem(
      'mipg.v1',
      JSON.stringify({
        version: 1,
        collection: [
          { id: 'PKM-0001', goodsId: 'PKM-0001', qty: 1, addedAt: '2026-10-20T00:00:00.000Z' },
        ],
        wishlist: [],
        prefs: { subscribed: {} },
      })
    );

    render(<ShareView lang="ko" dict={dict} />);
    expect(await screen.findByText(dict['grade.starter'])).toBeInTheDocument();
    expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();

    const fileInput = screen.getByLabelText(`피카츄 피규어 ${dict['share.addPhoto']}`);
    const bigFile = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });
    expect(screen.getByText(dict['errors.INVALID_REQUEST'])).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: dict['share.create'] }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: dict['share.download'] })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: dict['share.download'] }));
    expect(downloadMock).toHaveBeenCalledTimes(1);
  });
});

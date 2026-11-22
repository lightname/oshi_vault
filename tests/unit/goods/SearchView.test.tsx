import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { _resetCatalogCache } from '@/lib/data/catalogClient';
import { getDictionary } from '@/lib/i18n/dictionary';
import { SearchView } from '@/components/goods/SearchView';
import { fixtureCatalog } from '../fixtures/catalog';

beforeEach(() => {
  _resetCatalogCache();
  window.history.replaceState(null, '', '/ko/search/');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('S-05 SearchView', () => {
  it('shows IP chips when query is empty, matches goods by name/code, and shows empty state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(fixtureCatalog), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const dict = getDictionary('ko');
    render(<SearchView lang="ko" dict={dict} ips={fixtureCatalog.ips} />);

    expect(screen.getByText('IP별로 찾아보기')).toBeInTheDocument();

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: '피카츄' } });

    await waitFor(() => {
      expect(screen.getByText('검색 결과 1개')).toBeInTheDocument();
      expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: '존재하지않는굿즈' } });
    await waitFor(() => {
      expect(screen.getByText('찾는 굿즈가 아직 없어요')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '직접 등록하기' })).toHaveAttribute(
        'href',
        '/ko/scan?manual=1&name=%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%EC%95%8A%EB%8A%94%EA%B5%BF%EC%A6%88'
      );
    });
  });

  it('shows error state and retries on reload click when catalog fetch fails', async () => {
    window.history.replaceState(null, '', '/ko/search/?q=피카츄');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(fixtureCatalog), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const dict = getDictionary('ko');
    render(<SearchView lang="ko" dict={dict} ips={fixtureCatalog.ips} />);

    await waitFor(() => {
      expect(screen.getByText('검색 데이터를 불러오지 못했어요.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    await waitFor(() => {
      expect(screen.getByText('피카츄 피규어')).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

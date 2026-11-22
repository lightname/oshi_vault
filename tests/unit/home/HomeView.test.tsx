import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getDictionary } from '@/lib/i18n/dictionary';
import { HomeSearchForm } from '@/components/home/HomeSearchForm';
import { HomeView } from '@/components/home/HomeView';
import { fixtureCatalog } from '../fixtures/catalog';

describe('S-01 HomeView & HomeSearchForm', () => {
  it('submits search query and ignores empty submission', () => {
    const dict = getDictionary('ko');
    const onNavigate = vi.fn();
    render(<HomeSearchForm lang="ko" dict={dict} examples={[]} onNavigate={onNavigate} />);

    const input = screen.getByPlaceholderText('상품명, 품번, 바코드 번호');
    const form = input.closest('form')!;

    fireEvent.submit(form);
    expect(onNavigate).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '피카츄' } });
    fireEvent.submit(form);
    expect(onNavigate).toHaveBeenCalledWith('/ko/search/?q=%ED%94%BC%EC%B9%B4%EC%B8%84');
  });

  it('switches to recent heading when priced goods < 4 and hides guides when 0', () => {
    const dict = getDictionary('ko');
    render(
      <HomeView
        lang="ko"
        dict={dict}
        generatedAt="2026-10-24"
        usePremiumHeading={false}
        examples={[]}
        featured={[{ goods: fixtureCatalog.goods[0], ip: fixtureCatalog.ips[0], current: null }]}
        ips={fixtureCatalog.ips}
        howToReadHref="/ko/about/"
        guides={[]}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '정가 대비 지금 얼마인지, 거래가로 확인하세요'
    );
    expect(screen.getByText('최근 등록한 굿즈')).toBeInTheDocument();
    expect(screen.queryByText('정가보다 거래가가 높은 굿즈')).not.toBeInTheDocument();
    expect(screen.queryByText('수집 가이드')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IP별 굿즈 전체 보기' })).toHaveAttribute(
      'href',
      '/ko/ip'
    );
  });
});

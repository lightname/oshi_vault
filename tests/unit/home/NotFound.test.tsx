import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('S-15 NotFound page', () => {
  it('renders ko, en, ja headings and recovery links', () => {
    render(<NotFound />);
    expect(screen.getByText('페이지를 찾을 수 없어요')).toBeInTheDocument();
    expect(screen.getByText('Page not found', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      '/ko/',
      '/ko/search/',
      '/en/',
      '/en/search/',
      '/ja/',
      '/ja/search/',
    ]);
  });
});

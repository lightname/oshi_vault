import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getImage } from '@/lib/data/images';
import { getDictionary } from '@/lib/i18n/dictionary';
import { guidesListIndexable } from '@/lib/seo/indexing';
import { generateMetadata } from '@/app/[lang]/guides/page';
import { GuidesListView } from '@/components/guides/GuidesListView';

describe('S-10 GuidesListView & metadata', () => {
  const dict = getDictionary('ko');

  it('renders empty state and noindex metadata when 0 guides exist', async () => {
    render(<GuidesListView lang="ko" dict={dict} guides={[]} />);
    expect(screen.getByText(dict['guides.emptyTitle'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dict['guides.emptyCta'] })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/ip\/?$/)
    );

    const meta = await generateMetadata({ params: Promise.resolve({ lang: 'ko' }) });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('renders guide cards and checks reviewed indexability rule', () => {
    expect(guidesListIndexable(0)).toBe(false);
    expect(guidesListIndexable(1)).toBe(true);

    render(
      <GuidesListView
        lang="ko"
        dict={dict}
        guides={[
          {
            slug: 'how-to-check-resale-price',
            title: '한정판 굿즈 시세 확인하는 법',
            description: '마켓별 거래가를 비교하는 방법이에요.',
            updated: '2026-10-24',
            cover: getImage('IMG-13', 'ko'),
          },
        ]}
      />
    );
    expect(screen.getByText('한정판 굿즈 시세 확인하는 법')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /한정판 굿즈 시세 확인하는 법/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/ko\/guides\/how-to-check-resale-price\/?$/)
    );
  });
});

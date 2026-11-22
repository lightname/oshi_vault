import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';
import { AboutView } from '@/components/home/AboutView';

describe('S-12 AboutView', () => {
  it('renders data sources, formula, limits, and unofficial notice', () => {
    const dict = getDictionary('ko');
    render(<AboutView lang="ko" dict={dict} marketsLabel="eBay, Mercari, KREAM" goodsCount={23} />);
    expect(screen.getByRole('heading', { level: 1, name: dict['about.h1'] })).toBeInTheDocument();
    expect(screen.getByText(/eBay, Mercari, KREAM/)).toBeInTheDocument();
    expect(screen.getByText(dict['about.methodBody2'])).toBeInTheDocument();
    expect(screen.getByText(/23개/)).toBeInTheDocument();
    expect(screen.getByText(/90일/)).toBeInTheDocument();
    expect(screen.getByText(dict['footer.unofficial'])).toBeInTheDocument();
  });
});

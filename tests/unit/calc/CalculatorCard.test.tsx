import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionary';

const trackMock = vi.fn();
vi.mock('@/lib/analytics/track', () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

import { CalculatorCard } from '@/components/calc/CalculatorCard';

describe('S-16 CalculatorCard', () => {
  const dict = getDictionary('ko');

  beforeEach(() => {
    trackMock.mockClear();
  });

  it('validates each field and keeps placeholder on invalid input', () => {
    render(<CalculatorCard lang="ko" dict={dict} />);
    expect(screen.getByText(dict['calc.placeholder'])).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(dict['calc.retail']), { target: { value: '0' } });
    expect(screen.getByText(dict['calc.invalid'])).toBeInTheDocument();
    expect(screen.getByText(dict['calc.placeholder'])).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(dict['calc.retail']), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(dict['calc.sold']), {
      target: { value: '999999999999' },
    });
    expect(screen.getByText(dict['calc.invalid'])).toBeInTheDocument();
    expect(screen.getByText(dict['calc.placeholder'])).toBeInTheDocument();
  });

  it('calculates cross-currency premium and fires calculator_use only once', () => {
    render(<CalculatorCard lang="ko" dict={dict} />);

    fireEvent.change(screen.getByLabelText(`${dict['calc.retail']} ${dict['calc.currency']}`), {
      target: { value: 'JPY' },
    });
    fireEvent.change(screen.getByLabelText(`${dict['calc.sold']} ${dict['calc.currency']}`), {
      target: { value: 'USD' },
    });
    fireEvent.change(screen.getByLabelText(dict['calc.retail']), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(dict['calc.sold']), { target: { value: '50' } });

    // 50 USD * 150 = 7500 JPY vs 5000 JPY => +50%, 1.50x
    expect(screen.getByText('+50%')).toBeInTheDocument();
    expect(screen.getByText('정가의 1.50배')).toBeInTheDocument();
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('calculator_use', {
      from_currency: 'JPY',
      to_currency: 'USD',
    });

    // Subsequent edits do not re-fire calculator_use
    fireEvent.change(screen.getByLabelText(dict['calc.sold']), { target: { value: '100' } });
    expect(screen.getByText('+200%')).toBeInTheDocument();
    expect(trackMock).toHaveBeenCalledTimes(1);

    // G-02 internal links fire internal_link_click
    fireEvent.click(screen.getByRole('link', { name: dict['calc.findGoods'] }));
    expect(trackMock).toHaveBeenCalledWith('internal_link_click', {
      block: 'calculator_cta',
      target_screen_id: 'S-05',
    });
    fireEvent.click(screen.getByRole('link', { name: dict['cta.scan'] }));
    expect(trackMock).toHaveBeenCalledWith('internal_link_click', {
      block: 'calculator_cta',
      target_screen_id: 'S-06',
    });
  });
});

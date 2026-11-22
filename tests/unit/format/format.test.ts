import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatLocalMoney,
  formatMoney,
  formatPercent,
  formatRatio,
} from '@/lib/format/format';

describe('format helpers (C-24)', () => {
  it('formats currencies for ko, en, ja', () => {
    expect(formatMoney(5500, 'JPY', 'ja')).toContain('5,500');
    expect(formatMoney(12.5, 'USD', 'en')).toBe('$12.50');
    expect(formatMoney(50000, 'KRW', 'ko')).toContain('50,000');
    expect(formatLocalMoney(15000, 'en')).toBe('$100.00');
    expect(formatLocalMoney(5000, 'ja')).toContain('5,000');
  });

  it('formats signed percents and ratios', () => {
    expect(formatPercent(0.384)).toBe('+38%');
    expect(formatPercent(-0.12)).toBe('−12%');
    expect(formatPercent(0)).toBe('±0%');
    expect(formatRatio(0.5)).toBe('1.50');
  });

  it('formats dates in UTC', () => {
    expect(formatDate('2026-10-24', 'en')).toBe('10/24/2026');
    expect(formatDate('2026-10-24T12:00:00Z', 'ja')).toContain('2026');
    expect(formatDate('2026-10-24', 'ko')).toContain('2026');
  });
});

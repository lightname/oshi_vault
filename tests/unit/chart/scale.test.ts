import { describe, expect, it } from 'vitest';
import { layout } from '@/lib/chart/scale';

describe('SVG chart scale layout (C-40)', () => {
  it('computes coordinates for multi-point series with ref line', () => {
    const res = layout(
      [
        [
          { date: '2026-09-01', value: 6000 },
          { date: '2026-10-20', value: 8000 },
        ],
      ],
      5000,
      720,
      280
    );
    expect(res.ticks).toHaveLength(4);
    expect(res.x('2026-09-01')).toBeCloseTo(56);
    expect(res.x('2026-10-20')).toBeCloseTo(720 - 48);
    expect(res.path([
      { date: '2026-09-01', value: 6000 },
      { date: '2026-10-20', value: 8000 },
    ])).toMatch(/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/);
  });

  it('handles single date and identical zero values without NaN', () => {
    const res = layout([[{ date: '2026-10-20', value: 0 }]], null, 720, 280);
    expect(Number.isNaN(res.x('2026-10-20'))).toBe(false);
    expect(Number.isNaN(res.y(0))).toBe(false);
  });
});

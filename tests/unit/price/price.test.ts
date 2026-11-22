import { describe, expect, it } from 'vitest';
import {
  averagePremium,
  collectionGrade,
  collectionHistory,
  currentPrice,
  fromJPY,
  itemValueJPY,
  premiumRatio,
  priceOn,
  toJPY,
  wishReached,
} from '@/lib/price/price';
import { fixtureCatalog } from '../fixtures/catalog';

describe('price calculations (C-23)', () => {
  it('converts currencies to/from JPY', () => {
    expect(toJPY(100, 'USD')).toBe(15000);
    expect(toJPY(1000, 'JPY')).toBe(1000);
    expect(fromJPY(15000, 'USD')).toBe(100);
  });

  it('computes weighted current price and stale status', () => {
    const cur = currentPrice('PKM-0001', fixtureCatalog.prices, '2026-10-24');
    expect(cur).not.toBeNull();
    // mercari: 7000 * 6 = 42000; ebay: 60*150 * 4 = 36000; total 78000 / 10 = 7800
    expect(cur?.jpy).toBe(7800);
    expect(cur?.date).toBe('2026-10-20');
    expect(cur?.stale).toBe(false);
    expect(cur?.markets[0].market).toBe('mercari');

    const stale = currentPrice('CHK-0001', fixtureCatalog.prices, '2026-10-24');
    expect(stale?.stale).toBe(true);

    expect(currentPrice('PKM-0002', fixtureCatalog.prices, '2026-10-24')).toBeNull();
    expect(priceOn(fixtureCatalog.prices, '2025-01-01', '2026-10-24')).toBeNull();
  });

  it('computes premium ratio, average premium, and grade', () => {
    expect(premiumRatio(7500, { price: 5000, currency: 'JPY' })).toBeCloseTo(0.5);
    expect(averagePremium([])).toBeNull();
    expect(averagePremium([0.2, 0.4])).toBeCloseTo(0.3);
    expect(collectionGrade(0).id).toBe('starter');
    expect(collectionGrade(30000).id).toBe('collector');
    expect(collectionGrade(150000).id).toBe('curator');
    expect(collectionGrade(500000).id).toBe('keeper');
  });

  it('computes item value and collection history', () => {
    const manualVal = itemValueJPY(
      {
        id: 'USR-1',
        goodsId: null,
        manual: { name: 'Custom', ipName: 'Other', price: 10, currency: 'USD' },
        qty: 2,
        addedAt: '2026-10-01T00:00:00Z',
      },
      fixtureCatalog
    );
    expect(manualVal).toBe(3000);

    const missingVal = itemValueJPY(
      { id: 'NOPE-0001', goodsId: 'NOPE-0001', qty: 1, addedAt: '2026-10-01T00:00:00Z' },
      fixtureCatalog
    );
    expect(missingVal).toBe(0);

    const retailFallback = itemValueJPY(
      { id: 'PKM-0002', goodsId: 'PKM-0002', qty: 2, addedAt: '2026-10-01T00:00:00Z' },
      fixtureCatalog
    );
    expect(retailFallback).toBe(6000);

    const hist = collectionHistory(
      [
        { id: 'PKM-0001', goodsId: 'PKM-0001', qty: 1, addedAt: '2026-10-01T00:00:00Z' },
        { id: 'PKM-0002', goodsId: 'PKM-0002', qty: 1, addedAt: '2026-10-01T00:00:00Z' },
      ],
      fixtureCatalog
    );
    expect(hist).toEqual([
      { date: '2026-09-01', jpy: 9000 },
      { date: '2026-10-20', jpy: 10800 },
    ]);
  });

  it('evaluates wishReached', () => {
    const cur = currentPrice('PKM-0001', fixtureCatalog.prices, '2026-10-24');
    expect(
      wishReached({ goodsId: 'PKM-0001', targetPrice: null, currency: 'JPY', addedAt: '' }, cur)
    ).toBe(false);
    expect(
      wishReached({ goodsId: 'PKM-0001', targetPrice: 8000, currency: 'JPY', addedAt: '' }, null)
    ).toBe(false);
    expect(
      wishReached({ goodsId: 'PKM-0001', targetPrice: 8000, currency: 'JPY', addedAt: '' }, cur)
    ).toBe(true);
    expect(
      wishReached({ goodsId: 'PKM-0001', targetPrice: 5000, currency: 'JPY', addedAt: '' }, cur)
    ).toBe(false);
  });
});

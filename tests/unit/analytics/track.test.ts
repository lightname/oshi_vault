import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '@/config';
import { getConsent, setConsent } from '@/lib/analytics/consent';
import { track } from '@/lib/analytics/track';
import { getDictionary } from '@/lib/i18n/dictionary';
import { currentPrice } from '@/lib/price/price';
import { MarketButtons } from '@/components/goods/MarketButtons';
import { fixtureCatalog } from '../fixtures/catalog';

const mutableAnalytics = config.analytics as { ga4Id: string };

beforeEach(() => {
  window.localStorage.clear();
  mutableAnalytics.ga4Id = '';
  delete window.gtag;
  delete document.body.dataset.screen;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('analytics consent and track (C-35)', () => {
  it('stores and reads consent', () => {
    expect(getConsent()).toBeNull();
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    setConsent('denied');
    expect(getConsent()).toBe('denied');
  });

  it('sends events only in production, non-localhost, with ga4Id and granted consent', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    document.body.dataset.screen = 'S-01';

    track('language_switch', { from_lang: 'ko', to_lang: 'en' });
    expect(gtag).not.toHaveBeenCalled();

    vi.stubEnv('NODE_ENV', 'production');
    Object.defineProperty(window, 'location', {
      value: { hostname: 'oshivault.example', pathname: '/ko/ip/' },
      configurable: true,
    });
    track('language_switch', { from_lang: 'ko', to_lang: 'en' });
    expect(gtag).not.toHaveBeenCalled();

    mutableAnalytics.ga4Id = 'G-TEST1234';
    setConsent('granted');
    track('language_switch', { from_lang: 'ko', to_lang: 'en' });
    expect(gtag).toHaveBeenCalledWith('event', 'language_switch', {
      from_lang: 'ko',
      to_lang: 'en',
      lang: 'ko',
      screen_id: 'S-01',
    });
  });

  it('blocks events on localhost and 127.0.0.1 even with production env and consent', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    vi.stubEnv('NODE_ENV', 'production');
    mutableAnalytics.ga4Id = 'G-TEST1234';
    setConsent('granted');
    document.body.dataset.screen = 'S-04';

    for (const hostname of ['localhost', '127.0.0.1']) {
      Object.defineProperty(window, 'location', {
        value: { hostname, pathname: '/ko/goods/pkm-0001/' },
        configurable: true,
      });
      track('affiliate_click', {
        goods_id: 'PKM-0001',
        ip_slug: 'pokemon',
        market: 'mercari',
        has_affiliate: false,
      });
    }
    expect(gtag).not.toHaveBeenCalled();
  });

  it('tracks affiliate_click once from MarketButtons only when consented on non-localhost', () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    vi.stubEnv('NODE_ENV', 'production');
    mutableAnalytics.ga4Id = 'G-TEST1234';
    document.body.dataset.screen = 'S-04';
    const goods = fixtureCatalog.goods[0];
    const cur = currentPrice(goods.id, fixtureCatalog.prices, fixtureCatalog.meta.generatedAt)!;
    const dict = getDictionary('ko');

    Object.defineProperty(window, 'location', {
      value: { hostname: 'oshivault.example', pathname: '/ko/goods/pkm-0001-pikachu-figure/' },
      configurable: true,
    });

    render(
      React.createElement(MarketButtons, {
        goods,
        lang: 'ko',
        dict,
        markets: cur.markets,
      })
    );

    const firstBtn = screen.getByRole('link', { name: /Mercari에서 매물 보기/ });

    // Without consent -> 0 calls
    fireEvent.click(firstBtn);
    expect(gtag).not.toHaveBeenCalled();

    // With consent -> 1 call with exact payload
    setConsent('granted');
    fireEvent.click(firstBtn);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'affiliate_click', {
      goods_id: 'PKM-0001',
      ip_slug: 'pokemon',
      market: 'mercari',
      has_affiliate: false,
      lang: 'ko',
      screen_id: 'S-04',
    });

    // On localhost -> still 1 call (no additional call)
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost', pathname: '/ko/goods/pkm-0001-pikachu-figure/' },
      configurable: true,
    });
    fireEvent.click(firstBtn);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});

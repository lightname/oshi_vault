import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '@/config';
import { getConsent, setConsent } from '@/lib/analytics/consent';
import { track } from '@/lib/analytics/track';

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
});

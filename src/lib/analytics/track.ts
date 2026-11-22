import { config } from '@/config';
import { getConsent } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type EventName =
  | 'affiliate_click'
  | 'subscribe_cta_click'
  | 'subscribe_submit'
  | 'subscribe_success'
  | 'share_card_create'
  | 'share_card_share'
  | 'language_switch'
  | 'collection_add'
  | 'wishlist_add'
  | 'scan_success'
  | 'scan_miss'
  | 'calculator_use'
  | 'internal_link_click'
  | 'guide_cta_click';

type Params = Record<string, string | number | boolean>;

export function track(name: EventName, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
  if (!config.analytics.ga4Id || getConsent() !== 'granted') return;
  const lang = window.location.pathname.split('/')[1] || 'root';
  const screen_id = document.body.dataset.screen ?? 'unknown';
  window.gtag?.('event', name, { ...params, lang, screen_id });
}

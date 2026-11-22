import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import type { Currency, Lang, SubscribeTopic } from '@/lib/data/types';
import { markSubscribed } from '@/lib/storage/store';
import { apiFetch, type ApiResult } from './client';

export function subscribeVisible(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return config.api.mode === 'live' && config.google.clientId !== '';
}

export type SubscribeWatch = {
  goodsId: string;
  targetPrice: number;
  currency: Currency;
};

export type SubscribeRequest = {
  name: string;
  ipName: string;
  code: string | null;
};

export type SubscribeInput = {
  idToken: string;
  lang: Lang;
  topic: SubscribeTopic;
  consent: boolean;
  watches: SubscribeWatch[];
  requests: SubscribeRequest[];
};

export async function submitSubscription(
  i: SubscribeInput
): Promise<ApiResult<{ subscriptionId: string; status: 'pending' | 'active' }>> {
  if (!i.consent) {
    return { ok: false, error: { code: 'INVALID_REQUEST', message: 'consent required' } };
  }
  track('subscribe_submit', { topic: i.topic, watch_count: i.watches.length });
  const body = {
    idToken: i.idToken,
    locale: i.lang,
    topics: [i.topic],
    consentVersion: config.subscribe.consentVersion,
    watches: i.watches,
    requests: i.requests,
  };
  const res =
    config.api.mode === 'mock'
      ? await new Promise<ApiResult<{ subscriptionId: string; status: 'pending' }>>((resolve) =>
          setTimeout(
            () => resolve({ ok: true, data: { subscriptionId: 'mock', status: 'pending' } }),
            300
          )
        )
      : await apiFetch<{ subscriptionId: string; status: 'pending' | 'active' }>(
          '/v1/subscriptions',
          { method: 'POST', body }
        );
  if (res.ok) {
    markSubscribed(i.topic);
    track('subscribe_success', { topic: i.topic });
  }
  return res;
}

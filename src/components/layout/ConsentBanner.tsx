'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { config } from '@/config';
import { getConsent, setConsent, type ConsentState } from '@/lib/analytics/consent';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Button } from '@/components/ui/Button';

let gaLoaded = false;
const listeners = new Set<() => void>();

function subscribeConsent(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getClientConsent(): ConsentState | 'unset' {
  return getConsent() ?? 'unset';
}

function getServerConsent(): ConsentState | 'unset' | 'ssr' {
  return 'ssr';
}

function loadGa(): void {
  if (gaLoaded || typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
  const id = config.analytics.ga4Id;
  if (!id) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function ConsentBanner({ dict }: { dict: Dict }) {
  const consent = useSyncExternalStore(subscribeConsent, getClientConsent, getServerConsent);

  useEffect(() => {
    if (consent === 'granted') loadGa();
  }, [consent]);

  if (consent !== 'unset') return null;

  const choose = (value: ConsentState) => {
    setConsent(value);
    if (value === 'granted') loadGa();
    listeners.forEach((l) => l());
  };

  return (
    <div
      role="region"
      aria-label={t(dict, 'consent.text')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-(--space-4) shadow-(--shadow-raised)"
    >
      <div className="container-main flex flex-col gap-(--space-3) md:flex-row md:items-center md:justify-between">
        <p className="text-small text-text">{t(dict, 'consent.text')}</p>
        <div className="grid shrink-0 grid-cols-2 gap-(--space-2)">
          <Button variant="secondary" onClick={() => choose('granted')}>
            {t(dict, 'consent.accept')}
          </Button>
          <Button variant="secondary" onClick={() => choose('denied')}>
            {t(dict, 'consent.reject')}
          </Button>
        </div>
      </div>
    </div>
  );
}

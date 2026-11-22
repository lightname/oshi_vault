'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import { renderGisButton } from '@/lib/api/gis';
import {
  submitSubscription,
  subscribeVisible,
  type SubscribeRequest,
  type SubscribeWatch,
} from '@/lib/api/subscribe';
import { getImage } from '@/lib/data/images';
import type { ErrorCode, Lang, SubscribeTopic } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { useUserData } from '@/lib/storage/useUserData';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

type Props = {
  lang: Lang;
  dict: Dict;
  topic: SubscribeTopic;
  watches?: SubscribeWatch[];
  requests?: SubscribeRequest[];
  onCtaClick?: () => void;
};

export function SubscribeBox({ lang, dict, topic, watches = [], requests = [], onCtaClick }: Props) {
  const user = useUserData();
  const [phase, setPhase] = useState<'collapsed' | 'expanded' | 'sending' | 'success' | 'error'>(
    'collapsed'
  );
  const [consent, setConsent] = useState(false);
  const [errorCode, setErrorCode] = useState<ErrorCode>('INTERNAL');
  const gisRef = useRef<HTMLDivElement>(null);
  const consentRef = useRef(consent);
  const watchesRef = useRef(watches);
  const requestsRef = useRef(requests);

  useEffect(() => {
    consentRef.current = consent;
  }, [consent]);
  useEffect(() => {
    watchesRef.current = watches;
    requestsRef.current = requests;
  }, [watches, requests]);

  const visible = subscribeVisible();
  const alreadySubscribed = user.status === 'ready' && Boolean(user.doc.prefs.subscribed[topic]);

  useEffect(() => {
    if (!visible || alreadySubscribed || phase !== 'expanded' || !gisRef.current) return;
    return renderGisButton(gisRef.current, (idToken) => {
      setPhase('sending');
      void submitSubscription({
        idToken,
        lang,
        topic,
        consent: consentRef.current,
        watches: watchesRef.current,
        requests: requestsRef.current,
      }).then((res) => {
        if (res.ok) {
          setPhase('success');
        } else {
          setErrorCode(res.error.code);
          setPhase('error');
        }
      });
    });
  }, [visible, alreadySubscribed, phase, lang, topic]);

  if (!visible) return null;

  const img = getImage('IMG-22', lang);
  const titleKey = topic === 'target_price' ? 'subscribe.targetTitle' : 'subscribe.trackTitle';
  const bodyKey = topic === 'target_price' ? 'subscribe.targetBody' : 'subscribe.trackBody';
  const ctaKey = topic === 'target_price' ? 'cta.secondary' : 'subscribe.trackCta';

  if (alreadySubscribed && phase === 'collapsed') {
    return (
      <div className="flex items-center gap-(--space-2) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
        <Icon name="check" size={20} className="shrink-0 text-success" />
        <p className="text-body font-semibold text-text">{t(dict, 'subscribe.success')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
      <div className="flex flex-col items-start gap-(--space-4) md:flex-row md:items-center">
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading="lazy"
          className="h-[64px] w-[64px] shrink-0 object-contain md:h-[96px] md:w-[96px]"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-secondary">{t(dict, titleKey)}</h3>
          <p className="mt-(--space-1) text-body text-text-muted">{t(dict, bodyKey)}</p>

          {phase === 'collapsed' ? (
            <div className="mt-(--space-4)">
              <Button
                variant="secondary"
                onClick={() => {
                  track('subscribe_cta_click', { topic });
                  onCtaClick?.();
                  setPhase('expanded');
                }}
              >
                {t(dict, ctaKey)}
              </Button>
            </div>
          ) : null}

          {phase === 'expanded' ? (
            <div className="mt-(--space-4) space-y-(--space-3) transition-all duration-200 ease-out">
              <label className="flex cursor-pointer items-start gap-(--space-2) text-small text-text">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-[2px] h-[20px] w-[20px] shrink-0 accent-secondary"
                />
                <span>
                  {t(dict, 'subscribe.consent')}{' '}
                  <Link
                    href={`/${lang}/privacy/`}
                    className="font-semibold text-secondary underline"
                  >
                    {t(dict, 'footer.privacy')}
                  </Link>
                </span>
              </label>
              <p className="text-small text-text-muted">{t(dict, 'subscribe.frequency')}</p>
              <p className="text-small text-text-muted">{t(dict, 'subscribe.unsubscribe')}</p>
              <div
                aria-disabled={!consent}
                className={consent ? '' : 'pointer-events-none opacity-40'}
              >
                <div ref={gisRef} />
              </div>
              {!consent ? (
                <p className="text-small text-text-muted">{t(dict, 'subscribe.needConsent')}</p>
              ) : null}
            </div>
          ) : null}

          {phase === 'sending' ? (
            <div className="mt-(--space-4) flex items-center gap-(--space-2) text-small text-text-muted">
              <span
                aria-hidden="true"
                className="inline-block h-[20px] w-[20px] animate-spin rounded-(--radius-full) border-2 border-border border-t-secondary"
              />
              <span>{t(dict, 'subscribe.sending')}</span>
            </div>
          ) : null}

          {phase === 'success' ? (
            <div className="mt-(--space-4) space-y-(--space-1)">
              <p className="inline-flex items-center gap-(--space-2) text-body font-semibold text-success">
                <Icon name="check" size={20} />
                <span>{t(dict, 'subscribe.success')}</span>
              </p>
              <p className="text-small text-text-muted">{t(dict, 'subscribe.successNote')}</p>
            </div>
          ) : null}

          {phase === 'error' ? (
            <div className="mt-(--space-4) space-y-(--space-2)">
              <p className="inline-flex items-center gap-(--space-2) text-small font-semibold text-danger">
                <Icon name="alert" size={18} />
                <span>{t(dict, `errors.${errorCode}`)}</span>
              </p>
              <div>
                <Button variant="text" onClick={() => setPhase('expanded')}>
                  {t(dict, 'subscribe.retry')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import { useCatalog } from '@/lib/data/catalogClient';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { matchCode } from '@/lib/match/match';
import { currentPrice } from '@/lib/price/price';
import { useUserData } from '@/lib/storage/useUserData';
import { Button, buttonClass } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { Toast } from '@/components/ui/Toast';
import { ManualRegisterForm } from './ManualRegisterForm';
import { ScanCamera } from './ScanCamera';
import { ScanMatchResult } from './ScanMatchResult';

type Props = { lang: Lang; dict: Dict; ips: Ip[]; hasBarcodeGuide: boolean };
type LookupResult =
  | { kind: 'none' }
  | { kind: 'match'; goods: Goods }
  | { kind: 'miss'; code: string; name: string };

const noopSub = () => () => {};
const getUrlSearch = () => (typeof window === 'undefined' ? '' : window.location.search);
const getServerSearch = () => '';

export function ScanView({ lang, dict, ips, hasBarcodeGuide }: Props) {
  useUserData();
  const catalog = useCatalog();
  const urlSearch = useSyncExternalStore(noopSub, getUrlSearch, getServerSearch);
  const [lookupInput, setLookupInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult>({ kind: 'none' });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const manualInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const initialManual = useMemo<LookupResult | null>(() => {
    const p = new URLSearchParams(urlSearch);
    return p.get('manual') === '1' ? { kind: 'miss', code: '', name: p.get('name') ?? '' } : null;
  }, [urlSearch]);

  const activeResult = result.kind === 'none' && initialManual ? initialManual : result;

  const scrollToResult = useCallback(() => {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  const evaluateCode = useCallback(
    (code: string, format: string) => {
      const hit = matchCode(code, catalog.data?.goods ?? []);
      if (hit) {
        track('scan_success', { format });
        setResult({ kind: 'match', goods: hit });
      } else {
        track('scan_miss', { format });
        setResult({ kind: 'miss', code, name: '' });
      }
      scrollToResult();
    },
    [catalog.data, scrollToResult]
  );

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = lookupInput.trim();
    if (!trimmed) {
      setLookupError(t(dict, 'scan.required'));
      manualInputRef.current?.focus();
      return;
    }
    setLookupError(null);
    evaluateCode(trimmed, 'manual');
  };

  const matchedIp =
    activeResult.kind === 'match'
      ? (catalog.data?.ips.find((i) => i.slug === activeResult.goods.ipSlug) ?? ips[0])
      : null;
  const matchedCurrent =
    activeResult.kind === 'match' && catalog.data
      ? currentPrice(activeResult.goods.id, catalog.data.prices, catalog.data.meta.generatedAt)
      : null;

  return (
    <div className="container-main py-(--space-7)">
      <section>
        <h1 className="text-h1 text-secondary">{t(dict, 'scan.h1')}</h1>
        <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'scan.lead')}</p>
        <StorageNote dict={dict} className="mt-(--space-2)" />
      </section>

      <section className="mt-(--space-6) grid grid-cols-1 gap-(--space-5) lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ScanCamera
            lang={lang}
            dict={dict}
            hasResult={activeResult.kind !== 'none'}
            onDetected={(code, format) => {
              setLookupInput(code);
              setLookupError(null);
              evaluateCode(code, format);
            }}
            onFocusManual={() => manualInputRef.current?.focus()}
          />
        </div>

        <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card) lg:col-span-5">
          <h2 className="text-h3 text-secondary">{t(dict, 'scan.manualTitle')}</h2>
          <form onSubmit={handleLookupSubmit} noValidate className="mt-(--space-4) space-y-(--space-3)">
            <div>
              <input
                ref={manualInputRef}
                type="text"
                value={lookupInput}
                onChange={(e) => {
                  setLookupInput(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                placeholder={t(dict, 'scan.manualPlaceholder')}
                aria-label={t(dict, 'scan.manualPlaceholder')}
                aria-invalid={Boolean(lookupError)}
                className={`h-[48px] w-full rounded-(--radius-md) border bg-surface px-(--space-3) text-body text-text ${
                  lookupError ? 'border-danger' : 'border-border'
                }`}
              />
              {lookupError ? <p className="mt-(--space-1) text-small text-danger">{lookupError}</p> : null}
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              {t(dict, 'scan.lookup')}
            </Button>
          </form>

          {hasBarcodeGuide ? (
            <div className="mt-(--space-3)">
              <Link href={`/${lang}/guides/find-barcode-product-code/`} className={buttonClass('text')}>
                {t(dict, 'scan.toGuide')}
              </Link>
            </div>
          ) : null}

          {catalog.status === 'error' ? (
            <div className="mt-(--space-4) rounded-(--radius-md) border border-border bg-bg p-(--space-3)">
              <p className="flex items-center gap-(--space-2) text-small text-danger">
                <Icon name="alert" size={16} />
                <span>{t(dict, 'search.loadError')}</span>
              </p>
              <Button variant="secondary" onClick={catalog.retry} className="mt-(--space-2)">
                {t(dict, 'search.reload')}
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section ref={resultRef} className="mt-(--space-6)">
        {activeResult.kind === 'match' && matchedIp ? (
          <ScanMatchResult
            goods={activeResult.goods}
            ip={matchedIp}
            current={matchedCurrent}
            lang={lang}
            dict={dict}
            onAdded={() => setToastMsg(t(dict, 'toast.addedShelf'))}
          />
        ) : null}

        {activeResult.kind === 'miss' ? (
          <ManualRegisterForm
            key={`${activeResult.name}|${activeResult.code}`}
            lang={lang}
            dict={dict}
            ips={ips}
            initialName={activeResult.name}
            initialCode={activeResult.code}
            onSaved={() => setToastMsg(t(dict, 'toast.addedShelf'))}
          />
        ) : null}
      </section>

      <Toast
        message={toastMsg}
        actionLabel={t(dict, 'toast.view')}
        actionHref={`/${lang}/collection/`}
        onClose={() => setToastMsg(null)}
      />
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import type { SubscribeRequest } from '@/lib/api/subscribe';
import type { Currency, Ip, Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { addManual } from '@/lib/storage/store';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { StorageNote } from '@/components/ui/StorageNote';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';
import { validateManualDraft, type FieldErrors } from './validateManual';

type Props = {
  lang: Lang;
  dict: Dict;
  ips: Ip[];
  initialName: string;
  initialCode: string;
  onSaved: () => void;
};

const CURRENCIES: Currency[] = ['JPY', 'KRW', 'USD'];

export function ManualRegisterForm({ lang, dict, ips, initialName, initialCode, onSaved }: Props) {
  const defaultCur = config.localeCurrency[lang];
  const [name, setName] = useState(initialName);
  const [ipName, setIpName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCur);
  const [releaseDate, setReleaseDate] = useState('');
  const [code, setCode] = useState(initialCode);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lastRequest, setLastRequest] = useState<SubscribeRequest | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const ipRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateManualDraft({ name, ipName, price, currency, releaseDate, code }, dict);
    setErrors(nextErrors);
    const firstKey = (['name', 'ip', 'price', 'code'] as const).find((k) => nextErrors[k]);
    if (firstKey) {
      ({ name: nameRef, ip: ipRef, price: priceRef, code: codeRef })[firstKey].current?.focus();
      return;
    }

    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    addManual(
      {
        name: trimmedName,
        ipName,
        price: Number(price),
        currency,
        releaseDate: releaseDate || undefined,
        code: trimmedCode || undefined,
      },
      1
    );
    track('collection_add', { method: 'manual' });
    setLastRequest({ name: trimmedName, ipName, code: trimmedCode || null });
    setName('');
    setIpName('');
    setPrice('');
    setCurrency(defaultCur);
    setReleaseDate('');
    setCode('');
    setErrors({});
    onSaved();
  };

  const cls = (err?: string) =>
    `mt-(--space-1) h-[48px] w-full rounded-(--radius-md) border bg-surface px-(--space-3) text-body text-text ${
      err ? 'border-danger' : 'border-border'
    }`;

  return (
    <div className="space-y-(--space-5)">
      <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
        <div className="flex items-start gap-(--space-2)">
          <Icon name="info" size={20} className="mt-[2px] shrink-0 text-secondary" />
          <h2 className="text-h3 text-secondary">{t(dict, 'scan.missTitle')}</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-(--space-5)">
          <div className="grid grid-cols-1 gap-(--space-4) md:grid-cols-2">
            <div>
              <label htmlFor="manual-name" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldName')}
              </label>
              <input ref={nameRef} id="manual-name" type="text" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} className={cls(errors.name)} />
              {errors.name ? <p className="mt-(--space-1) text-small text-danger">{errors.name}</p> : null}
            </div>

            <div>
              <label htmlFor="manual-ip" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldIp')}
              </label>
              <select ref={ipRef} id="manual-ip" value={ipName} onChange={(e) => setIpName(e.target.value)} aria-invalid={Boolean(errors.ip)} className={cls(errors.ip)}>
                <option value="">—</option>
                {ips.map((ip) => (
                  <option key={ip.slug} value={ip.name[lang]}>{ip.name[lang]}</option>
                ))}
                <option value={t(dict, 'scan.ipOther')}>{t(dict, 'scan.ipOther')}</option>
              </select>
              {errors.ip ? <p className="mt-(--space-1) text-small text-danger">{errors.ip}</p> : null}
            </div>

            <div>
              <label htmlFor="manual-price" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldPrice')}
              </label>
              <input ref={priceRef} id="manual-price" type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={Boolean(errors.price)} className={`tabular-nums ${cls(errors.price)}`} />
              {errors.price ? <p className="mt-(--space-1) text-small text-danger">{errors.price}</p> : null}
            </div>

            <div>
              <label htmlFor="manual-currency" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldCurrency')}
              </label>
              <select id="manual-currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={cls()}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="manual-release" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldRelease')}
              </label>
              <input id="manual-release" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className={cls()} />
            </div>

            <div>
              <label htmlFor="manual-code" className="block text-small font-semibold text-text">
                {t(dict, 'scan.fieldCode')}
              </label>
              <input ref={codeRef} id="manual-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={Boolean(errors.code)} className={cls(errors.code)} />
              {errors.code ? <p className="mt-(--space-1) text-small text-danger">{errors.code}</p> : null}
            </div>
          </div>

          <div className="mt-(--space-5)">
            <Button type="submit" variant="primary" className="w-full md:w-auto">
              {t(dict, 'scan.saveManual')}
            </Button>
            <p className="mt-(--space-2) text-small text-text-muted">{t(dict, 'scan.manualNote')}</p>
            <StorageNote dict={dict} className="mt-(--space-2)" />
          </div>
        </form>
      </div>

      <SubscribeBox lang={lang} dict={dict} topic="tracking_request" requests={lastRequest ? [lastRequest] : []} />
    </div>
  );
}

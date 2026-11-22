'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { config } from '@/config';
import { track } from '@/lib/analytics/track';
import { useCatalog } from '@/lib/data/catalogClient';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { renderCard } from '@/lib/share/renderCard';
import { canWebShareFile, downloadCardFile, shareCardFile } from '@/lib/share/shareActions';
import { buildShareModel } from '@/lib/share/shareModel';
import { useUserData } from '@/lib/storage/useUserData';
import { Button, buttonClass } from '@/components/ui/Button';
import { ClientSection, combineStatus } from '@/components/ui/ClientSection';
import { Icon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShareSettings } from './ShareSettings';

type Props = { lang: Lang; dict: Dict };

export function ShareView({ lang, dict }: Props) {
  const user = useUserData();
  const catalog = useCatalog();
  const [photos, setPhotos] = useState<Record<string, File>>({});
  const [watermark, setWatermark] = useState<boolean>(config.share.watermarkDefault);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const status = combineStatus(user.status, catalog.status);
  const introImg = getImage('IMG-10', lang);
  const emptyImg = getImage('IMG-08', lang);

  const model = useMemo(
    () => (catalog.data ? buildShareModel(user.doc.collection, catalog.data, lang, dict, photos, watermark) : null),
    [catalog.data, user.doc.collection, lang, dict, photos, watermark]
  );

  useEffect(() => {
    if (!model) return;
    let alive = true;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvasRef.current = canvas;
      renderCard(canvas, model.input)
        .then((nextBlob) => {
          if (!alive) return;
          const nextUrl = URL.createObjectURL(nextBlob);
          setBlob(nextBlob);
          setRenderError(false);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return nextUrl;
          });
        })
        .catch(() => {
          if (alive) setRenderError(true);
        });
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [model, retryCount]);

  const handleCreate = async () => {
    if (!model) return;
    setCreating(true);
    try {
      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvasRef.current = canvas;
      const nextBlob = await renderCard(canvas, model.input);
      const nextUrl = URL.createObjectURL(nextBlob);
      setBlob(nextBlob);
      setRenderError(false);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
      setCreated(true);
      track('share_card_create', { item_count: model.cells.length, watermark });
    } catch {
      setRenderError(true);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container-main py-(--space-7)">
      <section className="grid grid-cols-1 items-center gap-(--space-6) lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="text-h1 text-secondary">{t(dict, 'share.h1')}</h1>
          <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'share.lead')}</p>
        </div>
        <div className="hidden justify-end md:flex lg:col-span-5">
          <Image src={introImg.src} alt={introImg.alt} width={introImg.width} height={introImg.height} loading="lazy" className="h-auto w-[280px] object-contain" />
        </div>
      </section>

      <div className="mt-(--space-6)">
        <ClientSection
          status={status}
          isEmpty={user.doc.collection.length === 0}
          skeleton={<div className="mx-auto aspect-4/5 max-w-[420px]"><Skeleton className="h-full w-full rounded-(--radius-lg)" /></div>}
          error={
            <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-6) text-center">
              <Icon name="alert" size={32} className="mx-auto text-danger" />
              <p className="mt-(--space-3) text-body text-text">{t(dict, 'share.error')}</p>
              <Button variant="secondary" onClick={catalog.retry} className="mt-(--space-4)">{t(dict, 'share.retry')}</Button>
            </div>
          }
          empty={
            <div className="flex flex-col items-center rounded-(--radius-lg) border border-border bg-surface p-(--space-7) text-center">
              <Image src={emptyImg.src} alt={emptyImg.alt} width={emptyImg.width} height={emptyImg.height} loading="lazy" className="h-[240px] w-[240px] object-contain" />
              <h2 className="mt-(--space-4) text-h2 text-secondary">{t(dict, 'share.emptyTitle')}</h2>
              <p className="mt-(--space-2) text-body text-text-muted">{t(dict, 'share.emptyBody')}</p>
              <Link href={`/${lang}/scan/`} className={buttonClass('primary', 'mt-(--space-5)')}>
                <Icon name="scan" size={20} />
                <span>{t(dict, 'cta.scan')}</span>
              </Link>
            </div>
          }
        >
          {model ? (
            <div className="grid grid-cols-1 gap-(--space-6) lg:grid-cols-12">
              <div className="mx-auto w-full max-w-[420px] lg:col-span-5 lg:max-w-none">
                {renderError ? (
                  <div className="flex aspect-4/5 flex-col items-center justify-center rounded-(--radius-lg) border border-border bg-surface p-(--space-5) text-center">
                    <Icon name="alert" size={32} className="text-danger" />
                    <p className="mt-(--space-3) text-body text-text">{t(dict, 'share.error')}</p>
                    <Button variant="secondary" onClick={() => setRetryCount((n) => n + 1)} className="mt-(--space-4)">
                      {t(dict, 'share.retry')}
                    </Button>
                  </div>
                ) : previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={t(dict, 'share.h1')}
                    width={1080}
                    height={1350}
                    unoptimized
                    className="aspect-4/5 h-auto w-full rounded-(--radius-lg) shadow-(--shadow-card)"
                  />
                ) : (
                  <div className="flex aspect-4/5 items-center justify-center rounded-(--radius-lg) border border-border bg-surface">
                    <span className="inline-block h-[32px] w-[32px] animate-spin rounded-(--radius-full) border-4 border-border border-t-secondary" />
                  </div>
                )}
              </div>

              <div className="lg:col-span-7">
                <ShareSettings
                  lang={lang}
                  dict={dict}
                  gradeLabel={model.gradeLabel}
                  nextGradeDiffJPY={model.nextGradeDiffJPY}
                  cells={model.cells}
                  photos={photos}
                  onAddPhoto={(id, file) => { setCreated(false); setPhotos((p) => ({ ...p, [id]: file })); }}
                  onRemovePhoto={(id) => { setCreated(false); setPhotos((p) => { const n = { ...p }; delete n[id]; return n; }); }}
                  watermark={watermark}
                  onWatermarkChange={(v) => { setCreated(false); setWatermark(v); }}
                  created={created}
                  creating={creating}
                  canShare={blob ? canWebShareFile(blob) : false}
                  onCreate={() => void handleCreate()}
                  onShare={() => { if (!blob) return; track('share_card_share', { method: 'share' }); void shareCardFile(blob, lang, t(dict, 'share.shareText', { amount: model.totalText })); }}
                  onDownload={() => { if (!blob) return; track('share_card_share', { method: 'download' }); downloadCardFile(blob); }}
                />
              </div>
            </div>
          ) : null}
        </ClientSection>
      </div>
    </div>
  );
}

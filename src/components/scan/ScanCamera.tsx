'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getImage } from '@/lib/data/images';
import type { Lang } from '@/lib/data/types';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

type Props = {
  lang: Lang;
  dict: Dict;
  hasResult: boolean;
  onDetected: (code: string, format: string) => void;
  onFocusManual: () => void;
};

type CamStatus = 'idle' | 'loading' | 'active' | 'denied' | 'unsupported';

export function ScanCamera({ lang, dict, hasResult, onDetected, onFocusManual }: Props) {
  const [status, setStatus] = useState<CamStatus>('idle');
  const [flashSuccess, setFlashSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const img = getImage('IMG-07', lang);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, []);

  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      onFocusManual();
      return;
    }
    setStatus('loading');
    try {
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ]);
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.CODE_128,
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      setStatus('active');
      await new Promise((r) => setTimeout(r, 0));
      if (!videoRef.current) return;
      let handled = false;
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result) => {
          if (!result || handled) return;
          handled = true;
          setFlashSuccess(true);
          navigator.vibrate?.(50);
          const text = result.getText();
          const format = String(result.getBarcodeFormat());
          setTimeout(() => {
            setFlashSuccess(false);
            controlsRef.current?.stop();
            controlsRef.current = null;
            setStatus('idle');
            onDetected(text, format);
          }, 300);
        }
      );
      controlsRef.current = controls;
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
      } else {
        setStatus('unsupported');
      }
      onFocusManual();
    }
  };

  return (
    <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-(--radius-lg) bg-text p-(--space-4) text-text-on-dark">
      {status === 'loading' ? (
        <span
          role="status"
          aria-label="loading"
          className="inline-block h-[32px] w-[32px] animate-spin rounded-(--radius-full) border-4 border-text-on-dark-muted border-t-text-on-dark"
        />
      ) : null}

      {status === 'active' ? (
        <>
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className={`relative z-10 h-[35%] w-[70%] rounded-(--radius-md) border-2 transition-colors duration-150 ${
              flashSuccess ? 'border-success' : 'border-text-on-dark'
            }`}
          />
          <p className="relative z-10 mt-(--space-3) text-small text-text-on-dark">
            {t(dict, 'scan.frameHint')}
          </p>
          <div className="relative z-10 mt-(--space-2)">
            <Button variant="text" onClick={stopCamera} className="text-text-on-dark">
              {t(dict, 'scan.stop')}
            </Button>
          </div>
        </>
      ) : null}

      {status === 'idle' || status === 'denied' || status === 'unsupported' ? (
        <div className="flex flex-col items-center text-center">
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading="lazy"
            className="h-auto w-[60%] max-w-[260px] object-contain"
          />
          {status === 'denied' ? (
            <p className="mt-(--space-3) text-small text-text-on-dark">{t(dict, 'scan.permDenied')}</p>
          ) : null}
          {status === 'unsupported' ? (
            <p className="mt-(--space-3) text-small text-text-on-dark">
              {t(dict, 'scan.unsupported')}
            </p>
          ) : null}
          <div className="mt-(--space-4)">
            <Button
              variant={hasResult ? 'secondary' : 'primary'}
              onClick={() => void startCamera()}
            >
              <Icon name="camera" size={20} />
              <span>{t(dict, 'scan.start')}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { Lang } from '@/lib/data/types';
import { formatLocalMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import type { ShareCardCell } from '@/lib/share/renderCard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';

type Props = {
  lang: Lang;
  dict: Dict;
  gradeLabel: string;
  nextGradeDiffJPY: number | null;
  cells: ShareCardCell[];
  photos: Record<string, File>;
  onAddPhoto: (id: string, file: File) => void;
  onRemovePhoto: (id: string) => void;
  watermark: boolean;
  onWatermarkChange: (v: boolean) => void;
  created: boolean;
  creating: boolean;
  canShare: boolean;
  onCreate: () => void;
  onShare: () => void;
  onDownload: () => void;
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function PhotoThumb({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <Image
      src={url}
      alt=""
      width={32}
      height={32}
      unoptimized
      className="h-[32px] w-[32px] rounded-(--radius-sm) object-cover"
    />
  );
}

export function ShareSettings({
  lang,
  dict,
  gradeLabel,
  nextGradeDiffJPY,
  cells,
  photos,
  onAddPhoto,
  onRemovePhoto,
  watermark,
  onWatermarkChange,
  created,
  creating,
  canShare,
  onCreate,
  onShare,
  onDownload,
}: Props) {
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleFileChange = (id: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(t(dict, 'errors.INVALID_REQUEST'));
      return;
    }
    setPhotoError(null);
    onAddPhoto(id, file);
  };

  return (
    <div className="space-y-(--space-5) rounded-(--radius-lg) border border-border bg-surface p-(--space-5) shadow-(--shadow-card)">
      <div>
        <p className="text-small text-text-muted">{t(dict, 'share.gradeLabel')}</p>
        <h2 className="mt-(--space-1) text-h3 text-secondary">{gradeLabel}</h2>
        {nextGradeDiffJPY !== null ? (
          <p className="mt-(--space-1) text-small text-text-muted tabular-nums">
            {t(dict, 'share.nextGrade', { amount: formatLocalMoney(nextGradeDiffJPY, lang) })}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="text-h4 text-text">{t(dict, 'share.topItems')}</h3>
        {photoError ? <p className="mt-(--space-2) text-small text-danger">{photoError}</p> : null}
        <ul className="mt-(--space-3) divide-y divide-border">
          {cells.map((cell) => {
            const file = photos[cell.id];
            return (
              <li key={cell.id} className="flex items-center justify-between gap-(--space-2) py-(--space-2)">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-semibold text-text">{cell.name}</p>
                  <p className="text-small text-text-muted tabular-nums">{cell.valueText}</p>
                </div>
                <div className="flex shrink-0 items-center gap-(--space-2)">
                  {file ? (
                    <>
                      <PhotoThumb file={file} />
                      <Button
                        variant="icon"
                        aria-label={t(dict, 'col.remove')}
                        onClick={() => onRemovePhoto(cell.id)}
                      >
                        <Icon name="close" size={18} />
                      </Button>
                    </>
                  ) : (
                    <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-(--space-1) px-(--space-2) text-[15px] font-semibold text-secondary hover:underline">
                      <Icon name="upload" size={16} />
                      <span>{t(dict, 'share.addPhoto')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label={`${cell.name} ${t(dict, 'share.addPhoto')}`}
                        onChange={(e) => {
                          handleFileChange(cell.id, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-(--space-2) text-small text-text-muted">{t(dict, 'share.photoNote')}</p>
      </div>

      <label className="flex cursor-pointer items-center gap-(--space-2) text-small text-text">
        <input
          type="checkbox"
          checked={watermark}
          onChange={(e) => onWatermarkChange(e.target.checked)}
          className="h-[20px] w-[20px] accent-secondary"
        />
        <span>{t(dict, 'share.watermark')}</span>
      </label>

      <div className="flex flex-col gap-(--space-3) md:flex-row">
        {!created ? (
          <Button variant="primary" disabled={creating} onClick={onCreate} className="w-full md:w-auto">
            {creating ? (
              <span
                aria-hidden="true"
                className="inline-block h-[18px] w-[18px] animate-spin rounded-(--radius-full) border-2 border-text-on-dark-muted border-t-text-on-dark"
              />
            ) : null}
            <span>{t(dict, 'share.create')}</span>
          </Button>
        ) : canShare ? (
          <>
            <Button variant="primary" onClick={onShare} className="w-full md:w-auto">
              <Icon name="share" size={20} />
              <span>{t(dict, 'share.share')}</span>
            </Button>
            <Button variant="secondary" onClick={onDownload} className="w-full md:w-auto">
              <Icon name="download" size={20} />
              <span>{t(dict, 'share.download')}</span>
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onDownload} className="w-full md:w-auto">
            <Icon name="download" size={20} />
            <span>{t(dict, 'share.download')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

import { config } from '@/config';
import { getImage } from '@/lib/data/images';
import { PLACEHOLDER_SHAPES } from '@/lib/data/placeholderShapes';
import type { GoodsType, Lang } from '@/lib/data/types';

export type ShareCardCell = {
  id: string;
  name: string;
  valueText: string;
  ipColor: string;
  ipInitial: string;
  type: GoodsType;
  photo?: File;
};

export type ShareCardInput = {
  lang: Lang;
  cardTitle: string;
  gradeText: string;
  totalText: string;
  vsRetailText: string;
  premiumSign: 'pos' | 'neg' | 'zero';
  watermark: boolean;
  madeWith: string;
  cells: ShareCardCell[];
};

const W = 1080;
const H = 1350;
const CELL = 296;
const GAP = 24;
const PAD_X = 48;
const GRID_Y = 200;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) {
    end -= 1;
  }
  return `${text.slice(0, end)}…`;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number) {
  const s = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const sx = ((img.naturalWidth || img.width) - s) / 2;
  const sy = ((img.naturalHeight || img.height) - s) / 2;
  ctx.drawImage(img, sx, sy, s, s, x, y, size, size);
}

export async function renderCard(canvas: HTMLCanvasElement, input: ShareCardInput): Promise<Blob> {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  try {
    const bg = await loadImage(getImage('IMG-23', input.lang).src);
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    ctx.fillStyle = '#3B2F6B';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 48px sans-serif';
  ctx.fillText(input.cardTitle, 64, 108);
  ctx.fillStyle = '#D9D4E8';
  ctx.font = '600 32px sans-serif';
  ctx.fillText(input.gradeText, 64, 158);

  const cells = input.cells.slice(0, 9);
  for (let idx = 0; idx < 9; idx += 1) {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = PAD_X + col * (CELL + GAP);
    const y = GRID_Y + row * (CELL + GAP);
    const cell = cells[idx];

    if (!cell) {
      ctx.save();
      roundRect(ctx, x, y, CELL, CELL, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.restore();
      continue;
    }

    ctx.save();
    roundRect(ctx, x, y, CELL, CELL, 24);
    ctx.clip();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, CELL, CELL);

    let drewPhoto = false;
    if (cell.photo) {
      const objUrl = URL.createObjectURL(cell.photo);
      try {
        const photoImg = await loadImage(objUrl);
        drawCover(ctx, photoImg, x, y, CELL);
        drewPhoto = true;
      } catch {
        drewPhoto = false;
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    }

    if (!drewPhoto) {
      ctx.fillStyle = cell.ipColor;
      ctx.fillRect(x, y, CELL, CELL);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(CELL / 100, CELL / 100);
      if (typeof Path2D !== 'undefined') {
        const path = new Path2D(PLACEHOLDER_SHAPES[cell.type]);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path);
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cell.ipInitial, 50, 76);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(28, 26, 36, 0.7)';
    ctx.fillRect(x, y + CELL - 80, CELL, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '400 22px sans-serif';
    ctx.fillText(truncateText(ctx, cell.name, CELL - 24), x + 12, y + CELL - 46);
    ctx.font = '700 24px sans-serif';
    ctx.fillText(cell.valueText, x + 12, y + CELL - 16);
    ctx.restore();
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 56px sans-serif';
  ctx.fillText(input.totalText, 64, 1235);
  ctx.fillStyle =
    input.premiumSign === 'pos' ? '#8FE0B0' : input.premiumSign === 'neg' ? '#FFB3B6' : '#D9D4E8';
  ctx.font = '600 32px sans-serif';
  ctx.fillText(input.vsRetailText, 64, 1286);

  if (input.watermark) {
    const host = new URL(config.site.url).host;
    try {
      const logo = await loadImage('/images/brand/logo-symbol-mono.svg');
      ctx.drawImage(logo, W - 64 - 40, 1185, 40, 40);
    } catch {
      // Skip logo if unavailable
    }
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#D9D4E8';
    ctx.font = '400 24px sans-serif';
    ctx.fillText(`${input.madeWith} · ${host}`, W - 64, 1286);
    ctx.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas toBlob returned null'));
    }, 'image/png');
  });
}

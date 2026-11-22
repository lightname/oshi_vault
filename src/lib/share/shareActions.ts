import { config } from '@/config';
import type { Lang } from '@/lib/data/types';

export function canWebShareFile(blob: Blob): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false;
  const file = new File([blob], 'oshi-vault-shelf.png', { type: 'image/png' });
  return navigator.canShare({ files: [file] });
}

export async function shareCardFile(blob: Blob, lang: Lang, shareText: string): Promise<void> {
  const file = new File([blob], 'oshi-vault-shelf.png', { type: 'image/png' });
  const url = `${config.site.url}/${lang}/?utm_source=share_card&utm_medium=social`;
  await navigator.share({ files: [file], text: `${shareText}\n${url}` });
}

export function downloadCardFile(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oshi-vault-shelf.png';
  a.click();
  URL.revokeObjectURL(url);
}

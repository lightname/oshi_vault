import manifest from '@/data/images.manifest.json';
import type { Lang } from './types';

export type ImageId = keyof typeof manifest;

export function getImage(id: ImageId, lang: Lang): {
  src: string;
  width: number;
  height: number;
  alt: string;
} {
  const m = manifest[id];
  return { src: m.src, width: m.width, height: m.height, alt: m.alt[lang] };
}

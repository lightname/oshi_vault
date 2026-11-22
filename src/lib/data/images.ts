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

const BRAND_LOGO = {
  default: { src: '/images/brand/logo-symbol.svg', width: 64, height: 64, alt: '' },
  mono: { src: '/images/brand/logo-symbol-mono.svg', width: 64, height: 64, alt: '' },
} as const;

export function getBrandLogo(variant: keyof typeof BRAND_LOGO = 'default') {
  return BRAND_LOGO[variant];
}

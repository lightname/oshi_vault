import { Inter, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google';
import type { Lang } from '@/lib/data/types';

export const notoSansKr = Noto_Sans_KR({
  weight: ['400', '600', '700'],
  preload: false,
  display: 'swap',
});

export const notoSansJp = Noto_Sans_JP({
  weight: ['400', '600', '700'],
  preload: false,
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export function getFont(lang: Lang) {
  if (lang === 'ko') return notoSansKr;
  if (lang === 'ja') return notoSansJp;
  return inter;
}

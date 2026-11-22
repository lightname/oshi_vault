import type { GoodsType } from './types';

// Shapes inside a 40x40 area (x: 30..70, y: 22..62) on a 100x100 viewBox
export const PLACEHOLDER_SHAPES: Record<GoodsType, string> = {
  figure:
    'M 50 24 A 8 8 0 1 0 50 40 A 8 8 0 1 0 50 24 M 40 42 H 60 Q 64 42 64 46 V 58 Q 64 62 60 62 H 40 Q 36 62 36 58 V 46 Q 36 42 40 42 Z',
  plush:
    'M 38 26 A 5 5 0 1 0 38 36 A 5 5 0 1 0 38 26 M 62 26 A 5 5 0 1 0 62 36 A 5 5 0 1 0 62 26 M 50 32 A 14 14 0 1 0 50 60 A 14 14 0 1 0 50 32',
  badge:
    'M 43 32 A 11 11 0 1 0 43 54 A 11 11 0 1 0 43 32 M 57 32 A 11 11 0 1 0 57 54 A 11 11 0 1 0 57 32',
  card:
    'M 41 24 H 59 Q 63 24 63 28 V 56 Q 63 60 59 60 H 41 Q 37 60 37 56 V 28 Q 37 24 41 24 Z',
  kuji:
    'M 38 24 V 62 M 38 26 L 64 34 L 38 42 Z',
  apparel:
    'M 42 26 L 32 32 L 36 42 L 41 39 V 60 H 59 V 39 L 64 42 L 68 32 L 58 26 Q 50 32 42 26 Z',
  other:
    'M 50 24 L 55 37 L 68 42 L 55 47 L 50 60 L 45 47 L 32 42 L 45 37 Z',
};

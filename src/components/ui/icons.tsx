import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'scan'
  | 'shelf'
  | 'heart'
  | 'heart-filled'
  | 'external'
  | 'globe'
  | 'chevron-down'
  | 'chevron-right'
  | 'close'
  | 'menu'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'share'
  | 'download'
  | 'camera'
  | 'upload'
  | 'info'
  | 'check'
  | 'alert'
  | 'arrow-up-right'
  | 'arrow-down-right'
  | 'calculator'
  | 'book';

type Props = { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>;

const PATHS: Record<IconName, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4.5 4.5',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10',
  shelf: 'M4 5h16v14H4V5Zm0 7h16M9 5v7m6 0v7',
  heart: 'M12 20s-7-4.5-8.5-9A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.5 11C19 15.5 12 20 12 20Z',
  'heart-filled': 'M12 20s-7-4.5-8.5-9A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.5 11C19 15.5 12 20 12 20Z',
  external: 'M14 4h6v6m0-6L10 14M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-8.5 9h17M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9Z',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6m4-6v6',
  share: 'M12 4v11m0-11-4 4m4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 18v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1',
  camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  upload: 'M12 16V5m0 0-4 4m4-4 4 4M5 18v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 8v5m0-8h.01',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  alert: 'M12 4 3 19h18L12 4Zm0 6v4m0 3h.01',
  'arrow-up-right': 'M7 17 17 7M9 7h8v8',
  'arrow-down-right': 'M7 7 17 17M17 9v8H9',
  calculator: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 4h8v3H8V7Zm0 6h2m3 0h2m-7 3h2m3 0h2m-7 3h2m3 0h2',
  book: 'M5 4h11a3 3 0 0 1 3 3v13H7a2 2 0 0 0-2 2V4Zm0 14a2 2 0 0 1 2-2h12',
};

export function Icon({ name, size = 24, className, ...rest }: Props) {
  const filled = name === 'heart-filled';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

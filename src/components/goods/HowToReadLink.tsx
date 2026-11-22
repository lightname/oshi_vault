'use client';

import Link from 'next/link';
import { track } from '@/lib/analytics/track';
import { buttonClass } from '@/components/ui/Button';

type Props = {
  href: string;
  label: string;
};

export function HowToReadLink({ href, label }: Props) {
  const targetScreen = href.includes('/guides/') ? 'S-11' : 'S-12';
  return (
    <Link
      href={href}
      onClick={() =>
        track('internal_link_click', {
          block: 'how_to_read',
          target_screen_id: targetScreen,
        })
      }
      className={buttonClass('text')}
    >
      {label}
    </Link>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Props = {
  message: string | null;
  actionLabel?: string;
  actionHref?: string;
  onClose: () => void;
};

export function Toast({ message, actionLabel, actionHref, onClose }: Props) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-(--space-5) left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[360px] -translate-x-1/2 items-center justify-between gap-(--space-3) rounded-(--radius-md) bg-text px-(--space-4) py-(--space-3) text-small text-text-on-dark shadow-(--shadow-raised) transition-all duration-200 ease-out md:left-auto md:right-(--space-5) md:translate-x-0"
    >
      <span>{message}</span>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="shrink-0 px-(--space-2) py-(--space-1) text-[15px] font-semibold text-text-on-dark underline underline-offset-[3px]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

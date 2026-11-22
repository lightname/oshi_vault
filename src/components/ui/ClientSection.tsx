'use client';

import type { ReactNode } from 'react';

type Status = 'loading' | 'ready' | 'error';

type Props = {
  status: Status;
  skeleton: ReactNode;
  error: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
  children: ReactNode;
};

export function combineStatus(...statuses: Status[]): Status {
  if (statuses.includes('error')) return 'error';
  if (statuses.includes('loading')) return 'loading';
  return 'ready';
}

export function ClientSection({ status, skeleton, error, empty, isEmpty, children }: Props) {
  if (status === 'loading') return <>{skeleton}</>;
  if (status === 'error') return <>{error}</>;
  if (isEmpty && empty !== undefined) return <>{empty}</>;
  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';
import type { Catalog } from './types';

let cache: Promise<Catalog> | null = null;
let logged = false;

export function loadCatalog(): Promise<Catalog> {
  if (!cache) {
    cache = fetch('/data/catalog.json')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<Catalog>;
      })
      .catch((e: unknown) => {
        cache = null;
        if (!logged) {
          logged = true;
          console.error('[catalog] failed to load', e);
        }
        throw e;
      });
  }
  return cache;
}

export function _resetCatalogCache(): void {
  cache = null;
  logged = false;
}

export function useCatalog(enabled = true): {
  status: 'loading' | 'ready' | 'error';
  data: Catalog | null;
  retry: () => void;
} {
  const [s, set] = useState<{ status: 'loading' | 'ready' | 'error'; data: Catalog | null }>({
    status: 'loading',
    data: null,
  });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadCatalog()
      .then((data) => {
        if (alive) set({ status: 'ready', data });
      })
      .catch(() => {
        if (alive) set({ status: 'error', data: null });
      });
    return () => {
      alive = false;
    };
  }, [n, enabled]);

  return {
    ...s,
    retry: () => {
      set({ status: 'loading', data: null });
      setN((v) => v + 1);
    },
  };
}

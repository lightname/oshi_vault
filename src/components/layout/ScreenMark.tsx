'use client';

import { useEffect } from 'react';

export function ScreenMark({ screen }: { screen: string }) {
  useEffect(() => {
    document.body.dataset.screen = screen;
  }, [screen]);

  return null;
}

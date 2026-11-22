import { config } from '@/config';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: {
            client_id: string;
            callback: (res: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: { theme: string; size: string; text: string; width: number }
          ) => void;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

export function loadGis(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        reject(new Error('GIS load failed'));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

export function renderGisButton(
  el: HTMLElement,
  onCredential: (token: string) => void
): () => void {
  el.innerHTML = '';
  let cancelled = false;

  if (!config.google.clientId) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Mock Google';
    btn.className =
      'inline-flex min-h-[48px] w-[280px] items-center justify-center rounded-(--radius-md) border-[1.5px] border-secondary bg-surface px-[20px] text-[16px] font-semibold text-secondary transition-colors duration-150 hover:bg-secondary-tint';
    const onClick = () => onCredential('mock-token');
    btn.addEventListener('click', onClick);
    el.appendChild(btn);
    return () => {
      cancelled = true;
      btn.removeEventListener('click', onClick);
      el.innerHTML = '';
    };
  }

  void loadGis()
    .then(() => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: config.google.clientId,
        callback: (res) => onCredential(res.credential),
      });
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 280,
      });
    })
    .catch((e: unknown) => {
      console.error('[gis] failed to load', e);
    });

  return () => {
    cancelled = true;
    el.innerHTML = '';
  };
}

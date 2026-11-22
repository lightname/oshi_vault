export type ConsentState = 'granted' | 'denied';

export const getConsent = (): ConsentState | null => {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem('mipg.consent.v1');
  return v === 'granted' || v === 'denied' ? v : null;
};

export const setConsent = (v: ConsentState): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('mipg.consent.v1', v);
};

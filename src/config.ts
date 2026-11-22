export const config = {
  site: {
    url: 'https://REPLACE-ME.pages.dev',
    name: { ko: '오시볼트', en: 'Oshi Vault', ja: 'オシボルト' },
  },
  locales: ['ko', 'en', 'ja'] as const,
  defaultLocale: 'ko' as const,
  localeCurrency: { ko: 'KRW', en: 'USD', ja: 'JPY' } as const,
  seo: { indexLevel: 1 as 1 | 2 | 3 | 4, gscVerification: '' },
  analytics: { ga4Id: '' },
  google: { clientId: '' },
  api: { baseUrl: '', mode: 'mock' as 'mock' | 'live' },
  subscribe: { consentVersion: '2026-10-v1' },
  affiliate: { ebay: null, mercari: null, kream: null } as Record<
    'ebay' | 'mercari' | 'kream',
    { param: string; value: string } | null
  >,
  fx: { baseDate: '2026-10-24', toJPY: { JPY: 1, KRW: 0.11, USD: 150 } },
  price: { staleDays: 90 },
  share: {
    watermarkDefault: true,
    grades: [
      { id: 'starter', minJPY: 0 },
      { id: 'collector', minJPY: 30000 },
      { id: 'curator', minJPY: 100000 },
      { id: 'keeper', minJPY: 300000 },
    ],
  },
  ipColors: [
    '#3B2F6B',
    '#C2410C',
    '#2563A8',
    '#B4235A',
    '#1F7A4D',
    '#6B7A2E',
    '#1C1A24',
    '#B45309',
  ],
} as const;

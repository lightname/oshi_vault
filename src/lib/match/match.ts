import type { Catalog, Goods } from '@/lib/data/types';

export const norm = (s: string): string =>
  s.normalize('NFKC').toLowerCase().replace(/[\s\-_・·]/g, '');

const digits = (s: string): string => s.replace(/\D/g, '');

export function matchCode(input: string, goods: Goods[]): Goods | null {
  const q = norm(input);
  const d = digits(input);
  return (
    goods.find(
      (g) => g.code !== null && (norm(g.code) === q || (d.length >= 6 && digits(g.code) === d))
    ) ?? null
  );
}

export function search(input: string, cat: Catalog, limit = 48): Goods[] {
  const q = norm(input);
  if (q === '') return [];
  const byCode = matchCode(input, cat.goods);
  const ipName = (g: Goods) => {
    const ip = cat.ips.find((i) => i.slug === g.ipSlug);
    return ip ? [ip.name.ko, ip.name.en, ip.name.ja, ip.original] : [];
  };
  const hits = cat.goods.filter(
    (g) =>
      g !== byCode &&
      [g.name.ko, g.name.en, g.name.ja, g.original, g.code ?? '', ...ipName(g)].some((v) =>
        norm(v).includes(q)
      )
  );
  return (byCode ? [byCode, ...hits] : hits).slice(0, limit);
}

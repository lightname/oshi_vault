import ipsData from '@/data/generated/ips.json';
import goodsData from '@/data/generated/goods.json';
import pricesData from '@/data/generated/prices.json';
import metaData from '@/data/generated/meta.json';
import { config } from '@/config';
import type { Goods, Ip, Lang, Meta, PriceSnapshot } from './types';

const IPS: Ip[] = [...(ipsData as Ip[])].sort((a, b) => a.order - b.order);
const GOODS: Goods[] = [...(goodsData as Goods[])].sort((a, b) => a.id.localeCompare(b.id));
const PRICES: PriceSnapshot[] = [...(pricesData as PriceSnapshot[])].sort(
  (a, b) => a.date.localeCompare(b.date) || a.market.localeCompare(b.market)
);
const META: Meta = metaData as Meta;

export const getIps = (): Ip[] => IPS;
export const getIp = (slug: string): Ip | undefined => IPS.find((ip) => ip.slug === slug);
export const getGoods = (): Goods[] => GOODS;
export const getGoodsById = (id: string): Goods | undefined =>
  GOODS.find((g) => g.id.toLowerCase() === id.toLowerCase());
export const getGoodsByIp = (slug: string): Goods[] => GOODS.filter((g) => g.ipSlug === slug);
export const getPrices = (goodsId: string): PriceSnapshot[] =>
  PRICES.filter((p) => p.goodsId === goodsId);
export const getAllPrices = (): PriceSnapshot[] => PRICES;
export const getMeta = (): Meta => META;

export function goodsPath(lang: Lang, g: Pick<Goods, 'id' | 'slug'>): string {
  const idLower = g.id.toLowerCase();
  return g.slug ? `/${lang}/goods/${idLower}-${g.slug}/` : `/${lang}/goods/${idLower}/`;
}

export function ipColor(ip: Pick<Ip, 'order'>): string {
  return config.ipColors[ip.order % config.ipColors.length];
}

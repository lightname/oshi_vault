import type { Currency, UserDataDoc } from '@/lib/data/types';

export interface UserDataRepository {
  load(): Promise<UserDataDoc>;
  save(doc: UserDataDoc): Promise<void>;
}

export const EMPTY: UserDataDoc = {
  version: 1,
  collection: [],
  wishlist: [],
  prefs: { subscribed: {} },
};

export class CorruptDataError extends Error {}

const CURRENCIES = new Set<Currency>(['JPY', 'KRW', 'USD']);
const isRec = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCur = (v: unknown): v is Currency => typeof v === 'string' && CURRENCIES.has(v as Currency);

export function isUserDataDoc(v: unknown): v is UserDataDoc {
  if (!isRec(v) || v.version !== 1) return false;
  if (!Array.isArray(v.collection) || !Array.isArray(v.wishlist)) return false;
  if (!isRec(v.prefs) || !isRec(v.prefs.subscribed)) return false;

  for (const item of v.collection) {
    if (!isRec(item)) return false;
    if (typeof item.id !== 'string' || typeof item.addedAt !== 'string') return false;
    if (item.goodsId !== null && typeof item.goodsId !== 'string') return false;
    if (typeof item.qty !== 'number' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99) return false;
    if (item.manual !== undefined) {
      if (!isRec(item.manual)) return false;
      if (
        typeof item.manual.name !== 'string' ||
        typeof item.manual.ipName !== 'string' ||
        typeof item.manual.price !== 'number' ||
        !isCur(item.manual.currency)
      ) {
        return false;
      }
    }
  }

  for (const w of v.wishlist) {
    if (!isRec(w)) return false;
    if (typeof w.goodsId !== 'string' || typeof w.addedAt !== 'string' || !isCur(w.currency)) return false;
    if (w.targetPrice !== null && (typeof w.targetPrice !== 'number' || w.targetPrice <= 0)) return false;
  }

  return true;
}

export const localRepository: UserDataRepository = {
  async load() {
    const raw = window.localStorage.getItem('mipg.v1');
    if (raw === null) return structuredClone(EMPTY);
    let doc: unknown;
    try {
      doc = JSON.parse(raw);
    } catch {
      throw new CorruptDataError('parse');
    }
    if (!isUserDataDoc(doc)) throw new CorruptDataError('shape');
    return doc;
  },
  async save(doc) {
    window.localStorage.setItem('mipg.v1', JSON.stringify(doc));
  },
};

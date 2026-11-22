import type { Currency, ManualItem, SubscribeTopic, UserDataDoc } from '@/lib/data/types';
import { EMPTY, localRepository } from './repository';

export type UserDataState = {
  status: 'loading' | 'ready' | 'error';
  doc: UserDataDoc;
};

let state: UserDataState = { status: 'loading', doc: EMPTY };
const listeners = new Set<() => void>();
let started = false;

const emit = () => listeners.forEach((l) => l());
const clampQty = (n: number) => Math.max(1, Math.min(99, Math.round(n)));

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  if (!started) {
    started = true;
    localRepository
      .load()
      .then((doc) => {
        state = { status: 'ready', doc };
        emit();
      })
      .catch(() => {
        state = { status: 'error', doc: EMPTY };
        emit();
      });
  }
  return () => {
    listeners.delete(l);
  };
}

export const getSnapshot = (): UserDataState => state;
const SERVER_SNAPSHOT: UserDataState = { status: 'loading', doc: EMPTY };
export const getServerSnapshot = (): UserDataState => SERVER_SNAPSHOT;

export function update(fn: (d: UserDataDoc) => UserDataDoc): void {
  if (state.status !== 'ready') return;
  const doc = fn(state.doc);
  state = { status: 'ready', doc };
  emit();
  void localRepository.save(doc);
}

export function reset(): void {
  state = { status: 'ready', doc: structuredClone(EMPTY) };
  emit();
  void localRepository.save(state.doc);
}

export function _resetStoreForTest(): void {
  state = { status: 'loading', doc: EMPTY };
  started = false;
  listeners.clear();
}

export function addToCollection(goodsId: string, delta = 1): void {
  update((d) => {
    const idx = d.collection.findIndex((i) => i.goodsId === goodsId);
    if (idx >= 0) {
      const next = [...d.collection];
      next[idx] = { ...next[idx], qty: clampQty(next[idx].qty + delta) };
      return { ...d, collection: next };
    }
    return {
      ...d,
      collection: [
        ...d.collection,
        { id: goodsId, goodsId, qty: clampQty(delta), addedAt: new Date().toISOString() },
      ],
    };
  });
}

export function addManual(manual: ManualItem, qty = 1): void {
  update((d) => ({
    ...d,
    collection: [
      ...d.collection,
      {
        id: `USR-${Date.now().toString(36)}`,
        goodsId: null,
        manual,
        qty: clampQty(qty),
        addedAt: new Date().toISOString(),
      },
    ],
  }));
}

export function setQty(id: string, qty: number): void {
  update((d) => ({
    ...d,
    collection: d.collection.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)),
  }));
}

export function removeItem(id: string): void {
  update((d) => ({
    ...d,
    collection: d.collection.filter((i) => i.id !== id),
  }));
}

export function addToWishlist(goodsId: string, currency: Currency): void {
  update((d) => {
    if (d.wishlist.some((w) => w.goodsId === goodsId)) return d;
    return {
      ...d,
      wishlist: [
        ...d.wishlist,
        { goodsId, targetPrice: null, currency, addedAt: new Date().toISOString() },
      ],
    };
  });
}

export function setTarget(goodsId: string, price: number | null, currency?: Currency): void {
  update((d) => ({
    ...d,
    wishlist: d.wishlist.map((w) =>
      w.goodsId === goodsId
        ? { ...w, targetPrice: price, ...(currency ? { currency } : {}) }
        : w
    ),
  }));
}

export function removeWish(goodsId: string): void {
  update((d) => ({
    ...d,
    wishlist: d.wishlist.filter((w) => w.goodsId !== goodsId),
  }));
}

export function markSubscribed(topic: SubscribeTopic): void {
  update((d) => ({
    ...d,
    prefs: {
      ...d.prefs,
      subscribed: { ...d.prefs.subscribed, [topic]: new Date().toISOString() },
    },
  }));
}

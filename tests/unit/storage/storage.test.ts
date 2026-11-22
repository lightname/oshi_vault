import { beforeEach, describe, expect, it } from 'vitest';
import { CorruptDataError, isUserDataDoc, localRepository } from '@/lib/storage/repository';
import {
  _resetStoreForTest,
  addManual,
  addToCollection,
  addToWishlist,
  getServerSnapshot,
  getSnapshot,
  markSubscribed,
  removeItem,
  removeWish,
  reset,
  setQty,
  setTarget,
  subscribe,
  update,
} from '@/lib/storage/store';

beforeEach(() => {
  window.localStorage.clear();
  _resetStoreForTest();
});

describe('user data storage (C-32)', () => {
  it('validates document shapes and handles corrupt localStorage', async () => {
    expect(isUserDataDoc(null)).toBe(false);
    expect(isUserDataDoc({ version: 2 })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [], wishlist: 'bad', prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [], wishlist: [], prefs: null })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [null], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [{ id: 1 }], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [{ id: 'a', goodsId: 1, qty: 1, addedAt: '' }], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [{ id: 'a', goodsId: null, qty: 0, addedAt: '' }], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [{ id: 'a', goodsId: null, qty: 1, addedAt: '', manual: null }], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [{ id: 'a', goodsId: null, qty: 1, addedAt: '', manual: { name: 'n', ipName: 'i', price: 'bad', currency: 'JPY' } }], wishlist: [], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [], wishlist: [null], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [], wishlist: [{ goodsId: 'a', addedAt: '', currency: 'EUR', targetPrice: null }], prefs: { subscribed: {} } })).toBe(false);
    expect(isUserDataDoc({ version: 1, collection: [], wishlist: [{ goodsId: 'a', addedAt: '', currency: 'JPY', targetPrice: -5 }], prefs: { subscribed: {} } })).toBe(false);

    const empty = await localRepository.load();
    expect(empty.collection).toEqual([]);

    window.localStorage.setItem('mipg.v1', '{bad json');
    await expect(localRepository.load()).rejects.toBeInstanceOf(CorruptDataError);

    window.localStorage.setItem('mipg.v1', JSON.stringify({ version: 99 }));
    await expect(localRepository.load()).rejects.toBeInstanceOf(CorruptDataError);
  });

  it('mutates collection, wishlist, subscriptions, and resets cleanly', async () => {
    expect(getServerSnapshot().status).toBe('loading');
    update((d) => d); // no-op while loading

    const unsub = subscribe(() => {});
    await new Promise((r) => setTimeout(r, 10));
    expect(getSnapshot().status).toBe('ready');

    addToCollection('PKM-0001');
    addToCollection('PKM-0001', 100);
    expect(getSnapshot().doc.collection[0].qty).toBe(99);

    setQty('PKM-0001', 3);
    expect(getSnapshot().doc.collection[0].qty).toBe(3);

    addManual({ name: 'Custom', ipName: 'Other', price: 1200, currency: 'JPY' });
    expect(getSnapshot().doc.collection).toHaveLength(2);
    const manualId = getSnapshot().doc.collection[1].id;
    expect(manualId.startsWith('USR-')).toBe(true);
    setQty(manualId, 2);
    removeItem(manualId);
    expect(getSnapshot().doc.collection).toHaveLength(1);

    addToWishlist('PKM-0001', 'KRW');
    addToWishlist('PKM-0001', 'KRW'); // duplicate ignored
    expect(getSnapshot().doc.wishlist).toHaveLength(1);
    setTarget('PKM-0001', 50000);
    expect(getSnapshot().doc.wishlist[0].targetPrice).toBe(50000);
    setTarget('OTHER', 1000);
    removeWish('PKM-0001');
    expect(getSnapshot().doc.wishlist).toHaveLength(0);

    markSubscribed('target_price');
    expect(getSnapshot().doc.prefs.subscribed.target_price).toBeTruthy();

    // Reload from localStorage
    const persisted = await localRepository.load();
    expect(persisted.collection).toHaveLength(1);

    reset();
    expect(getSnapshot().doc.collection).toHaveLength(0);
    unsub();

    // Error state on corrupt storage
    _resetStoreForTest();
    window.localStorage.setItem('mipg.v1', 'not-json');
    const unsub2 = subscribe(() => {});
    await new Promise((r) => setTimeout(r, 10));
    expect(getSnapshot().status).toBe('error');
    unsub2();
  });
});

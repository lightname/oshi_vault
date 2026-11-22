'use client';

import type { Lang } from '@/lib/data/types';
import type { Dict } from '@/lib/i18n/dictionary';
import { useUserData } from '@/lib/storage/useUserData';
import { SubscribeBox } from '@/components/subscribe/SubscribeBox';

type Props = {
  goodsId: string;
  lang: Lang;
  dict: Dict;
};

export function GoodsSubscribe({ goodsId, lang, dict }: Props) {
  const user = useUserData();
  const wish = user.status === 'ready' ? user.doc.wishlist.find((w) => w.goodsId === goodsId) : undefined;
  const watches =
    wish && wish.targetPrice !== null
      ? [{ goodsId: wish.goodsId, targetPrice: wish.targetPrice, currency: wish.currency }]
      : [];

  return <SubscribeBox lang={lang} dict={dict} topic="target_price" watches={watches} />;
}

import Link from 'next/link';
import { goodsPath, ipColor } from '@/lib/data/catalog';
import type { Goods, Ip, Lang } from '@/lib/data/types';
import { formatLocalMoney, formatMoney } from '@/lib/format/format';
import { t, type Dict } from '@/lib/i18n/dictionary';
import { premiumRatio, type Current } from '@/lib/price/price';
import { Chip } from '@/components/ui/Chip';
import { GoodsPlaceholder } from './GoodsPlaceholder';
import { PremiumBadge } from './PremiumBadge';

type Props = {
  goods: Goods;
  ip: Ip;
  lang: Lang;
  dict: Dict;
  current: Current;
  onClick?: () => void;
};

export function GoodsCard({ goods, ip, lang, dict, current, onClick }: Props) {
  const displayName = goods.name[lang] || goods.original;
  const initial = (ip.name.en || ip.original).trim().charAt(0).toUpperCase();
  const retailStr = formatMoney(goods.retail.price, goods.retail.currency, lang);

  return (
    <Link
      href={goodsPath(lang, goods)}
      onClick={onClick}
      className="group flex flex-col rounded-(--radius-lg) border border-border bg-surface p-(--space-3) shadow-(--shadow-card) transition-all duration-150 ease-out hover:border-secondary hover:shadow-(--shadow-raised)"
    >
      <div className="overflow-hidden rounded-(--radius-md)">
        <GoodsPlaceholder
          ipColor={ipColor(ip)}
          ipInitial={initial}
          type={goods.type}
          size={300}
          label={displayName}
          className="aspect-square h-auto w-full"
        />
      </div>
      <p className="mt-(--space-3) text-label text-text-muted">{ip.name[lang]}</p>
      <h3 className="mt-(--space-1) line-clamp-2 text-h4 text-text group-hover:text-secondary">
        {displayName}
      </h3>
      <p className="mt-(--space-2) text-small text-text-muted tabular-nums">
        {t(dict, 'goods.retail', { price: retailStr })}
      </p>
      <div className="mt-auto pt-(--space-2)">
        {current ? (
          <div className="flex flex-wrap items-center gap-(--space-2)">
            <span className="text-[16px] font-bold leading-[24px] text-text tabular-nums">
              {formatLocalMoney(current.jpy, lang)}
            </span>
            <PremiumBadge ratio={premiumRatio(current.jpy, goods.retail)} />
          </div>
        ) : (
          <Chip>{t(dict, 'goods.priceCollecting')}</Chip>
        )}
      </div>
    </Link>
  );
}

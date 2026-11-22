import { formatPercent } from '@/lib/format/format';
import { Icon } from '@/components/ui/icons';

export function PremiumBadge({ ratio }: { ratio: number }) {
  const rounded = Math.round(ratio * 100);
  const label = formatPercent(ratio);

  if (rounded > 0) {
    return (
      <span className="inline-flex h-[22px] items-center gap-[2px] rounded-(--radius-sm) bg-[#E8F3EC] px-[6px] text-label text-success tabular-nums">
        <Icon name="arrow-up-right" size={14} />
        <span>{label}</span>
      </span>
    );
  }
  if (rounded < 0) {
    return (
      <span className="inline-flex h-[22px] items-center gap-[2px] rounded-(--radius-sm) bg-[#F9E7E8] px-[6px] text-label text-danger tabular-nums">
        <Icon name="arrow-down-right" size={14} />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-[22px] items-center rounded-(--radius-sm) bg-bg px-[6px] text-label text-text-muted tabular-nums">
      {label}
    </span>
  );
}

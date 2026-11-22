import { PLACEHOLDER_SHAPES } from '@/lib/data/placeholderShapes';
import type { GoodsType } from '@/lib/data/types';

type Props = {
  ipColor: string;
  ipInitial: string;
  type: GoodsType;
  size: number;
  label: string;
  className?: string;
};

export function GoodsPlaceholder({ ipColor, ipInitial, type, size, label, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={className}
    >
      <rect x={0} y={0} width={100} height={100} rx={12} fill={ipColor} />
      <path
        d={PLACEHOLDER_SHAPES[type]}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={50}
        y={86}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={16}
        fontWeight={700}
      >
        {ipInitial}
      </text>
    </svg>
  );
}

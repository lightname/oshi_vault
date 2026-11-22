import type { ReactNode } from 'react';

type Tone = 'neutral' | 'selected' | 'warning' | 'success' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'bg-bg text-text-muted border border-border',
  selected: 'bg-secondary-tint text-secondary border border-secondary',
  warning: 'bg-[#FBF0E4] text-warning',
  success: 'bg-[#E8F3EC] text-success',
  danger: 'bg-[#F9E7E8] text-danger',
};

type Props = {
  children: ReactNode;
  tone?: Tone;
  pill?: boolean;
  className?: string;
};

export function Chip({ children, tone = 'neutral', pill = false, className }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-(--space-1) px-(--space-2) py-[3px] text-label whitespace-nowrap',
        pill ? 'rounded-(--radius-full)' : 'rounded-(--radius-sm)',
        TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

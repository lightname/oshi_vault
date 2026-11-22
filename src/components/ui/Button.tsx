import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-(--space-2) rounded-(--radius-md) transition-colors duration-150 ease-out cursor-pointer disabled:cursor-not-allowed';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'min-h-[48px] px-[20px] text-[16px] leading-[24px] font-semibold text-text-on-dark bg-primary hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text',
  secondary:
    'min-h-[48px] px-[20px] text-[16px] leading-[24px] font-semibold text-secondary bg-surface border-[1.5px] border-secondary hover:bg-secondary-tint hover:text-secondary-hover disabled:border-border disabled:bg-surface disabled:text-disabled-text',
  text:
    'min-h-[44px] px-[8px] text-[15px] leading-[22px] font-semibold text-secondary hover:underline underline-offset-[3px] decoration-1 disabled:text-disabled-text disabled:no-underline',
  icon:
    'w-[44px] h-[44px] p-0 text-text hover:bg-secondary-tint disabled:text-disabled-text disabled:hover:bg-transparent',
};

export function buttonClass(variant: ButtonVariant, className?: string): string {
  return [BASE, VARIANTS[variant], className].filter(Boolean).join(' ');
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = 'primary', type = 'button', className, ...rest }: Props) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

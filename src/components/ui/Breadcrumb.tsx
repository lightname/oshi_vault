import Link from 'next/link';
import { Icon } from './icons';

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="mb-(--space-4)">
      <ol className="flex flex-wrap items-center gap-(--space-1) text-small text-text-muted">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-(--space-1)">
              {idx > 0 ? <Icon name="chevron-right" size={14} className="shrink-0" /> : null}
              {last || !item.href ? (
                <span className="text-text" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-secondary hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

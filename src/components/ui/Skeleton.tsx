export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-(--radius-sm) bg-border ${className}`}
    />
  );
}

export function GoodsCardSkeleton() {
  return (
    <div className="rounded-(--radius-lg) border border-border bg-surface p-(--space-3) shadow-(--shadow-card)">
      <Skeleton className="aspect-square w-full rounded-(--radius-md)" />
      <Skeleton className="mt-(--space-3) h-3 w-1/3" />
      <Skeleton className="mt-(--space-2) h-4 w-full" />
      <Skeleton className="mt-(--space-1) h-4 w-2/3" />
      <Skeleton className="mt-(--space-3) h-3 w-1/2" />
    </div>
  );
}

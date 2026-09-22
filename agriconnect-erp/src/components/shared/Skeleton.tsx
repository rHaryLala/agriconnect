export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-sheen animate-shimmer rounded-md bg-muted ${className}`} />
}

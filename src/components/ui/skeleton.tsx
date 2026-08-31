import { cn } from "@/lib/utils";

// 🦴 Small shimmer block for loading shells. ✨
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "from-navy/7 via-gold/14 to-navy/7 dark:from-white/6 dark:via-gold/14 dark:to-white/6 animate-pulse rounded-md bg-linear-to-r",
        className,
      )}
    />
  );
}

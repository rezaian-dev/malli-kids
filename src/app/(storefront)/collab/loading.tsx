import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 🦴 Loosely mirrors `CollabLanding`'s two-column info cards + the form
 *  section below them. */
export default function CollabLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری همکاری با ما…"
      className="xs:px-4 container mx-auto w-full max-w-5xl space-y-9 px-3 py-8 sm:px-5 lg:px-7"
    >
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-4 rounded-[26px] border p-5",
              "border-navy/8 bg-white/94",
              "dark:border-gold/30 dark:bg-slate/60",
            )}
          >
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "space-y-3 rounded-[26px] border p-6 sm:p-8",
          "border-navy/8 bg-white/94",
          "dark:border-gold/30 dark:bg-slate/60",
        )}
      >
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-11 rounded-2xl" />
        <Skeleton className="h-11 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}

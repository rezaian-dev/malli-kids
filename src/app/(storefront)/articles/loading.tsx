import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 🦴 Mirrors the real hero + `ArticlesList` card shape instead of a
 *  generic spinner. */
export default function ArticlesLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری مجله…"
    >
      <div className="xs:px-4 container mx-auto w-full max-w-4xl px-3 py-8 sm:px-5 lg:px-7">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="xs:px-4 container mx-auto w-full max-w-4xl space-y-4 px-3 sm:px-5 lg:px-7">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-4 rounded-3xl border p-4 sm:p-6",
              "border-navy/10 bg-white",
              "dark:border-gold/30 dark:bg-dusk",
            )}
          >
            <Skeleton className="h-24 w-24 shrink-0 rounded-2xl sm:h-32 sm:w-40" />
            <div className="min-w-0 flex-1 space-y-2.5 py-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

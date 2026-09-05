import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 🦴 Loosely mirrors `ContactLanding`'s hero band + the info-card row
 *  below it. */
export default function ContactLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری تماس با ما…"
      className="xs:px-4 container mx-auto w-full max-w-5xl space-y-9 px-3 py-8 sm:px-5 lg:px-7"
    >
      <Skeleton className="h-56 w-full rounded-[28px]" />

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-[26px] border p-4",
              "border-navy/8 bg-white/94",
              "dark:border-gold/30 dark:bg-slate/60",
            )}
          >
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="h-64 w-full rounded-[26px]" />
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TAB_PILL = "h-10 w-24 rounded-xl";

/** 🦴 Mirrors `ProfileHeader` + `ProfileTabs` + one panel card — the same
 *  shape `ProfilePanelFallback` already uses once a panel itself is
 *  hydrating, so the route boundary and the in-page fallback agree. */
export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری حساب کاربری…"
      className="xs:px-4 container mx-auto w-full max-w-5xl min-w-0 px-3 pb-10 sm:px-5 lg:px-7"
    >
      <section
        aria-hidden
        className={cn(
          "overflow-hidden rounded-[28px]",
          "from-navy via-navy-mid to-navy-light bg-linear-to-br",
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-9">
          <Skeleton className="size-19 shrink-0 rounded-full opacity-60 sm:size-24" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-3 w-16 opacity-60" />
            <Skeleton className="h-6 w-40 opacity-70" />
            <Skeleton className="h-3 w-48 opacity-50" />
          </div>
          <Skeleton className="h-10 w-24 rounded-full opacity-60" />
        </div>
      </section>

      <div
        aria-hidden
        className={cn(
          "mt-6 flex flex-wrap gap-1.5 rounded-[18px] p-1.5",
          "bg-sand",
          "dark:bg-dusk-mid",
        )}
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className={TAB_PILL} />
        ))}
      </div>

      <section
        aria-hidden
        className={cn(
          "mt-5 space-y-5 rounded-3xl p-5 sm:p-7",
          "border border-navy/10 bg-white",
          "dark:border-gold/35 dark:bg-dusk",
        )}
      >
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
      </section>
    </div>
  );
}

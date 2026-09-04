import { SlidersHorizontal } from "lucide-react";
import { PER_PAGE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardGridSkeleton } from "@/components/product";
import { cn } from "@/lib/utils";

const FILTER_ICON_BADGE =
  "bg-navy text-gold dark:bg-gold dark:text-navy-deep grid size-10 place-items-center rounded-2xl";

/** 🦴 Server-rendered skeleton for the `/shop` route segment — Next's own
 *  `loading.tsx` boundary shows this the instant navigation starts, no
 *  client JS or spinner involved. Mirrors `ShopExplorer`'s real shell
 *  (breadcrumb, sidebar, toolbar, grid) at the same widths/paddings so
 *  nothing shifts once the actual products stream in; the grid always
 *  renders as the default `grid` view (searchParams aren't available here,
 *  and grid is the shop's default). */
export default function ShopLoading() {
  return (
    <div
      role="status"
      aria-label="در حال بارگذاری فروشگاه…"
      aria-live="polite"
      className="shop-page xs:px-4 mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-7"
    >
      <div className="mb-5 flex items-center gap-1.5" aria-hidden>
        <Skeleton className="h-3 w-8" />
        <span className="text-gold mx-1.5 text-xs">/</span>
        <Skeleton className="h-3 w-14" />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        {/* Desktop sidebar filter */}
        <aside
          aria-hidden
          className={cn(
            "sticky top-30 hidden overflow-hidden rounded-[28px] lg:flex lg:flex-col",
            "border-navy/10 bg-sand-deep/60 border",
            "dark:border-gold/40 dark:bg-filter-night",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 border-b px-4 py-4",
              "border-navy/8 bg-white/70",
              "dark:border-gold/20 dark:bg-navy-dark/60",
            )}
          >
            <span className={FILTER_ICON_BADGE}>
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <div className="space-y-6 px-4 py-5">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </aside>

        {/* Main results */}
        <section
          className={cn(
            "min-w-0 rounded-[28px] p-3 sm:p-5",
            "border-navy/10 border bg-white/85",
            "dark:border-gold/35 dark:bg-slate/45",
          )}
        >
          <div
            className={cn(
              "mb-4 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center",
              "border-navy/6",
              "dark:border-gold/15",
            )}
            aria-hidden
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-full lg:hidden" />
              <Skeleton className="hidden h-10 w-44 rounded-full lg:block" />
              <Skeleton className="h-10 w-18 rounded-full" />
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4"
            aria-hidden
          >
            {Array.from({ length: PER_PAGE }, (_, i) => (
              <ProductCardGridSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

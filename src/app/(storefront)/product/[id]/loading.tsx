import { Skeleton } from "@/components/ui/skeleton";
import { shell } from "@/lib/utils";
import { pdpCard, pdpWell } from "./_lib/product-chrome";

/** 🦴 Mirrors `ProductBuyPanel`'s real layout (gallery + title/price/size
 *  card) instead of a generic spinner — the PDP is content-heavy enough
 *  that a bare `Loader2` left the page blank far longer than it needed to. */
export default function ProductLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری محصول…"
      className={`${shell} py-4 sm:py-8`}
    >
      <Skeleton className="mb-4 h-9 rounded-2xl sm:mb-8" />

      <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:gap-8">
        <Skeleton className="aspect-square w-full rounded-[22px] sm:rounded-[28px] lg:rounded-4xl" />

        <div className={`${pdpCard} space-y-4 p-4 sm:p-7`}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />

          <div className={`${pdpWell} space-y-4 p-4 sm:p-5`}>
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="size-10 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

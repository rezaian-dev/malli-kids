import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 🦴 Loading placeholder for `ProductCardGrid` — same rounded-3xl shell,
 *  same `pt-[125%]` image aspect box, same content padding/rows as the real
 *  card, so the grid never shifts once products replace these. */
export function ProductCardGridSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border",
        "border-navy/10 bg-white/94",
        "dark:border-gold-soft/35 dark:bg-slate/60",
      )}
    >
      <div className="bg-sand relative w-full shrink-0 overflow-hidden pt-[125%] dark:bg-navy-mid/40">
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-3.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <div className="mt-auto flex items-center gap-1.5 pt-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      </div>
    </div>
  );
}

/** 🦴 Loading placeholder for `ProductCardList` — mirrors its horizontal
 *  image + content layout. */
export function ProductCardListSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        "flex min-w-0 flex-row overflow-hidden rounded-[20px] border",
        "border-navy/10 bg-white/94",
        "dark:border-gold-soft/35 dark:bg-slate/60",
      )}
    >
      <div className="bg-sand relative h-auto min-h-30 w-26 shrink-0 overflow-hidden dark:bg-navy-mid/40">
        <Skeleton className="absolute inset-0 size-full rounded-none" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto flex items-center gap-2 pt-1.5">
          <Skeleton className="h-4 w-16" />
          <div className="ms-auto flex gap-1.5">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="h-8 w-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

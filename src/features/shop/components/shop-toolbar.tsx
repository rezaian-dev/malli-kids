import { ArrowUpDown, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { shopHeading, type ShopState } from "@/features/shop/lib/shop-state";
import { ShopSortOptions } from "./shop-sort-options";

const SORT_TRIGGER_BASE = cn(
  "h-auto justify-between rounded-full text-xs font-black",
  "border-navy/12 bg-sand text-navy",
  "dark:border-gold/40 dark:bg-dusk-mid dark:text-linen",
);

/** 🧭 Heading + result count + filter/sort/view controls above the grid. */
export function ShopToolbar({
  state,
  resultCount,
  activeN,
  sortLabel,
  sortPopOpen,
  onSortPopOpenChange,
  onOpenMobileFilters,
  onOpenMobileSort,
  push,
}: {
  state: ShopState;
  resultCount: number;
  activeN: number;
  sortLabel: string;
  sortPopOpen: boolean;
  onSortPopOpenChange: (open: boolean) => void;
  onOpenMobileFilters: () => void;
  onOpenMobileSort: () => void;
  push: (next: Partial<ShopState>) => void;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center",
        "border-navy/6",
        "dark:border-gold/15",
      )}
    >
      <div>
        <h1 className="text-navy dark:text-ivory text-lg font-black sm:text-xl">
          {shopHeading(state)}
        </h1>
        <h2 className="text-navy/70 dark:text-wheat mt-1 text-xs font-normal">
          {toFaDigits(resultCount)} مدل در کالکشن
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="navy"
          className="h-10 px-4 lg:hidden"
          onClick={onOpenMobileFilters}
        >
          <SlidersHorizontal className="size-4" /> فیلتر
          {activeN ? (
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full text-[10px] font-black",
                "bg-gold text-navy-deep",
              )}
            >
              {toFaDigits(activeN)}
            </span>
          ) : null}
        </Button>

        {/* Desktop sort — Popover (non-modal → no scroll-lock, no layout shift) */}
        <div className="hidden lg:block">
          <Popover modal={false} open={sortPopOpen} onOpenChange={onSortPopOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  SORT_TRIGGER_BASE,
                  "hover:border-gold/50 aria-expanded:border-gold min-w-44 px-4 py-2.5",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="text-gold-soft size-4" /> {sortLabel}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className={cn(
                "w-72",
                "border-navy/12 bg-linen",
                "dark:border-gold/40 dark:bg-sort-sheet",
              )}
            >
              <p className="text-gold px-2 pt-1 pb-2 text-[11px] font-black tracking-[0.14em] uppercase">
                مرتب‌سازی
              </p>
              <ShopSortOptions
                value={state.sort}
                onValueChange={(sort) => {
                  push({ sort, page: 1 });
                  onSortPopOpenChange(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile sort — bottom Sheet */}
        <Button
          type="button"
          variant="outline"
          className={cn(
            SORT_TRIGGER_BASE,
            "xs:min-w-36 xs:flex-none min-w-0 flex-1 px-3 py-2.5 lg:hidden",
          )}
          onClick={onOpenMobileSort}
        >
          <span className="flex items-center gap-1.5 truncate">
            <ArrowUpDown className="text-gold-soft size-4" /> {sortLabel}
          </span>
        </Button>

        {/* View toggle */}
        <ToggleGroup
          type="single"
          value={state.view}
          onValueChange={(v) => v && push({ view: v as "grid" | "list" })}
          aria-label="نحوه نمایش"
          className={cn(
            "inline-flex rounded-full border p-0.5",
            "border-navy/10 bg-sand",
            "dark:border-gold/30 dark:bg-dusk-mid",
          )}
        >
          {(
            [
              ["grid", LayoutGrid, "نمای شبکه"],
              ["list", List, "نمای فهرست"],
            ] as const
          ).map(([v, Icon, label]) => (
            <ToggleGroupItem
              key={v}
              value={v}
              aria-label={label}
              className={cn(
                "text-navy/70 dark:text-wheat size-9 rounded-full border-0",
                "data-[state=on]:bg-navy data-[state=on]:text-ivory",
                "dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
              )}
            >
              <Icon className="size-4" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

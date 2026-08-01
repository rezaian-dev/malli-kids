"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/locale/fa";
import type { ShopState } from "@/lib/shop/shop-state";
import type { Product } from "@/types";
import { useShopExplorer } from "../_hooks/use-shop-explorer";
import { ShopFilters } from "./shop-filters";
import { ShopSortOptions } from "./shop-sort-options";
import { ShopToolbar } from "./shop-toolbar";
import { ShopResults } from "./shop-results";

const FILTER_ICON_BADGE =
  "bg-navy text-gold dark:bg-gold dark:text-navy-deep grid size-10 place-items-center rounded-2xl";
const CLEAR_FILTERS_BTN =
  "text-gold hover:bg-gold/10 h-8 rounded-full px-3 text-[11px] font-black";

export function ShopExplorer({
  state,
  products,
}: {
  state: ShopState;
  products: Product[];
}) {
  const shop = useShopExplorer(state, PER_PAGE, products);

  return (
    <div className="shop-page xs:px-4 mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-7">
      <nav
        aria-label="مسیر صفحه"
        className="text-navy/70 dark:text-wheat mb-5 text-xs font-bold"
      >
        <ol className="m-0 flex list-none flex-wrap items-center gap-0 p-0">
          <li>
            <Link href="/" prefetch={false} className="hover:text-gold py-1">
              خانه
            </Link>
          </li>
          <li aria-hidden className="text-gold mx-1.5">
            /
          </li>
          <li>
            {state.cat !== "همه" || state.season !== "همه" ? (
              <Link
                href="/shop"
                prefetch={false}
                className="hover:text-gold py-1"
              >
                فروشگاه
              </Link>
            ) : (
              <span>فروشگاه</span>
            )}
          </li>
          {state.cat !== "همه" ? (
            <>
              <li aria-hidden className="text-gold mx-1.5">
                /
              </li>
              <li>{state.cat}</li>
            </>
          ) : null}
          {state.season !== "همه" ? (
            <>
              <li aria-hidden className="text-gold mx-1.5">
                /
              </li>
              <li>{state.season}</li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
        {/* Desktop sidebar filter */}
        <aside
          aria-label="فیلتر محصولات"
          className={cn(
            "sticky top-30 hidden overflow-hidden rounded-[28px] shadow-[0_20px_44px_-28px_rgba(14,42,71,.4)] backdrop-blur-sm lg:flex lg:flex-col",
            "border-navy/10 bg-sand-deep/60 border",
            "dark:border-gold/40 dark:bg-filter-night",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-3 border-b px-4 py-4",
              "border-navy/8 bg-white/70",
              "dark:border-gold/20 dark:bg-navy-dark/60",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  FILTER_ICON_BADGE,
                  "shadow-[0_10px_22px_-12px_rgba(14,42,71,.7)]",
                )}
              >
                <SlidersHorizontal className="size-4" />
              </span>
              <div>
                <p className="text-navy dark:text-ivory text-sm font-black">
                  فیلتر محصولات
                </p>
                <p className="text-navy/70 dark:text-gold-soft mt-0.5 text-[10px] font-bold">
                  {shop.activeN
                    ? `${toFaDigits(shop.activeN)} مورد فعال`
                    : "بدون فیلتر"}
                </p>
              </div>
            </div>
            {shop.activeN ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={CLEAR_FILTERS_BTN}
                onClick={shop.reset}
              >
                پاک کردن
              </Button>
            ) : null}
          </div>
          <ShopFilters
            state={state}
            query={shop.query}
            onQueryChange={shop.setQuery}
            onCommitQuery={shop.commitQuery}
            range={shop.range}
            onRangeChange={shop.setRange}
            push={shop.push}
          />
        </aside>

        {/* Main results */}
        <section
          className={cn(
            "min-w-0 rounded-[28px] p-3 shadow-[0_22px_54px_-30px_rgba(14,42,71,.32)] backdrop-blur-sm sm:p-5",
            "border-navy/10 border bg-white/85",
            "dark:border-gold/35 dark:bg-slate/45 dark:text-ivory",
          )}
        >
          <ShopToolbar
            state={state}
            resultCount={shop.filtered.length}
            activeN={shop.activeN}
            sortLabel={shop.sortLabel}
            sortPopOpen={shop.sortPopOpen}
            onSortPopOpenChange={shop.setSortPopOpen}
            onOpenMobileFilters={() => shop.setFilterOpen(true)}
            onOpenMobileSort={() => shop.setSortOpen(true)}
            push={shop.push}
          />
          <ShopResults
            view={state.view}
            items={shop.slice}
            activeN={shop.activeN}
            onReset={shop.reset}
            page={shop.page}
            pages={shop.pages}
            onPageChange={(page) => shop.push({ page })}
          />
        </section>
      </div>

      {/* Mobile filter — right Sheet */}
      <Sheet open={shop.filterOpen} onOpenChange={shop.setFilterOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className={cn(
            "inset-y-0 right-0 flex h-dvh w-[min(88vw,360px)] max-w-90 flex-col gap-0 border-s p-0 sm:max-w-90",
            "border-navy/10 bg-sand-deep",
            "dark:border-gold/40 dark:bg-filter-night",
          )}
        >
          <SheetHeader className="gap-0 p-0">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className={FILTER_ICON_BADGE}>
                  <SlidersHorizontal className="size-4" />
                </span>
                <div className="text-right">
                  <SheetTitle className="text-navy dark:text-ivory text-sm font-black">
                    فیلتر کالکشن
                  </SheetTitle>
                  <SheetDescription className="text-navy/70 dark:text-gold-soft mt-0.5 text-[10px]">
                    {shop.activeN
                      ? `${toFaDigits(shop.activeN)} مورد فعال`
                      : "بدون فیلتر"}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {shop.activeN ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-gold h-8 rounded-full px-2 text-[11px] font-black"
                    onClick={shop.reset}
                  >
                    پاک کردن
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-full",
                    "bg-navy/5 text-navy",
                    "dark:bg-dusk-mid dark:text-ivory",
                  )}
                  onClick={() => shop.setFilterOpen(false)}
                  aria-label="بستن"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
          <Separator className="bg-navy/8 dark:bg-gold/20" />
          <ShopFilters
            state={state}
            query={shop.query}
            onQueryChange={shop.setQuery}
            onCommitQuery={shop.commitQuery}
            range={shop.range}
            onRangeChange={shop.setRange}
            push={shop.push}
            onCategoryPick={() => shop.setFilterOpen(false)}
          />
          <div className="border-navy/10 dark:border-gold/25 border-t p-3">
            <Button
              type="button"
              variant="navy"
              className="h-12 w-full font-black"
              onClick={() => shop.setFilterOpen(false)}
            >
              نمایش {toFaDigits(shop.filtered.length)} کالا
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile sort — bottom Sheet */}
      <Sheet open={shop.sortOpen} onOpenChange={shop.setSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className={cn(
            "mx-auto max-w-130 gap-0 rounded-t-[28px] border-t p-0",
            "border-gold/30 bg-linen",
            "dark:border-gold/40 dark:bg-sort-sheet",
          )}
        >
          <div
            className="bg-gold-light mx-auto mt-3 mb-1 h-1.25 w-11 rounded-full"
            aria-hidden
          />
          <SheetHeader className="gap-0 px-5 pt-1 pb-3">
            <SheetTitle className="text-navy dark:text-linen text-base font-black">
              مرتب‌سازی کالاها
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-5">
            <ShopSortOptions
              value={state.sort}
              onValueChange={(sort) => {
                shop.push({ sort, page: 1 });
                shop.setSortOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

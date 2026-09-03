"use client";

import type { ReactNode } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

export const FILTER_LABEL =
  "text-navy/50 dark:text-wheat/75 mb-1.5 block text-[10px] font-black";

type AdminFilterBarProps = {
  children?: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  resultCount: number;
  resultLabel?: string;
  activeCount?: number;
  onReset?: () => void;
  className?: string;
};

/** 🔎 The search box + reset button + filter-select slot that opens
 *  every admin list page. */
export function AdminFilterBar({
  children,
  search,
  onSearchChange,
  searchPlaceholder = "جستجو…",
  resultCount,
  resultLabel = "مورد",
  activeCount = 0,
  onReset,
  className,
}: AdminFilterBarProps) {
  const hasSearch = typeof search === "string" && !!onSearchChange;

  return (
    <section
      className={cn(
        "mb-5 rounded-[22px] max-[639px]:rounded-[19px]",
        "border-navy/9 bg-paper/94 border shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px]",
        "dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)]",
        className,
      )}
      aria-label="جستجو و فیلترها"
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-3.5 py-3 sm:px-4",
          "border-navy/8",
          "dark:border-gold/15",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl shadow-sm",
              "bg-navy text-gold",
              "dark:bg-gold/15 dark:text-gold-soft",
            )}
          >
            <SlidersHorizontal className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-navy dark:text-ivory text-xs font-black">
              فیلتر و مرتب‌سازی
            </h2>
            <p className="text-navy/45 dark:text-wheat/65 mt-0.5 text-[10px] font-bold">
              {toFaDigits(resultCount)} {resultLabel} پیدا شد
              {activeCount > 0
                ? ` · ${toFaDigits(activeCount)} فیلتر فعال`
                : ""}
            </p>
          </div>
        </div>

        {activeCount > 0 && onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className={cn(
              "h-8 rounded-xl px-2.5 text-[11px] font-black",
              "text-rose hover:bg-rose/10 hover:text-rose",
            )}
          >
            <RotateCcw className="size-3.5" /> پاک‌کردن فیلترها
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-2.5 p-3 sm:grid-cols-2 sm:p-4 xl:flex xl:flex-wrap xl:items-end">
        {hasSearch ? (
          <label className="min-w-0 sm:col-span-2 xl:min-w-64 xl:flex-1">
            <span className={FILTER_LABEL}>جستجو</span>
            <span className="dark:bg-navy-deep/45 relative block rounded-xl bg-white">
              <Search
                className={cn(
                  "pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2",
                  "text-gold",
                )}
              />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-xl bg-transparent ps-10 pe-10 shadow-none"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="پاک‌کردن جستجو"
                  className={cn(
                    "absolute inset-e-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg transition",
                    "text-navy/40 hover:bg-navy/7 hover:text-navy",
                    "dark:text-wheat/60 dark:hover:text-ivory dark:hover:bg-white/8",
                  )}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </span>
          </label>
        ) : null}
        {children}
      </div>
    </section>
  );
}

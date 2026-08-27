"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";
import { pageWindow } from "@/hooks/use-pagination";
import type { Paged } from "@/types";

type PaginationProps = {
  /** The object returned by usePagination. */
  pg: Paged<unknown>;
  /** Noun for the summary line ("نمایش ۱–۹ از ۲۴ مدل"). */
  unit?: string;
  siblings?: number;
  className?: string;
};

/**
 * Client-side pagination control. RTL-aware: in a `dir="rtl"` context "previous"
 * sits on the right and points right (ChevronRight), "next" points left.
 */
export function Pagination({ pg, unit = "مورد", siblings = 1, className }: PaginationProps) {
  const { page, pageCount, setPage: onPage, total, from, to } = pg;
  const hasSummary = total > 0;
  if (pageCount <= 1 && !hasSummary) return null;

  const tokens = pageWindow(page, pageCount, siblings);

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={cn("mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row", className)}
    >
      {hasSummary ? (
        <p className="text-xs font-bold text-navy/50 dark:text-wheat">
          نمایش {toFaDigits(from)}–{toFaDigits(to)} از {toFaDigits(total)} {unit}
        </p>
      ) : (
        <span />
      )}

      {pageCount > 1 ? (
        <ul className="flex items-center gap-1.5" data-slot="pagination">
          <li>
            <PageButton
              aria-label="صفحه قبل"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              <ChevronRight className="size-4" />
            </PageButton>
          </li>

          {tokens.map((t, i) =>
            t === "…" ? (
              <li key={`gap-${i}`} aria-hidden className="grid size-9 place-items-center text-navy/40 dark:text-wheat">
                <MoreHorizontal className="size-4" />
              </li>
            ) : (
              <li key={t}>
                <PageButton active={t === page} aria-current={t === page ? "page" : undefined} onClick={() => onPage(t)}>
                  {toFaDigits(t)}
                </PageButton>
              </li>
            ),
          )}

          <li>
            <PageButton
              aria-label="صفحه بعد"
              disabled={page >= pageCount}
              onClick={() => onPage(page + 1)}
            >
              <ChevronLeft className="size-4" />
            </PageButton>
          </li>
        </ul>
      ) : (
        <span />
      )}
    </nav>
  );
}

function PageButton({
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-9 select-none place-items-center rounded-xl border text-sm font-black transition",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold/50",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "border-transparent bg-navy text-ivory shadow-sm dark:bg-gold dark:text-navy-deep"
          : "border-navy/12 bg-white text-navy hover:border-gold/40 hover:text-gold-deep dark:border-gold/20 dark:bg-navy-mid/70 dark:text-ivory dark:hover:border-gold/50 dark:hover:text-gold-soft",
        className,
      )}
      {...props}
    />
  );
}

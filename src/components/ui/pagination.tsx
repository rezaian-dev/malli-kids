"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { pageWindow } from "@/hooks/use-pagination";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { Paged } from "@/types";

type PaginationProps = {
  pg: Paged<unknown>;

  unit?: string;

  siblings?: number;
  className?: string;
};

export function Pagination({
  pg,
  unit = "مورد",
  siblings = 1,
  className,
}: PaginationProps) {
  const { page, pageCount, setPage: onPage, total, from, to } = pg;
  const hasSummary = total > 0;
  if (pageCount <= 1 && !hasSummary) return null;

  const tokens = pageWindow(page, pageCount, siblings);

  return (
    <nav
      aria-label="صفحه‌بندی نتایج"
      className={cn(
        "mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border px-3 py-3 sm:flex-row sm:px-4",
        "admin-pagination border-navy/8 bg-white/55",
        "dark:border-gold/14 dark:bg-white/2.5",
        className,
      )}
    >
      {hasSummary ? (
        <p
          className="text-navy/70 dark:text-wheat text-[11px] font-bold"
          aria-live="polite"
        >
          نمایش {toFaDigits(from)} تا {toFaDigits(to)} از {toFaDigits(total)}{" "}
          {unit}
        </p>
      ) : (
        <span />
      )}

      {pageCount > 1 ? (
        <>
          {}
          <ul
            className="flex w-full items-center justify-center gap-2 sm:hidden"
            data-slot="pagination-mobile"
          >
            <li>
              <PageButton
                aria-label="صفحه قبل"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
              >
                <ChevronRight className="size-4" />
              </PageButton>
            </li>
            <li>
              <span
                className={cn(
                  "flex h-9 min-w-28 items-center justify-center rounded-xl border px-3",
                  "border-navy/10 text-navy bg-white text-[10px] font-black",
                  "dark:border-gold/18 dark:bg-navy-mid/70 dark:text-ivory",
                )}
              >
                صفحه {toFaDigits(page)} از {toFaDigits(pageCount)}
              </span>
            </li>
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

          {}
          <ul
            className="hidden items-center gap-1.5 sm:flex"
            data-slot="pagination-desktop"
          >
            <li>
              <PageButton
                aria-label="صفحه قبل"
                disabled={page <= 1}
                onClick={() => onPage(page - 1)}
              >
                <ChevronRight className="size-4" />
              </PageButton>
            </li>

            {tokens.map((token, index) =>
              token === "…" ? (
                <li
                  key={`gap-${index}`}
                  aria-hidden="true"
                  className="text-navy/70 dark:text-wheat/60 grid size-9 place-items-center"
                >
                  <MoreHorizontal className="size-4" />
                </li>
              ) : (
                <li key={token}>
                  <PageButton
                    active={token === page}
                    aria-label={`صفحه ${toFaDigits(token)}`}
                    aria-current={token === page ? "page" : undefined}
                    onClick={() => onPage(token)}
                  >
                    {toFaDigits(token)}
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
        </>
      ) : (
        <span className="text-navy/70 dark:text-wheat/45 text-[10px] font-bold">
          تنها صفحه
        </span>
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
        "grid size-9 place-items-center rounded-xl border",
        "text-xs font-black transition select-none",
        "focus-visible:ring-gold/50 focus-visible:ring-2 focus-visible:outline-hidden",
        "disabled:pointer-events-none disabled:opacity-35",
        active
          ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep border-transparent shadow-sm"
          : "border-navy/12 text-navy hover:border-gold/40 hover:text-gold-deep dark:border-gold/20 dark:bg-navy-mid/70 dark:text-ivory dark:hover:border-gold/50 dark:hover:text-gold-soft bg-white",
        className,
      )}
      {...props}
    />
  );
}

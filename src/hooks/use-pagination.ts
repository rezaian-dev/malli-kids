"use client";

import { useEffect, useState } from "react";
import type { Paged } from "@/types";

// 📄 Client-side pagination over an in-memory list; resetKey resets to page 1
// when the filter changes
export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey?: unknown,
): Paged<T> {
  const [page, setPageRaw] = useState(1);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // 🔁 Reset to page 1 whenever the filtered set identity changes.
  useEffect(() => {
    setPageRaw(1);
  }, [resetKey]);

  // 📏 Keep the page in range when the list shrinks.
  useEffect(() => {
    setPageRaw((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const current = Math.min(Math.max(1, page), pageCount);

  // 🍕 A handful of rows per render — memoizing isn't worth it
  const start = (current - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const setPage = (p: number) =>
    setPageRaw(Math.min(Math.max(1, p), pageCount));

  return {
    page: current,
    pageCount,
    pageItems,
    total,
    from: total === 0 ? 0 : (current - 1) * pageSize + 1,
    to: Math.min(current * pageSize, total),
    setPage,
    next: () => setPage(current + 1),
    prev: () => setPage(current - 1),
    canPrev: current > 1,
    canNext: current < pageCount,
  };
}

export function pageWindow(
  page: number,
  pageCount: number,
  siblings = 1,
): (number | "…")[] {
  const totalPages = Number.isFinite(pageCount)
    ? Math.max(1, Math.floor(pageCount))
    : 1;
  const currentPage = Number.isFinite(page)
    ? Math.min(totalPages, Math.max(1, Math.floor(page)))
    : 1;

  const neighborRange = Math.min(
    2,
    Math.max(0, Number.isFinite(siblings) ? Math.floor(siblings) : 1),
  );

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    const isFirst = i === 1;
    const isLast = i === totalPages;
    const isNearCurrent = Math.abs(i - currentPage) <= neighborRange;

    if (isFirst || isLast || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return pages;
}

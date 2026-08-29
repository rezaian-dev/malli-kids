"use client";

import { useEffect, useMemo, useState } from "react";
import type { Paged } from "@/types";

/**
 * Client-side pagination over an in-memory list.
 *
 * The admin data source is a local seeded store, so slicing in memory is the
 * correct scaling strategy here. When this moves to a real API, the same public
 * shape can be backed by server-side range queries without touching call sites.
 *
 * `resetKey` lets a page reset to the first page when its *filter* changes
 * (e.g. search text / active tab) — pass a primitive or a stable stringified key.
 */
export function usePagination<T>(items: T[], pageSize: number, resetKey?: unknown): Paged<T> {
  const [page, setPageRaw] = useState(1);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Reset to page 1 whenever the filtered set identity changes.
  useEffect(() => {
    setPageRaw(1);
  }, [resetKey]);

  // Keep the page in range when the list shrinks.
  useEffect(() => {
    setPageRaw((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const current = Math.min(Math.max(1, page), pageCount);

  const pageItems = useMemo(() => {
    const start = (current - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, current, pageSize]);

  const setPage = (p: number) => setPageRaw(Math.min(Math.max(1, p), pageCount));

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

/**
 * پنجرهٔ صفحه‌بندی با تعداد خروجی ثابت و مستقل از تعداد کل صفحات.
 * با مقدار پیش‌فرض، حتی برای یک میلیون صفحه حداکثر ۷ توکن برمی‌گرداند:
 * [1, "…", 499, 500, 501, "…", 1000]
 */
export function pageWindow(page: number, pageCount: number, siblings = 1): (number | "…")[] {
  const totalPages = Number.isFinite(pageCount) ? Math.max(1, Math.floor(pageCount)) : 1;
  const currentPage = Number.isFinite(page) ? Math.min(totalPages, Math.max(1, Math.floor(page))) : 1;
  // جلوگیری از تولید ناخواستهٔ صدها دکمه در صورت ارسال مقدار نامعتبر از مصرف‌کننده.
  const siblingCount = Number.isFinite(siblings) ? Math.min(2, Math.max(0, Math.floor(siblings))) : 1;
  const range = (start: number, end: number) => Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  const maxTokens = siblingCount * 2 + 5;

  if (totalPages <= maxTokens) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < totalPages - 2;
  const edgeWindow = 3 + siblingCount * 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeWindow), "…", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, "…", ...range(totalPages - edgeWindow + 1, totalPages)];
  }

  return [1, "…", ...range(leftSibling, rightSibling), "…", totalPages];
}

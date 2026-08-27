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
 * Compact page tokens with ellipses, e.g. [1, "…", 4, 5, 6, "…", 20].
 * `siblings` controls how many neighbours of the current page are shown.
 */
export function pageWindow(page: number, pageCount: number, siblings = 1): (number | "…")[] {
  if (pageCount <= 1) return [1];
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  // Show every page when the count is small enough to fit without ellipses.
  const slots = siblings * 2 + 5; // first + last + current + 2*siblings + 2 ellipses
  if (pageCount <= slots) return range(1, pageCount);

  const start = Math.max(2, page - siblings);
  const end = Math.min(pageCount - 1, page + siblings);
  const tokens: (number | "…")[] = [1];
  if (start > 2) tokens.push("…");
  tokens.push(...range(start, end));
  if (end < pageCount - 1) tokens.push("…");
  tokens.push(pageCount);
  return tokens;
}

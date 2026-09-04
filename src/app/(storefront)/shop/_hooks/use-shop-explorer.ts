"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_CAP, SORTS } from "@/lib/constants";
import { formatToman } from "@/lib/locale/fa";
import {
  filterShopProducts,
  toShopHref,
  type ShopState,
} from "@/lib/shop/shop-state";
import type { Product } from "@/types";

/** 🧠 All state, derived data, and URL-sync behind the shop page. */
export function useShopExplorer(
  state: ShopState,
  perPage: number,
  catalog: Product[],
) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPopOpen, setSortPopOpen] = useState(false);
  const [query, setQuery] = useState(state.q);
  const [range, setRange] = useState<[number, number]>([state.min, state.max]);

  const push = useCallback(
    (next: Partial<ShopState>) => {
      router.push(toShopHref({ ...state, ...next }), { scroll: false });
    },
    [router, state],
  );

  useEffect(() => {
    const href = toShopHref(state);
    const current = `${window.location.pathname}${window.location.search}`;
    if (href === current) return;

    const currentParams = new URLSearchParams(window.location.search);
    const nextParams = new URLSearchParams(href.split("?")[1] ?? "");
    const currentQuery =
      currentParams.get("query") ?? currentParams.get("q") ?? "";
    const nextQuery = nextParams.get("query") ?? "";
    const currentCat = currentParams.get("category") ?? "";
    const nextCat = nextParams.get("category") ?? "";

    if (currentQuery !== nextQuery || currentCat !== nextCat) {
      router.replace(href, { scroll: false });
    }
  }, [router, state]);

  useEffect(() => setRange([state.min, state.max]), [state.min, state.max]);

  // 🔎 Keep the search input synced with the URL.
  useEffect(() => setQuery(state.q), [state.q]);
  const typedQ = query.trim();

  const filtered = useMemo(() => {
    const list = filterShopProducts(catalog, state);
    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc")
      list.sort((a, b) => b.price - a.price);
    else if (state.sort === "rate") list.sort((a, b) => b.rate - a.rate);
    return list;
  }, [catalog, state]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(state.page, pages);
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const activeChips = [
    state.cat !== "همه" && {
      label: state.cat,
      clear: () => push({ cat: "همه", page: 1 }),
    },
    state.season !== "همه" && {
      label: state.season,
      clear: () => push({ season: "همه", page: 1 }),
    },
    !!state.q && {
      label: `«${state.q}»`,
      clear: () => push({ q: "", page: 1 }),
    },
    state.stock && {
      label: "فقط موجود",
      clear: () => push({ stock: false, page: 1 }),
    },
    state.disc && {
      label: "تخفیف‌دار",
      clear: () => push({ disc: false, page: 1 }),
    },
    state.hot && {
      label: "پرفروش",
      clear: () => push({ hot: false, page: 1 }),
    },
    state.onlyNew && {
      label: "جدید",
      clear: () => push({ onlyNew: false, page: 1 }),
    },
    (state.min > 0 || state.max !== PRICE_CAP) && {
      label: `${formatToman(state.min)} تا ${formatToman(state.max)}`,
      clear: () => push({ min: 0, max: PRICE_CAP, page: 1 }),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const activeN = activeChips.length;

  function commitQuery() {
    if (typedQ.length === 1) return;
    push({ q: typedQ, page: 1 });
    setFilterOpen(false);
  }

  useEffect(() => {
    if (typedQ.length === 1 || typedQ === state.q) return;
    const id = window.setTimeout(() => push({ q: typedQ, page: 1 }), 180);
    return () => window.clearTimeout(id);
  }, [typedQ, state.q, push]);

  function reset() {
    setQuery("");
    push({
      cat: "همه",
      season: "همه",
      q: "",
      stock: false,
      disc: false,
      hot: false,
      onlyNew: false,
      min: 0,
      max: PRICE_CAP,
      page: 1,
    });
  }

  const sortLabel = SORTS[state.sort] || "جدیدترین";

  return {
    filtered,
    slice,
    page,
    pages,
    activeChips,
    activeN,
    query,
    setQuery,
    range,
    setRange,
    push,
    reset,
    commitQuery,
    sortLabel,
    filterOpen,
    setFilterOpen,
    sortOpen,
    setSortOpen,
    sortPopOpen,
    setSortPopOpen,
  };
}

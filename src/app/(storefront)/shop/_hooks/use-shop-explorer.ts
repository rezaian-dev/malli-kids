"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_CAP, SORTS } from "@/lib/constants";
import {
  filterShopProducts,
  toShopHref,
  type ShopState,
} from "@/lib/shop/shop-state";
import type { Product } from "@/types";

function countActiveFilters(state: ShopState) {
  return [
    state.cat !== "همه",
    state.season !== "همه",
    !!state.q,
    state.stock,
    state.disc,
    state.hot,
    state.onlyNew,
    state.min > 0 || state.max !== PRICE_CAP,
  ].filter(Boolean).length;
}

function getFilteredProducts(catalog: Product[], state: ShopState) {
  const list = filterShopProducts(catalog, state);
  if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc")
    list.sort((a, b) => b.price - a.price);
  else if (state.sort === "rate") list.sort((a, b) => b.rate - a.rate);
  return list;
}

/** All state, derived data, and URL-sync behind the shop page. */
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
  const [mobileFilterState, setMobileFilterState] = useState<ShopState>(state);

  // Keep quick consecutive filter clicks from being built on a stale server state.
  const latestState = useRef(state);
  const pendingState = useRef<ShopState | null>(null);

  useEffect(() => {
    latestState.current = state;
    if (
      pendingState.current &&
      toShopHref(state) === toShopHref(pendingState.current)
    ) {
      pendingState.current = null;
    }
  }, [state]);

  const push = useCallback(
    (next: Partial<ShopState>) => {
      const base = pendingState.current ?? latestState.current;
      const target = { ...base, ...next };
      pendingState.current = target;
      router.push(toShopHref(target), { scroll: false });
    },
    [router],
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

  // Keep the search input synced with the URL.
  useEffect(() => setQuery(state.q), [state.q]);

  // Mobile filters are edited locally and committed once from the apply button.
  useEffect(() => {
    if (!filterOpen) setMobileFilterState(state);
  }, [filterOpen, state]);

  const typedQ = query.trim();
  const filtered = useMemo(
    () => getFilteredProducts(catalog, state),
    [catalog, state],
  );
  const mobileFiltered = useMemo(
    () =>
      getFilteredProducts(catalog, {
        ...mobileFilterState,
        q: mobileFilterState.q.trim(),
      }),
    [catalog, mobileFilterState],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(state.page, pages);
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const activeN = countActiveFilters(state);
  const mobileActiveN = countActiveFilters({
    ...mobileFilterState,
    q: mobileFilterState.q.trim(),
  });

  function commitQuery() {
    if (typedQ.length === 1) return;
    push({ q: typedQ, page: 1 });
    setFilterOpen(false);
  }

  useEffect(() => {
    if (typedQ.length === 1 || typedQ === state.q || filterOpen) return;
    const id = window.setTimeout(() => push({ q: typedQ, page: 1 }), 180);
    return () => window.clearTimeout(id);
  }, [typedQ, state.q, filterOpen, push]);

  const openMobileFilters = useCallback(() => {
    const base = pendingState.current ?? latestState.current;
    setMobileFilterState({
      ...base,
      q: query.trim(),
      min: range[0],
      max: range[1],
    });
    setFilterOpen(true);
  }, [query, range]);

  const updateMobileFilter = useCallback((next: Partial<ShopState>) => {
    setMobileFilterState((current) => ({ ...current, ...next }));
  }, []);

  const setMobileQuery = useCallback((value: string) => {
    setMobileFilterState((current) => ({ ...current, q: value }));
  }, []);

  const commitMobileQuery = useCallback(() => {
    setMobileFilterState((current) => ({
      ...current,
      q: current.q.trim(),
      page: 1,
    }));
  }, []);

  const setMobileRange = useCallback((nextRange: [number, number]) => {
    setMobileFilterState((current) => ({
      ...current,
      min: nextRange[0],
      max: nextRange[1],
      page: 1,
    }));
  }, []);

  const applyMobileFilters = useCallback(() => {
    const base = pendingState.current ?? latestState.current;
    const draft = mobileFilterState;
    const next: ShopState = {
      ...base,
      cat: draft.cat,
      season: draft.season,
      stock: draft.stock,
      disc: draft.disc,
      hot: draft.hot,
      onlyNew: draft.onlyNew,
      q: draft.q.trim(),
      min: draft.min,
      max: draft.max,
      page: 1,
    };

    setQuery(next.q);
    setRange([next.min, next.max]);
    setMobileFilterState(next);
    push(next);
    setFilterOpen(false);
  }, [mobileFilterState, push]);

  const reset = useCallback(() => {
    const base = pendingState.current ?? latestState.current;
    const next: ShopState = {
      ...base,
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
    };

    setQuery("");
    setRange([0, PRICE_CAP]);
    setMobileFilterState(next);
    push(next);
  }, [push]);

  const sortLabel = SORTS[state.sort] || "جدیدترین";

  return {
    filtered,
    slice,
    page,
    pages,
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
    openMobileFilters,
    mobileFilterState,
    mobileFilteredCount: mobileFiltered.length,
    mobileActiveN,
    updateMobileFilter,
    setMobileQuery,
    commitMobileQuery,
    setMobileRange,
    applyMobileFilters,
    sortOpen,
    setSortOpen,
    sortPopOpen,
    setSortPopOpen,
  };
}

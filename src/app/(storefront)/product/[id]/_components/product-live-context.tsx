"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/types";
import { findCatalogProduct } from "@/lib/admin-sync";

// 🧩 Tiny client bridge for admin-updated product data.
const LiveCtx = createContext<Product | null>(null);

export function ProductLiveProvider({
  product,
  requestedId,
  children,
}: {
  product: Product;
  requestedId?: number;
  children: ReactNode;
}) {
  const [p, setP] = useState(product);

  useEffect(() => {
    const id = requestedId ?? product.id;
    const live = findCatalogProduct(id);
    if (live) setP(live);
  }, [requestedId, product.id]);

  return <LiveCtx.Provider value={p}>{children}</LiveCtx.Provider>;
}

export function useLiveProduct(fallback: Product): Product;
export function useLiveProduct<T extends Pick<Product, "id">>(fallback: T): Product | T;
export function useLiveProduct(fallback: { id: number }) {
  const live = useContext(LiveCtx);
  return live && live.id === fallback.id ? live : fallback;
}

export function LiveName({ product }: { product: Product }) {
  return <>{useLiveProduct(product).name}</>;
}

export function LiveDesc({ product }: { product: Product }) {
  return <p>{useLiveProduct(product).desc}</p>;
}

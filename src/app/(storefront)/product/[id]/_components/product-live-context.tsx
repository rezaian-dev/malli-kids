"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/types";
import { ProductReadMore } from "./product-read-more";

// 🧩 Tiny context so deeply-nested product components (review/checkout
// dialogs mounted lazily, etc.) don't need `product` threaded through every
// prop list. `product` itself is already the real, server-fetched truth
// (see `page.tsx`'s `getProductById()`) — no client-side resync needed.
const LiveCtx = createContext<Product | null>(null);

export function ProductLiveProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  return <LiveCtx.Provider value={product}>{children}</LiveCtx.Provider>;
}

export function useLiveProduct(fallback: Product): Product;
export function useLiveProduct<T extends Pick<Product, "id">>(
  fallback: T,
): Product | T;
export function useLiveProduct(fallback: { id: number }) {
  const live = useContext(LiveCtx);
  return live && live.id === fallback.id ? live : fallback;
}

export function LiveName({ product }: { product: Product }) {
  return <>{useLiveProduct(product).name}</>;
}

export function LiveDesc({ product }: { product: Product }) {
  return (
    <ProductReadMore
      text={useLiveProduct(product).desc}
      lines={4}
      className="leading-8"
    />
  );
}

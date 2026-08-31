"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/types";
import { findCatalogProduct } from "@/lib/admin-sync";

/**
 * «محصولِ زنده» — کوچک‌ترین جزیرهٔ client ممکن برای صفحهٔ محصول.
 *
 * کاتالوگِ ویرایش‌شدهٔ ادمین در localStorage است، پس فقط همین Provider بعد از
 * mount نسخهٔ زنده را می‌خوانَد. کلِ فرزندان (نان‌بردکرامب، تب‌ها، جدول سایز و
 * کارت‌های مشابه) به‌صورت اسلاتِ Server Component تزریق می‌شوند و هرگز وارد
 * باندلِ مرورگر نمی‌شوند؛ فقط برگ‌هایی که واقعاً به دادهٔ زنده نیاز دارند
 * (<LiveName/>، <LiveDesc/>، Buy و فرم/فهرست نظرها) این context را مصرف می‌کنند.
 */
const LiveCtx = createContext<Product | null>(null);

export function LiveProduct({
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

/** نسخهٔ زندهٔ محصول؛ اگر خارج از Provider استفاده شود همان دانهٔ سرور برمی‌گردد. */
export function useLiveProduct(fallback: Product): Product;
export function useLiveProduct<T extends Pick<Product, "id">>(fallback: T): Product | T;
export function useLiveProduct(fallback: { id: number }) {
  const live = useContext(LiveCtx);
  return live && live.id === fallback.id ? live : fallback;
}

/** نامِ زندهٔ محصول (نان‌بردکرامب) — یک برگِ متنیِ چند بایتی. */
export function LiveName({ product }: { product: Product }) {
  return <>{useLiveProduct(product).name}</>;
}

/** معرفیِ زندهٔ محصول داخل تبِ «معرفی». */
export function LiveDesc({ product }: { product: Product }) {
  return <p>{useLiveProduct(product).desc}</p>;
}

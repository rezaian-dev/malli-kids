"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { findCatalogProduct } from "@/lib/admin-sync";
import { Card } from "@/features/product";
import { Buy } from "./buy";
import { ProductTabs } from "./tabs";
import { shell } from "@/lib/utils";

/**
 * نمایِ صفحهٔ محصول — کلاینت است تا نسخهٔ زندهٔ کاتالوگ (ویرایش/افزودنِ
 * ادمین روی localStorage) بر دانهٔ استاتیک اولویت بگیرد.
 */
export function View({ product, requestedId }: { product: Product; requestedId?: number }) {
  const [p, setP] = useState(product);

  useEffect(() => {
    const id = requestedId ?? product.id;
    const live = findCatalogProduct(id);
    if (live) setP(live);
  }, [requestedId, product.id]);

  const related = CORE_PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat).slice(0, 4);

  return (
    <div>
      <div className={shell}>
        <p className="mb-8 text-xs font-bold text-navy/45 dark:text-wheat">
          <Link href="/" className="inline-block py-1.5 hover:text-gold">خانه</Link>
          <span className="mx-1.5 text-gold">/</span>
          <Link href="/shop" className="inline-block py-1.5 hover:text-gold">فروشگاه</Link>
          <span className="mx-1.5 text-gold">/</span>
          {p.name}
        </p>
        <Buy product={p} />
        <ProductTabs product={p} />
        {related.length ? (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-black text-navy dark:text-ivory">مدل‌های مشابه</h2>
            <div className="grid-products">
              {related.map((x) => (
                <Card key={x.id} p={x} view="grid" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

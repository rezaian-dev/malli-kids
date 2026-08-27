import Link from "next/link";
import type { Product } from "@/types";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Card } from "@/components/product/product-card";
import { Buy } from "./buy";
import { Tabs } from "./tabs";
import { shell } from "@/lib/utils";

export function View({ product }: { product: Product }) {
  const related = CORE_PRODUCTS.filter((p) => p.id !== product.id && p.cat === product.cat).slice(0, 4);

  return (
    <div>
      <div className={shell}>
        <p className="mb-8 text-xs font-bold text-navy/45 dark:text-wheat">
          <Link href="/" className="hover:text-gold">خانه</Link>
          <span className="mx-1.5 text-gold">/</span>
          <Link href="/shop" className="hover:text-gold">فروشگاه</Link>
          <span className="mx-1.5 text-gold">/</span>
          {product.name}
        </p>
        <Buy product={product} />
        <Tabs product={product} />
        {related.length ? (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-black text-navy dark:text-ivory">مدل‌های مشابه</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <Card key={p.id} p={p} view="grid" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

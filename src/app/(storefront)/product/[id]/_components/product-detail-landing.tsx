import Link from "next/link";
import { Suspense } from "react";

import { JsonLd } from "@/components/shared/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { breadcrumbSchema, productSchema } from "@/lib/seo";
import { cn, shell } from "@/lib/utils";
import { wash } from "@/components/shared/section-wash";
import type { Product } from "@/types";
import { ProductBuyPanel } from "./product-buy-panel";
import { ProductDetailsMount } from "./product-details-mount";
import { LiveName, ProductLiveProvider } from "./product-live-context";
import { ProductRelated } from "./product-related";
import { pdpCard } from "../_lib/product-chrome";

const CRUMB_LINK = "hover:text-gold inline-block py-1.5";

function RelatedFallback() {
  return (
    <section className={`${pdpCard} mt-8 p-4 sm:mt-12 sm:p-7`} aria-hidden>
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-3/4 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailLanding({
  product,
  canonicalPath,
}: {
  product: Product;
  canonicalPath: string;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: "/" },
          { name: "فروشگاه", path: "/shop" },
          { name: product.name, path: canonicalPath },
        ])}
      />
      <JsonLd data={productSchema(product)} />
      <ProductLiveProvider product={product}>
        <div className={`${wash.silk} pb-2`}>
          <div className={shell}>
            <nav
              aria-label="مسیر محصول"
              className={`${pdpCard} mb-4 px-3 py-1.5 sm:mb-8 sm:px-5`}
            >
              <ol
                className={cn(
                  "flex flex-wrap items-center gap-1.5 text-xs font-bold",
                  "text-navy/70",
                  "dark:text-wheat",
                )}
              >
                <li>
                  <Link href="/" className={CRUMB_LINK}>
                    خانه
                  </Link>
                </li>
                <li aria-hidden className="text-gold">
                  /
                </li>
                <li>
                  <Link href="/shop" className={CRUMB_LINK}>
                    فروشگاه
                  </Link>
                </li>
                <li aria-hidden className="text-gold">
                  /
                </li>
                <li className="text-navy/70 dark:text-ivory/80">
                  <LiveName product={product} />
                </li>
              </ol>
            </nav>

            <ProductBuyPanel product={product} />
            <ProductDetailsMount product={product} />

            <Suspense fallback={<RelatedFallback />}>
              <ProductRelated cat={product.cat} excludeId={product.id} />
            </Suspense>
          </div>
        </div>
      </ProductLiveProvider>
    </>
  );
}

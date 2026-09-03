import Link from "next/link";

import { ProductCard } from "@/components/product";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbSchema, productSchema } from "@/lib/seo";
import { cn, shell } from "@/lib/utils";
import { wash } from "@/components/home/section-wash";
import type { Product } from "@/types";
import { ProductBuyPanel } from "./product-buy-panel";
import { ProductDetailsMount } from "./product-details-mount";
import { LiveName, ProductLiveProvider } from "./product-live-context";
import { pdpCard, pdpKicker } from "./product-chrome";

const CRUMB_LINK = "hover:text-gold inline-block py-1.5";

export function ProductDetailLanding({
  product,
  requestedId,
  canonicalPath,
  related,
}: {
  product: Product;
  requestedId: number | undefined;
  canonicalPath: string;
  related: Product[];
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
      <ProductLiveProvider product={product} requestedId={requestedId}>
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

            {related.length ? (
              <section
                className={`${pdpCard} cv-auto mt-8 p-4 sm:mt-12 sm:p-7`}
                aria-labelledby="related-products-heading"
              >
                <p className={pdpKicker}>COMPLETE THE LOOK</p>
                <h2
                  id="related-products-heading"
                  className={cn(
                    "mt-1 mb-4 text-lg font-black sm:mb-6 sm:text-xl",
                    "text-navy",
                    "dark:text-ivory",
                  )}
                >
                  مدل‌های مشابه
                </h2>
                <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4">
                  {related.map((item) => (
                    <ProductCard key={item.id} p={item} view="grid" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </ProductLiveProvider>
    </>
  );
}

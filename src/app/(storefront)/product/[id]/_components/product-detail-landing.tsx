import { Suspense } from "react";

import { PRODUCT_GRID } from "@/components/product/card-styles";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/auth/session";
import { productSchema } from "@/lib/seo";
import { getVisibleReviewsForProduct, hasPurchased } from "@/lib/shop/reviews";
import { getSubscribedSizes } from "@/lib/shop/back-in-stock";
import { shell } from "@/lib/utils";
import { wash } from "@/components/shared/section-wash";
import type { Product } from "@/types";
import { ProductBuyPanel } from "./product-buy-panel";
import { ProductDetailsMount } from "./product-details-mount";
import { ProductCompleteLook } from "./product-complete-look";
import { ProductRelated } from "./product-related";
import { pdpCard } from "../_lib/product-chrome";

function RelatedFallback() {
  return (
    <section className={`${pdpCard} mt-8 p-4 sm:mt-12 sm:p-7`} aria-hidden>
      <Skeleton className="mb-6 h-5 w-40" />
      <div className={PRODUCT_GRID}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-3/4 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export async function ProductDetailLanding({
  product,
  canonicalPath,
}: {
  product: Product;
  canonicalPath: string;
}) {
  const [reviews, session] = await Promise.all([
    getVisibleReviewsForProduct(product.name),
    getSession(),
  ]);
  // 🧵 Independent per-user reads — parallelized instead of chained now that
  // neither depends on the other's result.
  const [canReview, subscribedSizes] = session?.user
    ? await Promise.all([
        hasPurchased(session.user.id, product.id),
        getSubscribedSizes(session.user.id, product.id),
      ])
    : [false, []];

  return (
    <>
      <JsonLd data={productSchema(product, reviews)} />
      <div className={`${wash.silk} pb-2`}>
        <div className={shell}>
          <Breadcrumb
            items={[
              { name: "خانه", path: "/" },
              { name: "فروشگاه", path: "/shop" },
              { name: product.name, path: canonicalPath },
            ]}
            className="mb-4 sm:mb-8"
          />

          <ProductBuyPanel
            product={product}
            subscribedSizes={subscribedSizes}
          />
          <ProductDetailsMount
            product={product}
            reviews={reviews}
            canReview={canReview}
          />

          {product.pairsWith?.length ? (
            <Suspense fallback={<RelatedFallback />}>
              <ProductCompleteLook pairsWith={product.pairsWith} />
            </Suspense>
          ) : null}

          <Suspense fallback={<RelatedFallback />}>
            <ProductRelated cat={product.cat} excludeId={product.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

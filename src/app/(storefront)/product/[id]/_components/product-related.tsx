import { ProductCard } from "@/components/product";
import { PRODUCT_GRID } from "@/components/product/card-styles";
import { cn } from "@/lib/utils";
import { getRelatedProducts } from "@/lib/shop/products";
import { pdpCard, pdpKicker } from "../_lib/product-chrome";

// 🧵 Own async Server Component so its `getRelatedProducts` fetch can be
// wrapped in `<Suspense>` by the caller — the main product panel streams in
// immediately instead of waiting on this (below-the-fold, non-critical)
// second database round trip.
export async function ProductRelated({
  cat,
  excludeId,
}: {
  cat: string;
  excludeId: number;
}) {
  const related = await getRelatedProducts(cat, excludeId);
  if (!related.length) return null;

  return (
    <section
      className={`${pdpCard} cv-auto mt-8 p-4 sm:mt-12 sm:p-7`}
      aria-labelledby="related-products-heading"
    >
      <p className={pdpKicker}>MORE LIKE THIS</p>
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
      <div className={PRODUCT_GRID}>
        {related.map((item) => (
          <ProductCard key={item.id} p={item} view="grid" />
        ))}
      </div>
    </section>
  );
}

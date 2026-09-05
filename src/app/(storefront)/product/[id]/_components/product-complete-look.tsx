import { ProductCard } from "@/components/product";
import { PRODUCT_GRID } from "@/components/product/card-styles";
import { cn } from "@/lib/utils";
import { getCompleteTheLook } from "@/lib/shop/products";
import { pdpCard, pdpKicker } from "../_lib/product-chrome";

// 🧵 Admin-curated outfit (vs ProductRelated's same-category picks);
// own Suspense-streamed fetch
export async function ProductCompleteLook({
  pairsWith,
}: {
  pairsWith: number[];
}) {
  const items = await getCompleteTheLook(pairsWith);
  if (!items.length) return null;

  return (
    <section
      className={cn(pdpCard, "cv-auto mt-8 p-4 sm:mt-12 sm:p-7")}
      aria-labelledby="complete-look-heading"
    >
      <p className={pdpKicker}>COMPLETE THE LOOK</p>
      <h2
        id="complete-look-heading"
        className="mt-1 mb-4 text-lg font-black sm:mb-6 sm:text-xl text-navy dark:text-ivory"
      >
        ست را کامل کنید
      </h2>
      <div className={PRODUCT_GRID}>
        {items.map((item) => (
          <ProductCard key={item.id} p={item} view="grid" />
        ))}
      </div>
    </section>
  );
}

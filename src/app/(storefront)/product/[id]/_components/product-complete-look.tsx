import { ProductCard } from "@/components/product";
import { cn } from "@/lib/utils";
import { getCompleteTheLook } from "@/lib/shop/products";
import { pdpCard, pdpKicker } from "../_lib/product-chrome";

// 🧵 The *real* "complete the look" — an admin-curated outfit (dress +
// cardigan + shoes, say), not just "more stuff in the same category" (that's
// `ProductRelated`, a separate section below this one). Own async Server
// Component so its own DB round trip can stream in independently, same
// pattern as `ProductRelated`.
export async function ProductCompleteLook({
  pairsWith,
}: {
  pairsWith: number[];
}) {
  const items = await getCompleteTheLook(pairsWith);
  if (!items.length) return null;

  return (
    <section
      className={`${pdpCard} cv-auto mt-8 p-4 sm:mt-12 sm:p-7`}
      aria-labelledby="complete-look-heading"
    >
      <p className={pdpKicker}>COMPLETE THE LOOK</p>
      <h2
        id="complete-look-heading"
        className={cn(
          "mt-1 mb-4 text-lg font-black sm:mb-6 sm:text-xl",
          "text-navy",
          "dark:text-ivory",
        )}
      >
        ست را کامل کنید
      </h2>
      <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} p={item} view="grid" />
        ))}
      </div>
    </section>
  );
}

import { ProductCard } from "@/components/product";
import { PRODUCT_GRID } from "@/components/product/card-styles";
import { wash } from "@/components/shared/section-wash";
import { getAllProducts } from "@/lib/shop/products";
import { cn } from "@/lib/utils";
import { OrnStar } from "../home-ornaments";
import type { Product } from "@/types";

const MAX_SETS = 4;

// 🧵 A girl↔boy pairsWith link, same admin-curated relation as "Complete the Look"; stored on either side.
function isPaired(a: Product, b: Product) {
  return Boolean(a.pairsWith?.includes(b.id) || b.pairsWith?.includes(a.id));
}

function findSiblingSets(catalog: Product[]): Product[][] {
  const girls = catalog.filter((p) => p.cat === "دخترانه");
  const boys = catalog.filter((p) => p.cat === "پسرانه");
  const used = new Set<number>();
  const sets: Product[][] = [];

  for (const girl of girls) {
    if (used.has(girl.id)) continue;
    const boy = boys.find((b) => !used.has(b.id) && isPaired(girl, b));
    if (!boy) continue;
    used.add(girl.id).add(boy.id);
    sets.push([girl, boy]);
    if (sets.length >= MAX_SETS) break;
  }

  return sets;
}

// 🪶 Pure Server Component — no tabs, no client state; the catalog's own
// curation is the only "filter" this section needs.
export async function SiblingSets() {
  const catalog = (await getAllProducts()).filter((p) => p.visible);
  const sets = findSiblingSets(catalog);
  if (!sets.length) return null;

  return (
    <section
      id="sibling-sets"
      className={cn(wash.silk, "cv-auto py-12 sm:py-16 lg:py-20")}
    >
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 sm:mb-12">
          <span className="text-gold text-sm font-bold tracking-wide">
            هارمونیِ خواهر و برادر
          </span>
          <h2
            className="mt-2 text-navy text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black dark:text-ivory"
          >
            ست{" "}
            <span className="text-gold relative inline-block">
              خواهر برادری
              <OrnStar className="absolute -top-3 -left-4 h-4 w-4" />
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {sets.map((set) => (
            <div
              key={set.map((p) => p.id).join("-")}
              role="group"
              aria-label="ست خواهر برادری"
              className="rounded-3xl border border-navy/10 bg-white/60 p-3 sm:p-4 dark:border-gold/15 dark:bg-dusk-alt/40"
            >
              <div className={PRODUCT_GRID}>
                {set.map((p) => (
                  <ProductCard key={p.id} p={p} view="grid" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

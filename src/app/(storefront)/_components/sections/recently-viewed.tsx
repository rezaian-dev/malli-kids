import { cookies } from "next/headers";
import { ProductCard } from "@/components/product";
import { PRODUCT_GRID } from "@/components/product/card-styles";
import { wash } from "@/components/shared/section-wash";
import { getProductsByIds } from "@/lib/shop/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

// 👀 Reads the mk_recent cookie (see src/proxy.ts). Renders nothing until
// there's history — an empty personalization shelf is noise, not a state
const COOKIE_NAME = "mk_recent";
const MAX_SHOWN = 8;

function parseRecentIds(raw: string | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

export async function RecentlyViewed() {
  const jar = await cookies();
  const ids = parseRecentIds(jar.get(COOKIE_NAME)?.value).slice(0, MAX_SHOWN);
  if (!ids.length) return null;

  const products = await getProductsByIds(ids);
  const byId = new Map(products.map((p) => [p.id, p]));
  // 🔢 $in loses order — reorder to the cookie's recent-first, drop hidden
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p?.visible));
  if (!ordered.length) return null;

  return (
    <section className={cn(wash.silk, "cv-auto py-10 sm:py-14")}>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-6 sm:mb-8">
          <span className="text-gold text-sm font-bold tracking-wide">
            دیدید ولی هنوز نخریدید؟
          </span>
          <h2
            className="mt-2 text-navy text-[clamp(1.35rem,4.5vw,2rem)] leading-snug font-black dark:text-ivory"
          >
            بازدیدهای اخیر شما
          </h2>
        </div>
        <div className={PRODUCT_GRID}>
          {ordered.map((p) => (
            <ProductCard key={p.id} p={p} view="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}

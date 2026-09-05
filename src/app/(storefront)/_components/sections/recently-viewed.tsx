import { cookies } from "next/headers";
import { ProductCard } from "@/components/product";
import { wash } from "@/components/shared/section-wash";
import { getProductsByIds } from "@/lib/shop/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

// 👀 Reads the device-scoped `mk_recent` cookie written by `src/proxy.ts` on
// every real product-page view — see that file for why it's a cookie and
// not a DB collection. Renders nothing (no skeleton, no "nothing here yet"
// placeholder) until there's real history; that's a deliberate choice, not
// a missed empty state — an empty personalization shelf on a first visit is
// noise, not a feature.
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
  // 🔢 `getProductsByIds`'s `$in` query doesn't preserve order — reorder to
  // the cookie's most-recent-first order, and drop anything since made
  // invisible/deleted.
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p?.visible));
  if (!ordered.length) return null;

  return (
    <section className={`${wash.silk} cv-auto py-10 sm:py-14`}>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-6 sm:mb-8">
          <span className="text-gold text-sm font-bold tracking-wide">
            دیدید ولی هنوز نخریدید؟
          </span>
          <h2
            className={cn(
              "mt-2",
              "text-navy text-[clamp(1.35rem,4.5vw,2rem)] leading-snug font-black",
              "dark:text-ivory",
            )}
          >
            بازدیدهای اخیر شما
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4">
          {ordered.map((p) => (
            <ProductCard key={p.id} p={p} view="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}

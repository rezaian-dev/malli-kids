import Link from "next/link";
import { Search } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { toFaDigits } from "@/lib/locale/fa";
import { ProductCard } from "@/components/product";
import { PRODUCT_GRID } from "@/components/product/card-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toShopHref, type ShopState } from "@/lib/shop/shop-state";
import type { Product } from "@/types";

/** 🛍️ Product grid/list, empty state, and pagination. */
export function ShopResults({
  view,
  items,
  activeN,
  onReset,
  state,
  page,
  pages,
}: {
  view: "grid" | "list";
  items: Product[];
  activeN: number;
  onReset: () => void;
  // 🔗 Needed to build each page's real `href` (`toShopHref`) — pagination
  // must render as crawlable `<a>` links, not JS-only click handlers, or
  // Googlebot has no way to discover page 2+ at all (see the JavaScript SEO
  // guidance on link discovery: only `<a href>` is followed).
  state: ShopState;
  page: number;
  pages: number;
}) {
  return (
    <>
      <h2 className="sr-only">نتایج فروشگاه</h2>
      {/* 🎬 با تعویضِ فیلتر/صفحه، کارت‌های خارج‌شده با محو+کوچک‌شدن بیرون
          می‌روند و بقیه با `layout` نرم در جای خالی می‌نشینند — نه یک
          رفرشِ خشکِ گرید. */}
      <div className={view === "list" ? "flex flex-col gap-4" : PRODUCT_GRID}>
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((p, index) => (
            <ProductCard
              key={p.id}
              p={p}
              view={view}
              aboveFold={index < (view === "list" ? 2 : 4)}
            />
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center py-16 text-center">
          <span
            className={cn(
              "mb-4 grid size-16 place-items-center rounded-full",
              "bg-sand text-gold",
              "dark:bg-navy-mid",
            )}
          >
            <Search className="size-7" />
          </span>
          <p className="text-navy/70 dark:text-wheat font-black">
            با این پالایش کالایی پیدا نشد.
          </p>
          {activeN ? (
            <Button
              type="button"
              variant="navy"
              className="mt-4 px-5"
              onClick={onReset}
            >
              پاک کردن فیلتر و جستجو
            </Button>
          ) : null}
        </div>
      ) : null}

      {pages > 1 ? (
        <nav
          className="mt-7 flex flex-wrap justify-center gap-1.5"
          aria-label="صفحه‌بندی"
        >
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              asChild
              variant={n === page ? "default" : "outline"}
              className={cn(
                "h-11 min-w-11 rounded-full px-3 text-sm font-black",
                n === page
                  ? "bg-navy text-ivory hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
                  : "border-navy/10 text-navy hover:border-gold/50 dark:border-gold/30 dark:bg-slate dark:text-ivory bg-white",
              )}
            >
              <Link
                href={toShopHref({ ...state, page: n })}
                scroll={false}
                prefetch={false}
                aria-current={n === page ? "page" : undefined}
              >
                {toFaDigits(n)}
              </Link>
            </Button>
          ))}
        </nav>
      ) : null}
    </>
  );
}

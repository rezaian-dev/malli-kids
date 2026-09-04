import { Search } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** 🛍️ Product grid/list, empty state, and pagination. */
export function ShopResults({
  view,
  items,
  activeN,
  onReset,
  page,
  pages,
  onPageChange,
}: {
  view: "grid" | "list";
  items: Product[];
  activeN: number;
  onReset: () => void;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      <h2 className="sr-only">نتایج فروشگاه</h2>
      <div
        className={
          view === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-2 gap-3 min-[480px]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] sm:gap-4"
        }
      >
        {items.map((p, index) => (
          <ProductCard
            key={p.id}
            p={p}
            view={view}
            aboveFold={index < (view === "list" ? 2 : 4)}
          />
        ))}
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
              type="button"
              variant={n === page ? "default" : "outline"}
              onClick={() => onPageChange(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "h-11 min-w-11 rounded-full px-3 text-sm font-black",
                n === page
                  ? "bg-navy text-ivory hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
                  : "border-navy/10 text-navy hover:border-gold/50 dark:border-gold/30 dark:bg-slate dark:text-ivory bg-white",
              )}
            >
              {toFaDigits(n)}
            </Button>
          ))}
        </nav>
      ) : null}
    </>
  );
}

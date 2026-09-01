"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product";
import { CATALOG } from "@/lib/data/products";
import { useFavorites } from "@/lib/favorites";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PROFILE_CARD } from "./profile-shared";

// 💛 Wishlist panel loads only when the user opens it.
export function ProfileWishlistPanel() {
  const favs = useFavorites();
  const products = CATALOG.filter((product) => favs.includes(product.id));

  return (
    <section className={PROFILE_CARD}>
      <div>
        <h2
          className={cn(
            "flex items-center gap-2 text-lg font-black",
            "text-navy",
            "dark:text-linen",
          )}
        >
          <Heart className="fill-rose text-rose size-5" /> علاقه‌مندی‌های من
        </h2>
        <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6">
          {toFaDigits(products.length)} محصول نشان کرده‌اید؛ هر وقت خواستید
          سراغ‌شان برگردید.
        </p>
      </div>

      {products.length === 0 ? (
        <div
          className={cn(
            "rounded-2xl border border-dashed px-6 py-10 text-center",
            "border-navy/15",
            "dark:border-gold/25",
          )}
        >
          <Heart className="text-rose/70 mx-auto size-9" />
          <p className="text-navy dark:text-ivory mt-3 font-black">
            هنوز قلبی نزده‌اید
          </p>
          <p
            className={cn(
              "mx-auto mt-1 max-w-xs text-xs leading-6",
              "text-navy/70",
              "dark:text-wheat",
            )}
          >
            روی قلب هر محصول بزنید تا این‌جا برایتان نگه داشته شود.
          </p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop" prefetch={false}>
              گشتن در کالکشن
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} p={product} view="grid" />
          ))}
        </div>
      )}
    </section>
  );
}

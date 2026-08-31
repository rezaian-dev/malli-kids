"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product";
import { CATALOG } from "@/lib/data/products";
import { useFavorites } from "@/lib/favorites";
import { toFaDigits } from "@/lib/format";
import { PROFILE_CARD } from "./profile-shared";

// 💛 Wishlist panel loads only when the user opens it.
export function ProfileWishlistPanel() {
  const favs = useFavorites();
  const products = CATALOG.filter((product) => favs.includes(product.id));

  return (
    <section className={PROFILE_CARD}>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-black text-navy dark:text-linen">
          <Heart className="size-5 fill-rose text-rose" /> علاقه‌مندی‌های من
        </h2>
        <p className="mt-1 text-xs leading-6 text-navy/50 dark:text-wheat">
          {toFaDigits(products.length)} محصول نشان کرده‌اید؛ هر وقت خواستید سراغ‌شان برگردید.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center dark:border-gold/25">
          <Heart className="mx-auto size-9 text-rose/70" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز قلبی نزده‌اید</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">
            روی قلب هر محصول بزنید تا این‌جا برایتان نگه داشته شود.
          </p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop" prefetch={false}>گشتن در کالکشن</Link>
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

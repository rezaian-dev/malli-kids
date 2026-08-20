import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { toFaDigits } from "@/lib/locale/fa";
import { pdpHref } from "@/lib/data/products";
import { PriceTag } from "./price-tag";
import { ProductCardList } from "./product-card-list";
import { ProductCardGrid } from "./product-card-grid";
import { cn } from "@/lib/utils";

// 🪶 Server-first card with tiny client actions.
export function ProductCard({
  p,
  view,
  aboveFold = false,
  animate,
  index,
  stack = false,
}: {
  p: Product;
  view: "grid" | "list";
  aboveFold?: boolean;
  /** 🎬 فقط در حالت `stack` ورودِ متحرک هنگام تعویض فیلتر را کنترل می‌کند؛
   *  ورودِ اولیه‌ی کارت همیشه بی‌درنگ است تا رفرش فلش نزند. */
  animate?: boolean;
  /** 🃏 موقعیت کارت در گرید فعلی — فقط برای stagger جزئیِ حالت `stack`. */
  index?: number;
  /** 🃏 حالت «دستهٔ کارت» برای بازچیدمانِ فیلتر (grid view). */
  stack?: boolean;
}) {
  const href = pdpHref(p.id);
  const out = !p.stock;
  const imageProps = {
    loading: aboveFold ? ("eager" as const) : undefined,
    fetchPriority: aboveFold ? ("high" as const) : undefined,
  };

  const sold = (
    // ♿ brown-mid, not gold: gold-on-white card text is ~2.2:1, below the
    // 4.5:1 minimum. Dark mode (gold-on-slate) already passes, untouched.
    <p
      className={cn(
        "m-0 mt-1.5 inline-flex flex-row items-center gap-1.5 text-[11px] leading-none font-extrabold",
        "text-brown-mid",
        "dark:text-gold-soft",
      )}
    >
      <ShoppingBag className="block size-3.25 shrink-0" />
      {toFaDigits(p.sold)} فروش
    </p>
  );

  const price = out ? (
    <span className="text-rose text-xs font-extrabold">ناموجود</span>
  ) : (
    <PriceTag price={p.price} old={p.old} />
  );

  const cardProps = {
    p,
    href,
    out,
    sold,
    price,
    imageProps,
    // ⚡ کارت‌های بالای خطِ تا (LCP) حتی در حالت stack هم ورودِ متحرک ندارند.
    animate: animate ?? !aboveFold,
  };

  // 🃏 `stack`/`index` فقط برای grid view معنا دارند (بازچیدمانِ فیلترها)؛
  // برای اینکه شکلِ props بینِ دو کارت یکی نماند، این شاخه صریح نوشته شده.
  return view === "list" ? (
    <ProductCardList {...cardProps} />
  ) : (
    <ProductCardGrid {...cardProps} index={index} stack={stack} />
  );
}

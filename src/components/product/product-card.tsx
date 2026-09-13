import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { toFaDigits } from "@/lib/locale/fa";
import { pdpHref } from "@/lib/data/products";
import { PriceTag } from "./price-tag";
import { ProductCardList } from "./product-card-list";
import { ProductCardGrid } from "./product-card-grid";

// Server-first card with tiny client actions.
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
  // Only stack mode animates; the first render is instant (no refresh flash)
  animate?: boolean;
  // Grid position — only for the slight stack-mode stagger
  index?: number;
  // Card-deck mode for filter re-layout (grid view)
  stack?: boolean;
}) {
  const href = pdpHref(p.id);
  const out = !p.stock;
  const imageProps = {
    loading: aboveFold ? ("eager" as const) : undefined,
    fetchPriority: aboveFold ? ("high" as const) : undefined,
  };

  const sold = (
    // Use darker text on light cards to meet contrast requirements.
    <p
      className="m-0 mt-1.5 inline-flex flex-row items-center gap-1.5 text-[11px] leading-none font-extrabold text-brown-mid dark:text-gold-soft"
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
    // Above-the-fold (LCP) cards never animate, even in stack mode
    animate: animate ?? !aboveFold,
  };

  return view === "list" ? (
    <ProductCardList {...cardProps} />
  ) : (
    <ProductCardGrid {...cardProps} index={index} stack={stack} />
  );
}

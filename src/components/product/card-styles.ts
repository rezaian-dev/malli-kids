import { cn } from "@/lib/utils";

/** 📱 One full-width card below 480px; two-up only when each card is
 *  wide enough that titles and CTAs aren't crushed. */
export const PRODUCT_GRID =
  "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 min-[720px]:grid-cols-[repeat(auto-fill,minmax(14.5rem,1fr))] sm:gap-4";

// 🎨 Shared "view" / "add to cart" button classes for the two product-card
// layouts (grid, list) — identical styling, kept in one place.
export const VIEW = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-xl font-black no-underline transition-all duration-300 hover:-translate-y-0.5",
  "border-2 border-ink bg-white text-ink hover:bg-ink hover:text-white",
  "dark:border-ivory dark:bg-transparent dark:text-ivory dark:hover:bg-ivory dark:hover:text-navy-deep",
);

export const CART = cn(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 font-extrabold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110",
  "bg-navy text-ivory",
  "dark:bg-gold dark:text-navy-deep",
);

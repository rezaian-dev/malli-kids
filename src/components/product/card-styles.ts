import { cn } from "@/lib/utils";

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

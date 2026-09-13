
/** Use one column below 480px to keep cards readable. */
export const PRODUCT_GRID =
  "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 min-[720px]:grid-cols-[repeat(auto-fill,minmax(14.5rem,1fr))] sm:gap-4";

// Shared card action-button classes for grid and list layouts
export const VIEW = "inline-flex items-center justify-center gap-1.5 rounded-xl font-black no-underline transition-all duration-300 hover:-translate-y-0.5 border-2 border-ink bg-white text-ink hover:bg-ink hover:text-white dark:border-ivory dark:bg-transparent dark:text-ivory dark:hover:bg-ivory dark:hover:text-navy-deep";

export const CART = "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 font-extrabold transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 bg-navy text-ivory dark:bg-gold dark:text-navy-deep";

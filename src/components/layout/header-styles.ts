import { cn } from "@/lib/utils";

/**
 * کلاس‌های مشترک هدر.
 *
 * این فایل عمداً نه "use client" دارد و نه JSX: فقط رشتهٔ کلاس است، پس هم
 * Server Component و هم جزیره‌های client می‌توانند بدون هزینهٔ باندل واردش کنند.
 */

/** پایهٔ لینک‌های ناوبری دسکتاپ (روی NavigationMenuLink سوار می‌شود). */
export const NAV_LINK = cn(
  "flex-row items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[11px] font-medium transition-colors",
  "text-navy/80 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold",
  "data-[active=true]:bg-gold data-[active=true]:text-navy-deep data-[active=true]:hover:bg-gold data-[active=true]:hover:text-navy-deep",
  "lg:gap-1.5 lg:px-3 lg:text-sm xl:px-4",
  "dark:text-ivory dark:hover:bg-gold/15 dark:hover:text-gold-light dark:focus:bg-gold/15 dark:focus:text-gold-light",
  "dark:data-[active=true]:bg-gold dark:data-[active=true]:text-navy-deep dark:data-[active=true]:hover:text-navy-deep",
);

/** دکمه‌های آیکونی هدر — هم‌اندازه و هماهنگ در هر دو تم. */
export const ICON_BTN = cn(
  "size-9 shrink-0 rounded-full text-navy hover:bg-gold/12 hover:text-gold sm:size-10 md:size-9 lg:size-10",
  "focus-visible:ring-2 focus-visible:ring-gold/60",
  "dark:text-gold-soft dark:hover:bg-gold/20 dark:hover:text-gold-light",
);

/** پنل‌های کشویی هدر (Sheet سبد و منوی موبایل). */
export const PANEL = cn(
  "z-[90] flex flex-col gap-0 border-navy/10 bg-cream p-0",
  "dark:border-gold/20 dark:bg-navy-deep",
);

/** سربرگ گرادیانی داخل پنل‌ها. */
export const PANEL_HEAD = cn(
  "gap-1 border-b border-navy/10 bg-linear-to-l from-navy to-navy-mid px-5 py-5",
  "dark:border-gold/20",
);

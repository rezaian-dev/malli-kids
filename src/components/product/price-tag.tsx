"use client";

import { useStore } from "@/providers/store-provider";
import { resolvePrice } from "@/lib/shop/pricing";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  old,
  className,
}: {
  price: number;
  old?: number;
  className?: string;
}) {
  const { campaign } = useStore();
  const resolved = resolvePrice({ price, old }, campaign);

  // 🪶 The percent itself is the card's `DiscountBadge` job (image header,
  // one render path — see below). Here we only ever show price + the
  // struck-through original, never a second "٪N تخفیف" chip, so a card
  // can't end up with two disagreeing discount indicators.
  if (resolved.original && resolved.percent) {
    return (
      <span
        className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
      >
        <span className="text-navy dark:text-ivory text-[13px] font-black whitespace-nowrap">
          {formatToman(resolved.price)}{" "}
          <span className="text-navy/70 dark:text-gold-soft text-[10px] font-semibold">
            تومان
          </span>
        </span>
        <s className="text-silver text-[11px] whitespace-nowrap line-through">
          {formatToman(resolved.original)}
        </s>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-navy dark:text-ivory text-[13px] font-black whitespace-nowrap",
        className,
      )}
    >
      {formatToman(resolved.price)}{" "}
      <span className="text-navy/70 dark:text-gold-soft text-[10px] font-semibold">
        تومان
      </span>
    </span>
  );
}
<<<<<<< HEAD
=======

/** 🏷️ The editorial discount tag a product card's image header shows —
 *  the *only* place a card renders a discount percentage. `PriceTag` next
 *  to it (in the card's price row) shows the struck-through original price
 *  but never a percent chip, so exactly one badge exists per card, never
 *  a desktop-price + image-header pair disagreeing (or just duplicating)
 *  the same number. Reads the same `resolvePrice` result `PriceTag` does,
 *  so a live festival overriding a product's own discount is reflected
 *  here too. Small and boutique-tag-shaped on purpose — see callers for
 *  why each positions it in whichever header corner its layout leaves
 *  free of the fav button / category badge. */
const DISCOUNT_BADGE_BASE = cn(
  "pointer-events-none inline-flex items-center gap-1 rounded-xl rounded-ss-[3px]",
  "border border-gold-soft/60 bg-navy-deep/92 px-2 py-0.75",
  "text-[11px] font-black tracking-tight text-gold-glow",
  "shadow-[0_3px_10px_-4px_rgba(4,20,39,.55)] backdrop-blur-[2px]",
  "transition-transform duration-500 ease-out group-hover:-translate-y-0.5",
  "dark:border-gold-soft/40",
);

export function DiscountBadge({
  price,
  old,
  className,
}: {
  price: number;
  old?: number;
  className?: string;
}) {
  const { campaign } = useStore();
  const resolved = resolvePrice({ price, old }, campaign);
  if (!resolved.original || !resolved.percent) return null;

  return (
    <span className={cn(DISCOUNT_BADGE_BASE, className)}>
      <span aria-hidden="true" className="bg-gold-soft size-1 rounded-full" />
      <span aria-hidden="true">{toFaDigits(resolved.percent)}٪</span>
      <span className="sr-only">{toFaDigits(resolved.percent)} درصد تخفیف</span>
    </span>
  );
}
>>>>>>> 7080d59583864477bb7b91d043b51644e2810d2b

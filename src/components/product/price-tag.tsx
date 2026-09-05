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
        <span className="bg-rose rounded px-1.5 py-0.5 text-[10px] font-black whitespace-nowrap text-white">
          {toFaDigits(resolved.percent)}٪ تخفیف
        </span>
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

/** 🏷️ The small corner "٪N تخفیف" pill product cards show over the image.
 *  Reads the same `resolvePrice` result `PriceTag` does, so a live festival
 *  overriding a product's own discount is reflected here too instead of the
 *  card showing two different, disagreeing discount numbers. */
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
    <span className={className}>{toFaDigits(resolved.percent)}٪ تخفیف</span>
  );
}

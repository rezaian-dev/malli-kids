"use client";

import { useCampaign } from "@/providers/campaign-provider";
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
  const { campaign } = useCampaign();
  const resolved = resolvePrice({ price, old }, campaign);

  // The card's one discount indicator — single render path, never duplicated
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
        {/* Use navy text on light cards to preserve contrast. */}
        <s className="text-navy/70 dark:text-silver text-[11px] whitespace-nowrap line-through">
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

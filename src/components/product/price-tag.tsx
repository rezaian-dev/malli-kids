"use client";

import { useStore } from "@/providers/store-provider";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  const { campaign, priceOf } = useStore();
  const eff = priceOf(price);

  if (campaign.active && eff < price) {
    return (
      <span
        className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
      >
        <span className="text-navy dark:text-ivory text-[13px] font-black whitespace-nowrap">
          {formatToman(eff)}{" "}
          <span className="text-navy/70 dark:text-gold-soft text-[10px] font-semibold">
            تومان
          </span>
        </span>
        <s className="text-silver text-[11px] whitespace-nowrap line-through">
          {formatToman(price)}
        </s>
        <span className="bg-rose rounded px-1.5 py-0.5 text-[10px] font-black whitespace-nowrap text-white">
          {toFaDigits(campaign.percent)}٪ تخفیف
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
      {formatToman(price)}{" "}
      <span className="text-navy/70 dark:text-gold-soft text-[10px] font-semibold">
        تومان
      </span>
    </span>
  );
}

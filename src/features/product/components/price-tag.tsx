"use client";

import { useStore } from "@/lib/store";
import { formatToman, toFaDigits } from "@/lib/format";

/**
 * قیمتِ محصول با آگاهی از جشنوارهٔ ادمین:
 * در زمانِ جشنواره، قیمتِ تخفیف‌خورده + قیمتِ خط‌خورده + برچسبِ درصد.
 */
export function PriceTag({ price, className }: { price: number; className?: string }) {
  const { campaign, priceOf } = useStore();
  const eff = priceOf(price);

  if (campaign.active && eff < price) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-1.5 ${className ?? ""}`}>
        <span className="font-black text-[13px] whitespace-nowrap text-navy dark:text-ivory">
          {formatToman(eff)} <span className="text-[10px] font-semibold text-navy/50 dark:text-gold-soft">تومان</span>
        </span>
        <s className="text-[11px] text-silver line-through whitespace-nowrap">{formatToman(price)}</s>
        <span className="rounded bg-rose px-1.5 py-0.5 text-[10px] font-black text-white whitespace-nowrap">
          {toFaDigits(campaign.percent)}٪ تخفیف
        </span>
      </span>
    );
  }

  return (
    <span className={`font-black text-[13px] whitespace-nowrap text-navy dark:text-ivory ${className ?? ""}`}>
      {formatToman(price)} <span className="text-[10px] font-semibold text-navy/50 dark:text-gold-soft">تومان</span>
    </span>
  );
}

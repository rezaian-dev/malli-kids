import { Truck } from "lucide-react";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

/** 🚚 The free-shipping progress bar shown above the cart line items. */
export function CartShippingProgress({
  remaining,
  freeShip,
  progress,
}: {
  remaining: number;
  freeShip: boolean;
  progress: number;
}) {
  return (
    <div className="border-navy/10 dark:border-gold/20 border-b px-4 py-3.5">
      <div className="text-navy dark:text-ivory flex items-center gap-2 text-[11px] font-black">
        <Truck className="text-gold size-4 shrink-0" />
        {freeShip ? (
          <span>
            ارسالِ سفارشِ شما <span className="text-gold">رایگان</span> شد 🎉
          </span>
        ) : (
          <span>
            <span className="text-gold">{formatToman(remaining)} تومان</span>{" "}
            تا ارسالِ رایگان
          </span>
        )}
        <span className="text-navy/70 dark:text-wheat/70 ms-auto text-[10px] font-bold">
          {toFaDigits(progress)}٪
        </span>
      </div>
      <div className="bg-navy/10 mt-2 h-1.5 overflow-hidden rounded-full dark:bg-white/10">
        <div
          className={cn(
            "h-full rounded-full bg-linear-to-l transition-all duration-500",
            freeShip
              ? "from-emerald-400 to-emerald-500"
              : "from-gold-deep to-gold-light",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

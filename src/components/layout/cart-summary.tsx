import { Separator } from "@/components/ui/separator";
import { formatToman } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

/** 🧾 Subtotal / shipping / total breakdown. */
export function CartSummary({
  subtotal,
  shipping,
  freeShip,
}: {
  subtotal: number;
  shipping: number;
  freeShip: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-1.5 px-4 py-3",
        "border-navy/10 text-navy/70 border-t text-xs font-bold",
        "dark:border-gold/20 dark:text-wheat/80",
      )}
    >
      <p className="flex justify-between">
        <span>جمعِ کالاها</span>
        <span className="tabular-nums">{formatToman(subtotal)} تومان</span>
      </p>
      <p className="flex justify-between">
        <span>ارسال</span>
        <span>{freeShip ? "رایگان 🎉" : `${formatToman(shipping)} تومان`}</span>
      </p>
      <Separator className="bg-navy/10 dark:bg-gold/20" />
      <p className="text-navy dark:text-ivory flex justify-between text-sm font-black">
        <span>مبلغِ نهایی</span>
        <span className="text-gold-deep dark:text-gold-light tabular-nums">
          {formatToman(subtotal + shipping)} تومان
        </span>
      </p>
    </div>
  );
}

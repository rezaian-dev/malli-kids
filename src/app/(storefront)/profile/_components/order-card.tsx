import Image from "next/image";
import { Home, Package, Truck, Wallet } from "lucide-react";
import type { AdminOrder, OrderStatus } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { ORDER_STAGES, stageIndex } from "@/lib/shop/order-status";
import { cn } from "@/lib/utils";

const ORDER_TONE: Record<OrderStatus, string> = {
  جدید: "bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold-light",
  "در حال آماده‌سازی":
    "bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  ارسال‌شده:
    "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  تحویل‌شده:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  مرجوعی: "bg-rose/10 text-rose",
};

const STAGE_ICONS = [Wallet, Package, Truck, Home] as const;

/** 📦 One order — items, total, and the delivery-stage tracker. */
export function OrderCard({ order }: { order: AdminOrder }) {
  const stage = stageIndex(order.status);

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border",
        "border-navy/10",
        "dark:border-gold/25",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-b px-4 py-3",
          "border-navy/8 bg-navy/2",
          "dark:border-gold/15 dark:bg-white/2",
        )}
      >
        <p className="text-navy dark:text-ivory text-sm font-black" dir="ltr">
          {order.id}
        </p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-black",
            ORDER_TONE[order.status],
          )}
        >
          {order.status}
        </span>
        <span className="text-navy/70 dark:text-wheat ms-auto text-[10px] font-bold">
          {order.date}
        </span>
        <span className="text-gold text-sm font-black">
          {formatToman(order.total)} تومان
        </span>
      </div>

      <ul className="space-y-2 px-4 py-3">
        {order.items.map((item) => (
          <li
            key={`${item.id}-${item.size}`}
            className="flex items-center gap-3"
          >
            <Image
              src={item.img}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-black",
                  "text-navy",
                  "dark:text-ivory",
                )}
              >
                {item.name}
              </p>
              <p className="text-navy/70 dark:text-wheat text-[11px] font-bold">
                سایز {item.size} × {toFaDigits(item.qty)}
              </p>
            </div>
            <span className="text-navy/70 dark:text-ivory/70 text-xs font-black">
              {formatToman(item.price * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      {stage === -1 ? (
        <p
          className={cn(
            "mx-4 mb-4 rounded-xl px-4 py-2.5 text-[11px] font-black",
            "bg-rose/10 text-rose",
          )}
        >
          این سفارش مرجوع شده است؛ مبلغ به کیف پول شما برمی‌گردد.
        </p>
      ) : (
        <ol className="flex items-center gap-0 px-4 pt-1 pb-5">
          {ORDER_STAGES.map((label, index) => {
            const Icon = STAGE_ICONS[index];
            const done = index <= stage;

            return (
              <li key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full border-2 transition-colors",
                      done
                        ? "border-gold bg-gold text-navy-deep"
                        : "border-navy/15 text-navy/70 dark:border-gold/25 dark:text-wheat/50",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-black",
                      done
                        ? "text-navy dark:text-ivory"
                        : "text-navy/70 dark:text-wheat/50",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < ORDER_STAGES.length - 1 ? (
                  <span
                    className={cn(
                      "mx-1 mb-5 h-0.5 flex-1 rounded-full",
                      index < stage ? "bg-gold" : "bg-navy/10 dark:bg-gold/20",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
}

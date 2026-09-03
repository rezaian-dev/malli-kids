import type { OrderStatus } from "@/types";

// 🧭 Pure order-status helpers — no database import, so client components
// (order tables, status badges, the delivery-stage tracker) can use them
// directly without pulling Mongoose into the browser bundle. `@/lib/shop/orders`
// is the data-access counterpart (real reads/writes), server-only.
export const ORDER_FLOW: OrderStatus[] = [
  "جدید",
  "در حال آماده‌سازی",
  "ارسال‌شده",
  "تحویل‌شده",
  "مرجوعی",
];

export const ORDER_STAGES = [
  "ثبت و پرداخت",
  "آماده‌سازی",
  "ارسال",
  "تحویل",
] as const;

export function stageIndex(status: OrderStatus): number {
  switch (status) {
    case "جدید":
      return 0;
    case "در حال آماده‌سازی":
      return 1;
    case "ارسال‌شده":
      return 2;
    case "تحویل‌شده":
      return 3;
    default:
      return -1;
  }
}

export function statusTone(s: OrderStatus) {
  if (s === "جدید") return "bg-gold/20 text-gold-deep dark:text-gold-soft";
  if (s === "در حال آماده‌سازی")
    return "bg-navy/10 text-navy dark:bg-navy-mid dark:text-ivory";
  if (s === "ارسال‌شده")
    return "bg-gold-pale text-navy dark:bg-dusk-mid dark:text-gold-soft";
  if (s === "تحویل‌شده") return "bg-sand text-navy dark:bg-slate dark:text-ivory";
  return "bg-rose-pale text-rose";
}

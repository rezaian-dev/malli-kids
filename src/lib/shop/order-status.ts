import type { AdminOrder, OrderStatus } from "@/types";
import type { OrderPayment } from "@/lib/db/models/order";

export const ORDER_FLOW: OrderStatus[] = [
  "جدید",
  "در حال آماده‌سازی",
  "ارسال‌شده",
  "تحویل‌شده",
  "مرجوعی",
  "لغوشده",
];

export const ORDER_STAGES = ["ثبت سفارش", "آماده‌سازی", "ارسال", "تحویل"] as const;

// Cancellation uses its own financial workflow, never the generic status setter.
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  جدید: ["در حال آماده‌سازی"],
  "در حال آماده‌سازی": ["ارسال‌شده"],
  ارسال‌شده: ["تحویل‌شده", "مرجوعی"],
  تحویل‌شده: ["مرجوعی"],
  مرجوعی: [],
  لغوشده: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return from === to || ORDER_TRANSITIONS[from].includes(to);
}

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

export function canCancelBeforeShipping(status: OrderStatus): boolean {
  return status === "جدید" || status === "در حال آماده‌سازی";
}

// A paid label is not evidence that money was received.
export function hasVerifiedPayment(
  payment: OrderPayment | undefined,
  total: number,
): payment is OrderPayment {
  return Boolean(
    payment?.id &&
    payment.confirmedBy &&
    payment.reference &&
    ["manual", "gateway"].includes(payment.method) &&
    payment.confirmedAt instanceof Date &&
    Number.isFinite(payment.confirmedAt.getTime()) &&
    Number.isSafeInteger(payment.amount) &&
    payment.amount >= 0 &&
    payment.amount === total,
  );
}

export function isRevenueOrder(
  order: Pick<AdminOrder, "pay" | "status" | "paymentVerified">,
): boolean {
  return (
    order.paymentVerified === true &&
    order.pay === "پرداخت‌شده" &&
    order.status !== "لغوشده" &&
    order.status !== "مرجوعی"
  );
}

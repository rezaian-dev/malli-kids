import { Badge } from "@/components/ui/badge";
import type { AdminCol } from "@/components/admin";
import { statusTone } from "@/lib/shop/order-status";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { AdminOrder } from "@/types";

/** Orders table columns. `onOpen` wires keyboard access to the row detail. */
export function orderColumns(
  onOpen: (order: AdminOrder) => void,
): AdminCol<AdminOrder>[] {
  return [
  {
    key: "id",
    title: "شناسه سفارش",
    width: "8.5rem",
    render: (order) => (
      <button
        type="button"
        onClick={() => onOpen(order)}
        className="text-gold-deep dark:text-gold-soft font-black hover:underline underline-offset-4"
        dir="ltr"
      >
        {order.id}
      </button>
    ),
  },
  {
    key: "customer",
    title: "مشتری",
    width: "1.35fr",
    render: (order) => (
      <div className="min-w-0">
        <p className="truncate">{order.customer}</p>
        <p
          className="text-navy/70 dark:text-wheat mt-0.5 text-[10px] font-bold"
          dir="ltr"
        >
          {order.phone}
        </p>
      </div>
    ),
  },
  {
    key: "city",
    title: "مقصد",
    width: "6rem",
    align: "center",
    hideTablet: true,
    render: (order) => order.city,
  },
  {
    key: "date",
    title: "تاریخ",
    width: "7rem",
    align: "center",
    hideTablet: true,
    render: (order) => (
      <span className="text-navy/70 dark:text-wheat whitespace-nowrap">{order.date}</span>
    ),
  },
  {
    key: "items",
    title: "اقلام",
    width: "4rem",
    align: "center",
    hideTablet: true,
    render: (order) =>
      `${toFaDigits(order.items.reduce((sum, item) => sum + item.qty, 0))} قلم`,
  },
  {
    key: "total",
    title: "مبلغ نهایی",
    width: "9rem",
    align: "center",
    render: (order) => (
      <span className="text-gold-deep dark:text-gold-soft font-black whitespace-nowrap">
        {formatToman(order.total)} ت
      </span>
    ),
  },
  {
    key: "pay",
    title: "پرداخت",
    width: "9rem",
    align: "center",
    render: (order) => (
      <span
        className={cn(
          "inline-block rounded-full px-2 py-1 text-[10px] font-bold",
          order.paymentVerified
            ? "bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
            : "bg-gold/10 text-gold-deep dark:text-gold-soft",
        )}
      >
        {order.refundedAmount
          ? "به کیف پول برگشت"
          : order.paymentVerified
            ? "تأییدشده"
            : order.pay === "پرداخت‌شده"
              ? "نیاز به بررسی"
              : "در انتظار تأیید"}
      </span>
    ),
  },
  {
    key: "status",
    title: "وضعیت",
    width: "8rem",
    align: "center",
    render: (order) => (
      <Badge className={cn("w-max rounded-lg border-0", statusTone(order.status))}>
        {order.status}
      </Badge>
    ),
  },
  ];
}

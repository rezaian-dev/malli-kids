import { Badge } from "@/components/ui/badge";
import type { AdminCol } from "@/components/admin";
import { statusTone } from "@/lib/admin/admin-data";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/orders";

/** 🧱 The orders table column set. */
export const ORDER_COLUMNS: AdminCol<Order>[] = [
  {
    key: "id",
    title: "شناسه سفارش",
    width: "8.5rem",
    render: (order) => (
      <span className="text-gold-deep dark:text-gold-soft font-black" dir="ltr">
        {order.id}
      </span>
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
          className="text-navy/40 dark:text-wheat mt-0.5 text-[10px] font-bold"
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
      <span className="text-navy/55 dark:text-wheat whitespace-nowrap">
        {order.date}
      </span>
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

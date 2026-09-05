"use client";

import Image from "next/image";
import { FileDown, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminFilterSelect } from "@/components/admin";
import { ORDER_FLOW } from "@/lib/shop/order-status";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { AdminOrder, OrderStatus } from "@/types";

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 font-bold">
      <span className="text-navy/70 dark:text-wheat">{k}</span>
      <span
        className={
          strong
            ? "text-navy dark:text-ivory font-black"
            : "text-navy dark:text-ivory"
        }
      >
        {v}
      </span>
    </div>
  );
}

/** 📦 The order-detail side sheet — line items, totals, and a status
 *  changer. */
export function OrderDetailSheet({
  order,
  onOpenChange,
  onStatusChange,
}: {
  order: AdminOrder | null;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: OrderStatus) => void;
}) {
  return (
    <Sheet open={!!order} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-full max-w-full gap-3 overflow-y-auto sm:w-104 sm:max-w-104",
          "border-navy/10 bg-fog text-navy",
          "dark:border-gold/20 dark:bg-navy-deep dark:text-ivory",
        )}
      >
        {order ? (
          <>
            <SheetHeader className="text-start">
              <SheetTitle className="text-navy dark:text-ivory">
                جزئیات سفارش
              </SheetTitle>
              <SheetDescription className="text-navy/70 dark:text-wheat" dir="ltr">
                {order.id}
              </SheetDescription>
            </SheetHeader>

            {order.pay === "پرداخت‌شده" ? (
              <div className="px-4">
                <a
                  href={`/api/orders/${order.id}/invoice`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black transition",
                    "border-navy/10 text-navy hover:border-gold hover:bg-gold/10",
                    "dark:border-gold/20 dark:text-ivory",
                  )}
                >
                  <FileDown className="size-3.5" /> دانلود فاکتور
                </a>
              </div>
            ) : null}

            <div
              className={cn(
                "mx-4 rounded-2xl border bg-white/70 p-3",
                "border-navy/8",
                "dark:border-gold/14 dark:bg-white/[0.035]",
              )}
            >
              <p className="font-black">{order.customer}</p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-xs" dir="ltr">
                {order.phone}
              </p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6">
                {order.city} — {order.address}
              </p>
              <p
                className="text-navy/70 dark:text-wheat mt-1 text-xs font-bold"
                dir="ltr"
              >
                کد پستی: {order.postalCode}
              </p>
            </div>

            <Separator className="bg-navy/8 dark:bg-gold/15" />
            <ul className="space-y-2 px-4">
              {order.items.map((item) => (
                <li
                  key={`${item.id}-${item.size}`}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-white/70 p-2",
                    "border-navy/7",
                    "dark:border-gold/12 dark:bg-white/[0.035]",
                  )}
                >
                  <Image
                    src={item.img}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black">{item.name}</p>
                    <p className="text-navy/70 dark:text-wheat mt-1 text-[10px]">
                      سایز {item.size} × {toFaDigits(item.qty)}
                    </p>
                  </div>
                  <span className="text-gold-deep dark:text-gold-soft shrink-0 text-[10px] font-black">
                    {formatToman(item.price)}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "mx-4 space-y-2 rounded-2xl p-4 text-xs",
                "bg-navy/[0.035]",
                "dark:bg-white/[0.035]",
              )}
            >
              <Row k="جمع کالا" v={formatToman(order.subtotal)} />
              <Row
                k="تخفیف"
                v={order.discount ? formatToman(order.discount) : "—"}
              />
              <Row
                k="ارسال"
                v={order.shipping ? formatToman(order.shipping) : "رایگان"}
              />
              <Separator className="bg-navy/8 dark:bg-gold/15 my-2" />
              <Row k="قابل پرداخت" v={`${formatToman(order.total)} تومان`} strong />
            </div>

            <div className="px-4 pb-5">
              <AdminFilterSelect
                label="تغییر وضعیت سفارش"
                value={order.status}
                onValueChange={(value) => onStatusChange(value as OrderStatus)}
                options={ORDER_FLOW.map((item) => ({ value: item, label: item }))}
                className="w-full xl:w-full"
              />
              {order.status === "مرجوعی" ? (
                <p className="text-rose mt-2 flex items-center gap-1.5 text-[10px] font-bold">
                  <RotateCcw className="size-3" /> این سفارش در وضعیت مرجوعی
                  قرار دارد.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpLeft,
  FileDown,
  Home,
  Package,
  PackageX,
  Truck,
  Wallet,
} from "lucide-react";
import type { AdminOrder } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { ORDER_STAGES, stageIndex, statusTone } from "@/lib/shop/order-status";
import { announceProfileTab, profileTabHref } from "@/lib/profile-nav";
import { Badge } from "@/components/ui/badge";
import { CancelOrderDialog } from "@/components/shared/cancel-order-dialog";
import { cn } from "@/lib/utils";

const STAGE_ICONS = [Wallet, Package, Truck, Home] as const;

export function OrderCard({
  order,
  onChanged,
}: {
  order: AdminOrder;
  onChanged: (order: AdminOrder) => void;
}) {
  const stage = stageIndex(order.status);
  const cancelled = order.status === "لغوشده";
  const refunded = (order.refundedAmount ?? 0) > 0;
  const paymentLabel = refunded
    ? "به کیف پول برگشت"
    : cancelled
      ? "بدون دریافت وجه"
      : order.paymentVerified
        ? "پرداخت تأییدشده"
        : order.pay === "پرداخت‌شده"
          ? "پرداخت قبلی؛ نیاز به بررسی"
          : "در انتظار تأیید پرداخت";

  return (
    <li
      data-order-id={order.id}
      tabIndex={-1}
      className="border-navy/10 bg-white/65 dark:border-gold/20 dark:bg-white/3 overflow-hidden rounded-[24px] border outline-none"
    >
      <div className="border-navy/8 bg-navy/2 dark:border-gold/12 dark:bg-white/2 flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <bdi className="text-navy dark:text-ivory text-xs font-black">{order.id}</bdi>
        <Badge
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-[10px]",
            statusTone(order.status),
          )}
        >
          {order.status}
        </Badge>
        <span className="text-navy/70 dark:text-wheat ms-auto text-[10px]">
          {order.date}
        </span>
      </div>
      <ul className="space-y-3 px-4 py-4">
        {order.items.map((item, index) => (
          <li
            key={`${item.id}-${item.size}-${index}`}
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
              <p className="text-navy dark:text-ivory truncate text-xs font-black">
                {item.name}
              </p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-[10px]">
                سایز {item.size} × {toFaDigits(item.qty)}
              </p>
            </div>
            <span className="text-navy/70 dark:text-ivory/75 text-[11px] font-bold">
              {formatToman(item.price * item.qty)} <small>تومان</small>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold",
            order.paymentVerified
              ? "bg-emerald-500/7 text-emerald-700 dark:text-emerald-300"
              : "bg-gold/10 text-gold-deep dark:text-gold-soft",
          )}
        >
          {paymentLabel}
        </span>
        <p className="text-navy dark:text-ivory text-xs">
          <span className="text-navy/70 dark:text-wheat me-2 text-[10px]">
            مبلغ سفارش
          </span>
          <b className="font-black">{formatToman(order.total)}</b> تومان
        </p>
      </div>

      {cancelled ? (
        <div
          className={cn(
            "mx-4 mb-4 rounded-2xl border p-4",
            refunded
              ? "border-emerald-500/15 bg-emerald-500/5"
              : "border-navy/10 bg-navy/2 dark:border-gold/15",
          )}
        >
          <p className="text-navy dark:text-ivory flex items-center gap-2 text-xs font-black">
            <PackageX className="size-4 text-gold-deep dark:text-gold" /> سفارش لغو شده
            است
          </p>
          <p className="text-navy/70 dark:text-wheat mt-2 text-xs leading-7">
            {refunded
              ? `${formatToman(order.refundedAmount ?? 0)} تومان به کیف پول شما بازگشت.`
              : "برای این سفارش وجهی تأیید نشده بود؛ موجودی کیف پول تغییری نکرد."}
          </p>
          {order.cancelledAt ? (
            <p className="text-navy/70 dark:text-wheat/65 mt-1 text-[10px]">
              {order.cancelledAt}
            </p>
          ) : null}
          {refunded ? (
            <Link
              href={profileTabHref("wallet")}
              onClick={() => announceProfileTab("wallet")}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-300"
            >
              <Wallet className="size-3.5" /> دیدن کیف پول{" "}
              <ArrowUpLeft className="size-3.5" />
            </Link>
          ) : null}
        </div>
      ) : stage === -1 ? (
        <p className="bg-rose/5 text-rose mx-4 mb-4 rounded-2xl px-4 py-3 text-xs leading-7">
          این سفارش مرجوع شده است؛ وضعیت بازپرداخت را از پشتیبانی پیگیری کنید.
        </p>
      ) : (
        <ol className="flex items-center px-4 pt-1 pb-5">
          {ORDER_STAGES.map((label, index) => {
            const Icon = STAGE_ICONS[index];
            const done = index <= stage;
            return (
              <li key={label} className="flex min-w-0 flex-1 items-center">
                <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full border-2",
                      done
                        ? "border-gold bg-gold text-navy-deep"
                        : "border-navy/15 text-navy/40 dark:border-gold/20 dark:text-wheat/50",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span
                    className={cn(
                      "text-[8px] font-bold sm:text-[9px]",
                      done
                        ? "text-navy dark:text-ivory"
                        : "text-navy/70 dark:text-wheat/60",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < ORDER_STAGES.length - 1 ? (
                  <span
                    className={cn(
                      "mx-1 mb-5 h-0.5 min-w-1 flex-1 rounded-full",
                      index < stage ? "bg-gold" : "bg-navy/8 dark:bg-gold/15",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
      <div className="border-navy/7 dark:border-gold/10 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5">
        <CancelOrderDialog order={order} onChanged={onChanged} />
        {order.paymentVerified ? (
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="text-navy/70 dark:text-wheat ms-auto inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-[10px] font-bold hover:text-gold-deep dark:hover:text-gold"
          >
            <FileDown className="size-3.5" /> فاکتور سفارش
          </a>
        ) : !cancelled ? (
          <span className="text-navy/70 dark:text-wheat/60 text-[10px] leading-6">
            پرداخت آنلاین هنوز فعال نیست.
          </span>
        ) : null}
      </div>
    </li>
  );
}

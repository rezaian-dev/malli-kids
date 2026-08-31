"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Home,
  Package,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import type { OrderStatus } from "@/types";
import { useStore } from "@/providers/store-provider";
import { formatToman, toFaDigits } from "@/lib/format";
import { useFavorites } from "@/lib/favorites";
import {
  ORDER_FLOW,
  ORDER_STAGES,
  stageIndex,
  useOrders,
  type Order,
} from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROFILE_CARD } from "./profile-shared";

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

// 📦 Orders panel stays isolated from the default profile bundle.
export function ProfileOrdersPanel() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const orders = useOrders(owner);
  const favs = useFavorites();
  const [filter, setFilter] = useState<"همه" | OrderStatus>("همه");

  if (!user) return null;

  const list =
    filter === "همه" ? orders : orders.filter((order) => order.status === filter);
  const paid = orders
    .filter((order) => order.status !== "مرجوعی")
    .reduce((sum, order) => sum + order.total, 0);
  const active = orders.filter((order) => {
    const index = stageIndex(order.status);
    return index >= 0 && index < 3;
  }).length;

  const stats = [
    { Icon: ShoppingBag, label: "سفارش‌ها", value: toFaDigits(orders.length) },
    { Icon: Wallet, label: "جمع پرداختی", value: `${formatToman(paid)} ت` },
    { Icon: Truck, label: "در جریان", value: toFaDigits(active) },
    { Icon: Heart, label: "علاقه‌مندی‌ها", value: toFaDigits(favs.length) },
  ];

  return (
    <section className={PROFILE_CARD}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy dark:text-linen">سفارش‌های من</h2>
          <p className="mt-1 text-xs leading-6 text-navy/50 dark:text-wheat">
            هر سفارش در چه مرحله‌ای است را همین‌جا دنبال کنید.
          </p>
        </div>
        <Button asChild variant="gold" size="sm" className="h-10 shrink-0 rounded-full px-5">
          <Link href="/shop" prefetch={false}>
            خرید جدید
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-navy/10 bg-navy/2 px-4 py-3.5 text-center dark:border-gold/25 dark:bg-white/3"
          >
            <Icon className="mx-auto size-4 text-gold" />
            <p className="mt-2 truncate text-sm font-black text-navy dark:text-ivory" dir="ltr">
              {value}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-navy/45 dark:text-wheat">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="فیلتر وضعیت سفارش">
        {(["همه", ...ORDER_FLOW] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-black transition-colors",
              filter === item
                ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep"
                : "border-navy/15 text-navy/55 hover:border-gold/60 dark:border-gold/25 dark:text-wheat",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center dark:border-gold/25">
          <ShoppingBag className="mx-auto size-9 text-gold" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز سفارشی ندارید</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">
            اولین خریدتان را ثبت کنید؛ اینجا مرحله‌به‌مرحله تا دم در خانه پیگیری‌اش می‌کنید.
          </p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop" prefetch={false}>دیدن کالکشن</Link>
          </Button>
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl bg-navy/3 px-4 py-6 text-center text-xs font-bold text-navy/50 dark:bg-white/4 dark:text-wheat">
          سفارشی با این وضعیت ندارید.
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderCard({ order }: { order: Order }) {
  const stage = stageIndex(order.status);

  return (
    <li className="overflow-hidden rounded-2xl border border-navy/10 dark:border-gold/25">
      <div className="flex flex-wrap items-center gap-2 border-b border-navy/8 bg-navy/2 px-4 py-3 dark:border-gold/15 dark:bg-white/2">
        <p className="text-sm font-black text-navy dark:text-ivory" dir="ltr">
          {order.id}
        </p>
        <span className={cn("rounded-full px-3 py-1 text-[10px] font-black", ORDER_TONE[order.status])}>
          {order.status}
        </span>
        <span className="ms-auto text-[10px] font-bold text-navy/45 dark:text-wheat">
          {order.date}
        </span>
        <span className="text-sm font-black text-gold">{formatToman(order.total)} تومان</span>
      </div>

      <ul className="space-y-2 px-4 py-3">
        {order.items.map((item) => (
          <li key={`${item.id}-${item.size}`} className="flex items-center gap-3">
            <Image
              src={item.img}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-navy dark:text-ivory">{item.name}</p>
              <p className="text-[11px] font-bold text-navy/50 dark:text-wheat">
                سایز {item.size} × {toFaDigits(item.qty)}
              </p>
            </div>
            <span className="text-xs font-black text-navy/70 dark:text-ivory/70">
              {formatToman(item.price * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      {stage === -1 ? (
        <p className="mx-4 mb-4 rounded-xl bg-rose/10 px-4 py-2.5 text-[11px] font-black text-rose">
          این سفارش مرجوع شده است؛ مبلغ به کیف پول شما برمی‌گردد.
        </p>
      ) : (
        <ol className="flex items-center gap-0 px-4 pb-5 pt-1">
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
                        : "border-navy/15 text-navy/35 dark:border-gold/25 dark:text-wheat/50",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-black",
                      done ? "text-navy dark:text-ivory" : "text-navy/35 dark:text-wheat/50",
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

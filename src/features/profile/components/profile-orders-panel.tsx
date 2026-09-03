"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Truck, Wallet } from "lucide-react";
import type { OrderStatus } from "@/types";
import { useStore } from "@/providers/store-provider";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { useFavorites } from "@/lib/favorites";
import { ORDER_FLOW, stageIndex, useOrders } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PROFILE_CARD } from "./profile-shared";
import { OrderCard } from "./order-card";

// 📦 Orders panel stays isolated from the default profile bundle.
export function ProfileOrdersPanel() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const orders = useOrders(owner);
  const favs = useFavorites();
  const [filter, setFilter] = useState<"همه" | OrderStatus>("همه");

  if (!user) return null;

  const list =
    filter === "همه"
      ? orders
      : orders.filter((order) => order.status === filter);
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
          <h2 className="text-navy dark:text-linen text-lg font-black">
            سفارش‌های من
          </h2>
          <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6">
            هر سفارش در چه مرحله‌ای است را همین‌جا دنبال کنید.
          </p>
        </div>
        <Button
          asChild
          variant="gold"
          size="sm"
          className="h-10 shrink-0 rounded-full px-5"
        >
          <Link href="/shop" prefetch={false}>
            خرید جدید
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ Icon, label, value }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border px-4 py-3.5 text-center",
              "border-navy/10 bg-navy/2",
              "dark:border-gold/25 dark:bg-white/3",
            )}
          >
            <Icon className="text-gold mx-auto size-4" />
            <p
              className={cn(
                "mt-2 truncate text-sm font-black",
                "text-navy",
                "dark:text-ivory",
              )}
              dir="ltr"
            >
              {value}
            </p>
            <p className="text-navy/70 dark:text-wheat mt-0.5 text-[10px] font-bold">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="فیلتر وضعیت سفارش"
      >
        {(["همه", ...ORDER_FLOW] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-black transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95",
              filter === item
                ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep motion-safe:hover:shadow-md"
                : "border-navy/15 text-navy/70 hover:border-gold/60 dark:border-gold/25 dark:text-wheat",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div
          className={cn(
            "rounded-2xl border border-dashed px-6 py-10 text-center",
            "border-navy/15",
            "dark:border-gold/25",
          )}
        >
          <ShoppingBag className="text-gold mx-auto size-9" />
          <p className="text-navy dark:text-ivory mt-3 font-black">
            هنوز سفارشی ندارید
          </p>
          <p
            className={cn(
              "mx-auto mt-1 max-w-xs text-xs leading-6",
              "text-navy/70",
              "dark:text-wheat",
            )}
          >
            اولین خریدتان را ثبت کنید؛ اینجا مرحله‌به‌مرحله تا دم در خانه
            پیگیری‌اش می‌کنید.
          </p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop" prefetch={false}>
              دیدن کالکشن
            </Link>
          </Button>
        </div>
      ) : list.length === 0 ? (
        <p
          className={cn(
            "rounded-2xl px-4 py-6 text-center text-xs font-bold",
            "bg-navy/3 text-navy/70",
            "dark:text-wheat dark:bg-white/4",
          )}
        >
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

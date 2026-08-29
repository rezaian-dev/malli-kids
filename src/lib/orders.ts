"use client";

import { useEffect, useState } from "react";
import type { OrderStatus } from "@/types";
import { BRAND, STORAGE } from "./constants";
import { faNow } from "./format";
import { notify } from "./notifications";

/**
 * سفارش‌های واقعیِ کاربر — منبعِ دادهٔ تبِ «سفارش‌ها» در پنل و صفحهٔ سفارش‌های ادمین.
 *
 * چرخه: ثبت سفارش از صفحهٔ محصول → وضعیت «جدید» → ادمین وضعیت را جلو می‌برد →
 * کاربر هم در پنل (خط زمانی) و هم با اعلانِ هدر، مرحلهٔ سفارشش را می‌بیند.
 * پرداخت در این نسخهٔ نمایشی شبیه‌سازی می‌شود (پرداخت در محل).
 */

export const ORDER_FLOW: OrderStatus[] = ["جدید", "در حال آماده‌سازی", "ارسال‌شده", "تحویل‌شده", "مرجوعی"];

/** چهار مرحلهٔ اصلی برای خطِ زمانیِ پنل کاربر */
export const ORDER_STAGES = ["ثبت و پرداخت", "آماده‌سازی", "ارسال", "تحویل"] as const;

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
      return -1; // مرجوعی
  }
}

export const SHIPPING_FEE = 95_000;

export type OrderItem = { id: number; name: string; img: string; size: string; qty: number; price: number };

export type Order = {
  id: string;
  /** ایمیل/موبایل کاربر — معیارِ «سفارش‌های من» */
  owner: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};

const KEY = STORAGE.purchases;
const EVENT = "orders:change";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Order[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function createOrder(input: { owner: string; customer: string; phone: string; city: string; address: string; items: OrderItem[]; discount?: number }): Order {
  const subtotal = input.items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const discount = Math.min(input.discount ?? 0, subtotal);
  const order: Order = {
    id: `MK-${Date.now().toString(36).slice(-5).toUpperCase()}`,
    owner: input.owner,
    customer: input.customer,
    phone: input.phone,
    city: input.city,
    address: input.address,
    date: faNow(),
    items: input.items,
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    status: "جدید",
  };
  persist([order, ...loadOrders()]);
  notify(order.owner, "order", `سفارش ${order.id} ثبت شد؛ وضعیتش را از پنل کاربری پیگیری کنید.`);
  return order;
}

/** تغییر وضعیت (از ادمین) + اعلان به کاربر */
export function setOrderStatus(id: string, status: OrderStatus) {
  const target = loadOrders().find((o) => o.id === id);
  persist(loadOrders().map((o) => (o.id === id ? { ...o, status } : o)));
  if (target && target.owner) {
    notify(target.owner, "order", `وضعیت سفارش ${id} به «${status}» تغییر کرد.`);
  }
}

/** فهرست زندهٔ سفارش‌ها — با owner فقط سفارش‌های همان کاربر. */
export function useOrders(owner?: string): Order[] {
  const [all, setAll] = useState<Order[]>([]);

  useEffect(() => {
    const sync = () => setAll(loadOrders());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!owner) return all;
  return all.filter((o) => o.owner === owner);
}

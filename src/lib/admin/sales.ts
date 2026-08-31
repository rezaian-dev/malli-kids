import type { AdminOrder } from "@/types";
import { toEnDigits, toFaDigits } from "@/lib/format";

const FA_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

type Parsed = { y: number; m: number; d: number; key: string };

function parseJalali(date: string): Parsed | null {
  const parts = date.split("/");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((s) => Number(toEnDigits(s)));
  if ([y, m, d].some((n) => Number.isNaN(n)) || m < 1 || m > 12) return null;
  return {
    y,
    m,
    d,
    key: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  };
}

export type SalesPoint = {
  label: string;
  sub?: string;
  value: number;
  count: number;
};

/** Paid, non-returned orders with a parseable date — the honest revenue base. */
function revenueOrders(orders: AdminOrder[]) {
  return orders
    .filter((o) => o.pay === "پرداخت‌شده" && o.status !== "مرجوعی")
    .map((o) => ({ o, p: parseJalali(o.date) }))
    .filter((x): x is { o: AdminOrder; p: Parsed } => x.p !== null);
}

/** Revenue grouped by Jalali month, ending at the latest month present, `count` buckets (missing months = 0). */
export function monthlySeries(orders: AdminOrder[], count = 6): SalesPoint[] {
  const paid = revenueOrders(orders);
  if (!paid.length) return [];

  const ym = (y: number, m: number) => y * 12 + (m - 1);
  const maxKey = Math.max(...paid.map((x) => ym(x.p.y, x.p.m)));

  const out: SalesPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const k = maxKey - i;
    if (k < 0) continue;
    const y = Math.floor(k / 12);
    const m = (k % 12) + 1;
    const inBucket = paid.filter((x) => ym(x.p.y, x.p.m) === k);
    out.push({
      label: FA_MONTHS[m - 1],
      sub: toFaDigits(y),
      value: inBucket.reduce((s, x) => s + x.o.total, 0),
      count: inBucket.length,
    });
  }
  return out;
}

/** Revenue grouped by the most recent distinct order-days (real days only — no fabricated calendar). */
export function dailySeries(orders: AdminOrder[], count = 7): SalesPoint[] {
  const paid = revenueOrders(orders);
  if (!paid.length) return [];

  const byDate = new Map<string, SalesPoint>();
  for (const { o, p } of paid) {
    const prev = byDate.get(p.key) ?? {
      label: `${toFaDigits(p.d)}/${toFaDigits(p.m)}`,
      value: 0,
      count: 0,
    };
    prev.value += o.total;
    prev.count += 1;
    byDate.set(p.key, prev);
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-count)
    .map(([, v]) => v);
}

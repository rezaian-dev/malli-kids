"use client";

import Image from "next/image";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, Shirt, Truck, Users } from "lucide-react";
import { AdminPageHeader, AdminTable } from "@/components/admin";
import { SalesChart } from "./sales-chart";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { statusTone } from "@/lib/shop/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { AdminOrder, Product } from "@/types";

const META_TEXT = "text-navy/40 dark:text-wheat mt-0.5 text-[9px] font-bold";
const HIGHLIGHT_TEXT = "text-gold-deep dark:text-gold-soft font-black";

export function DashboardLanding({
  orders,
  products,
  activeCustomers,
}: {
  orders: AdminOrder[];
  products: Product[];
  activeCustomers: number;
}) {
  const sales = orders
    .filter((o) => o.pay === "پرداخت‌شده" && o.status !== "مرجوعی")
    .reduce((s, o) => s + o.total, 0);
  const avg = orders.length ? Math.round(sales / orders.length) : 0;
  const low = products.filter((p) => !p.stock).length;

  return (
    <div>
      <AdminPageHeader
        kicker="ATELIER"
        title="داشبورد گالری"
        description="نمای اجرایی فروش، رفتار مشتریان و سلامت موجودی برای تصمیم‌گیری سریع‌تر."
        action={
          <Button asChild variant="gold" className="h-11 px-5">
            <Link href="/admin/orders">
              <ShoppingBag className="size-4" /> سفارش‌های جدید
            </Link>
          </Button>
        }
      />

      {/* KPI hero — intentionally rich navy in both themes */}
      <div className="border-gold/25 relative mb-6 overflow-hidden rounded-[28px] border">
        <Image
          src="/brand/look-party.jpg"
          alt=""
          width={800}
          height={600}
          priority
          className="absolute inset-0 size-full object-cover opacity-20"
        />
        <div
          className={cn(
            "absolute inset-0",
            "from-navy-deep via-navy-deep/90 to-navy/75 bg-linear-to-l",
          )}
        />
        <div className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
          <Stat
            t="فروش این ماه"
            v={`${formatToman(sales)} ت`}
            d="سفارش‌های پرداخت‌شده"
            Icon={ShoppingBag}
          />
          <Stat
            t="میانگین سبد"
            v={`${formatToman(avg)} ت`}
            d="به ازای هر سفارش"
            Icon={Truck}
          />
          <Stat
            t="مشتری فعال"
            v={toFaDigits(activeCustomers)}
            d="کاربران فروشگاه"
            Icon={Users}
          />
          <Stat
            t="ناموجود"
            v={toFaDigits(low)}
            d="نیازمند تکمیل انبار"
            Icon={Shirt}
            warn={low > 0}
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.75fr]">
        <SalesChart orders={orders} />

        {/* Category share */}
        <section className={cn(adminGlassCard, "p-5 sm:p-6")}>
          <h2 className="text-navy dark:text-ivory mb-5 font-black">
            سهم دسته‌ها
          </h2>
          {["دخترانه", "پسرانه", "سیسمونی", "دستدوز"].map((c, i) => {
            const n = products.filter((p) => p.cat === c).length;
            const pct = Math.round((n / Math.max(1, products.length)) * 100);
            return (
              <div key={c} className="mb-3.5">
                <div className="mb-1.5 flex justify-between text-xs font-bold">
                  <span className="text-navy dark:text-ivory">{c}</span>
                  <span className="text-gold">{toFaDigits(pct)}٪</span>
                </div>
                <div className="bg-navy/8 dark:bg-navy-deep/70 h-2 overflow-hidden rounded-full">
                  <div
                    className="from-gold to-gold-glow h-full rounded-full bg-linear-to-l"
                    style={{ width: `${Math.max(10, pct + i * 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Latest orders — same responsive data-card system as the management pages. */}
      <AdminTable<AdminOrder>
        className="mt-6"
        header={
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-navy dark:text-ivory text-sm font-black">
                آخرین سفارش‌ها
              </h2>
              <p className={META_TEXT}>آخرین فعالیت‌های فروشگاه</p>
            </div>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "h-8 rounded-xl text-[10px] font-black",
                "text-gold hover:bg-gold/10 hover:text-gold-deep",
                "dark:hover:text-gold-soft",
              )}
            >
              <Link href="/admin/orders">
                همه سفارش‌ها <ArrowLeft className="size-3.5" />
              </Link>
            </Button>
          </div>
        }
        cols={[
          {
            key: "id",
            title: "شناسه",
            width: "9rem",
            render: (order) => (
              <span className={HIGHLIGHT_TEXT} dir="ltr">
                {order.id}
              </span>
            ),
          },
          {
            key: "customer",
            title: "مشتری",
            width: "1.3fr",
            render: (order) => (
              <div>
                <p>{order.customer}</p>
                <p className={META_TEXT}>{order.city}</p>
              </div>
            ),
          },
          {
            key: "date",
            title: "تاریخ",
            width: "7rem",
            align: "center",
            hideTablet: true,
            render: (order) => (
              <span className="text-navy/55 dark:text-wheat">{order.date}</span>
            ),
          },
          {
            key: "total",
            title: "مبلغ",
            width: "9rem",
            align: "center",
            render: (order) => (
              <span className={HIGHLIGHT_TEXT}>
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
              <Badge
                className={cn("rounded-lg border-0", statusTone(order.status))}
              >
                {order.status}
              </Badge>
            ),
          },
        ]}
        rows={orders.slice(0, 5)}
        minWidth="45rem"
      />
    </div>
  );
}

function Stat({
  t,
  v,
  d,
  Icon,
  warn,
}: {
  t: string;
  v: string;
  d: string;
  Icon: typeof ShoppingBag;
  warn?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[22px] border p-4 backdrop-blur-sm max-[639px]:rounded-[19px]",
        "border-gold/20 bg-navy-deep/55",
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-wheat text-[11px] font-black">{t}</p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-2xl",
            warn ? "bg-rose text-white" : "bg-gold text-navy-deep",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-ivory mt-3 text-xl font-black sm:text-2xl">{v}</p>
      <p className="text-ivory/45 mt-1 text-[11px] font-bold">{d}</p>
    </article>
  );
}

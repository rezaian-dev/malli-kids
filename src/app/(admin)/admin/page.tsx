"use client";

import Image from "next/image";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, Shirt, Truck, Users } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { formatToman, toFaDigits } from "@/lib/format";
import { statusTone } from "@/features/admin/lib/admin-data";
import { PageHead } from "@/features/admin";
import { SalesChart } from "@/features/admin";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminHome() {
  const { db } = useAdmin();
  const sales = db.orders.filter((o) => o.pay === "پرداخت‌شده" && o.status !== "مرجوعی").reduce((s, o) => s + o.total, 0);
  const avg = db.orders.length ? Math.round(sales / db.orders.length) : 0;
  const low = db.products.filter((p) => !p.stock).length;

  return (
    <div>
      <PageHead
        kicker="ATELIER"
        title="داشبورد گالری"
        action={
          <Button asChild variant="gold" className="h-11 px-5">
            <Link href="/admin/orders">
              <ShoppingBag className="size-4" /> سفارش‌های جدید
            </Link>
          </Button>
        }
      />

      {/* KPI hero — intentionally rich navy in both themes */}
      <div className="relative mb-6 overflow-hidden rounded-[28px] border border-gold/25">
        <Image src="/brand/look-party.jpg" alt="" width={800} height={600} className="absolute inset-0 size-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-linear-to-l from-navy-deep via-navy-deep/90 to-navy/75" />
        <div className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
          <Stat t="فروش این ماه" v={`${formatToman(sales)} ت`} d="سفارش‌های پرداخت‌شده" Icon={ShoppingBag} />
          <Stat t="میانگین سبد" v={`${formatToman(avg)} ت`} d="به ازای هر سفارش" Icon={Truck} />
          <Stat t="مشتری فعال" v={toFaDigits(db.customers.length)} d="مادران عضو" Icon={Users} />
          <Stat t="ناموجود" v={toFaDigits(low)} d="نیازمند تکمیل انبار" Icon={Shirt} warn={low > 0} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.75fr]">
        <SalesChart orders={db.orders} />

        {/* Category share */}
        <section className="admin-card p-5 sm:p-6">
          <h2 className="mb-5 font-black text-navy dark:text-ivory">سهم دسته‌ها</h2>
          {["دخترانه", "پسرانه", "سیسمونی", "دستدوز"].map((c, i) => {
            const n = db.products.filter((p) => p.cat === c).length;
            const pct = Math.round((n / Math.max(1, db.products.length)) * 100);
            return (
              <div key={c} className="mb-3.5">
                <div className="mb-1.5 flex justify-between text-xs font-bold">
                  <span className="text-navy dark:text-ivory">{c}</span>
                  <span className="text-gold">{toFaDigits(pct)}٪</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy/8 dark:bg-navy-deep/70">
                  <div className="h-full rounded-full bg-linear-to-l from-gold to-gold-glow" style={{ width: `${Math.max(10, pct + i * 4)}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Latest orders */}
      <section className="admin-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-black text-navy dark:text-ivory">آخرین سفارش‌ها</h2>
          <Button asChild variant="ghost" className="h-8 text-xs font-black text-gold hover:bg-gold/10 hover:text-gold-deep dark:hover:text-gold-soft">
            <Link href="/admin/orders">
              همه <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
        </div>
        <Separator className="bg-navy/8 dark:bg-gold/15" />
        <ScrollArea className="w-full">
          <Table className="min-w-[36rem] text-sm">
            <TableHeader className="bg-sand text-[11px] dark:bg-navy-deep/50">
              <TableRow className="border-0 hover:bg-transparent">
                {["کد", "مشتری", "مبلغ", "وضعیت"].map((h) => (
                  <TableHead key={h} className="h-auto px-4 py-3 text-right font-black text-navy/55 dark:text-wheat">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.orders.slice(0, 5).map((o) => (
                <TableRow key={o.id} className="border-navy/6 dark:border-gold/10">
                  <TableCell className="px-4 py-3 font-black text-navy dark:text-ivory">{o.id}</TableCell>
                  <TableCell className="px-4 py-3 text-navy/70 dark:text-wheat">{o.customer}</TableCell>
                  <TableCell className="px-4 py-3 font-bold text-gold-deep dark:text-gold-soft">{formatToman(o.total)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge className={cn("rounded-full border-0", statusTone(o.status))}>{o.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </section>
    </div>
  );
}

function Stat({ t, v, d, Icon, warn }: { t: string; v: string; d: string; Icon: typeof ShoppingBag; warn?: boolean }) {
  return (
    <article className="rounded-[22px] border border-gold/20 bg-navy-deep/55 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-black text-wheat">{t}</p>
        <span className={`grid size-9 place-items-center rounded-2xl ${warn ? "bg-rose text-white" : "bg-gold text-navy-deep"}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-xl font-black text-ivory sm:text-2xl">{v}</p>
      <p className="mt-1 text-[11px] font-bold text-ivory/45">{d}</p>
    </article>
  );
}

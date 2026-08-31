"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Banknote, Clock3, PackageCheck, RotateCcw, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Pagination } from "@/components/ui/pagination";
import { AdminFilterBar, AdminFilterSelect, AdminStatStrip, AdminPageHeader } from "@/components/admin";
import { AdminTable } from "@/components/admin/admin-table";
import { ORDER_FLOW, statusTone } from "@/lib/admin/admin-data";
import { usePagination } from "@/hooks/use-pagination";
import { setOrderStatus, useOrders, type Order } from "@/lib/orders";
import { formatToman, toFaDigits } from "@/lib/format";
import type { OrderStatus } from "@/types";

const PER_PAGE = 6;
type StatusFilter = "all" | OrderStatus;
type SortFilter = "newest" | "amount-desc" | "amount-asc" | "items";

export default function AdminOrders() {
  const all = useOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [open, setOpen] = useState<Order | null>(null);

  const cities = useMemo(() => Array.from(new Set(all.map((order) => order.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa")), [all]);
  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return all
      .filter((order) => {
        const matchesSearch = !term || `${order.id} ${order.customer} ${order.phone} ${order.city}`.toLocaleLowerCase("fa").includes(term);
        const matchesStatus = status === "all" || order.status === status;
        const matchesCity = city === "all" || order.city === city;
        return matchesSearch && matchesStatus && matchesCity;
      })
      .sort((a, b) => {
        if (sort === "amount-desc") return b.total - a.total;
        if (sort === "amount-asc") return a.total - b.total;
        if (sort === "items") return b.items.reduce((sum, item) => sum + item.qty, 0) - a.items.reduce((sum, item) => sum + item.qty, 0);
        return b.id.localeCompare(a.id, "fa");
      });
  }, [all, city, q, sort, status]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${city}|${sort}`);
  const activeFilters = Number(!!q.trim()) + Number(status !== "all") + Number(city !== "all") + Number(sort !== "newest");
  const totalSales = all.filter((order) => order.status !== "مرجوعی").reduce((sum, order) => sum + order.total, 0);
  const newCount = all.filter((order) => order.status === "جدید").length;
  const inProgress = all.filter((order) => order.status === "در حال آماده‌سازی" || order.status === "ارسال‌شده").length;
  const completed = all.filter((order) => order.status === "تحویل‌شده").length;

  return (
    <div>
      <AdminPageHeader kicker="ORDERS" title="مدیریت سفارش‌ها" description="پیگیری یکپارچه سفارش‌ها از لحظه ثبت تا پردازش، ارسال و تحویل نهایی." />

      <AdminStatStrip items={[
        { label: "سفارش جدید", value: newCount, Icon: Clock3, tone: "rose" },
        { label: "در حال پردازش", value: inProgress, Icon: ShoppingBag, tone: "gold" },
        { label: "تحویل‌شده", value: completed, Icon: PackageCheck, tone: "emerald" },
        { label: "ارزش سفارش‌ها", value: `${formatToman(totalSales)} ت`, Icon: Banknote, tone: "blue" },
      ]} />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="شناسه، مشتری، موبایل یا شهر…"
        resultCount={list.length}
        resultLabel="سفارش"
        activeCount={activeFilters}
        onReset={() => { setQ(""); setStatus("all"); setCity("all"); setSort("newest"); }}
      >
        <AdminFilterSelect
          label="وضعیت سفارش"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه وضعیت‌ها", count: all.length },
            ...ORDER_FLOW.map((item) => ({ value: item, label: item, count: all.filter((order) => order.status === item).length })),
          ]}
        />
        <AdminFilterSelect
          label="شهر مقصد"
          value={city}
          onValueChange={setCity}
          options={[{ value: "all", label: "همه شهرها" }, ...cities.map((item) => ({ value: item, label: item }))]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "amount-desc", label: "بیشترین مبلغ" },
            { value: "amount-asc", label: "کمترین مبلغ" },
            { value: "items", label: "بیشترین اقلام" },
          ]}
        />
      </AdminFilterBar>

      <AdminTable<Order>
        cols={[
          { key: "id", title: "شناسه سفارش", width: "8.5rem", render: (order) => <span className="font-black text-gold-deep dark:text-gold-soft" dir="ltr">{order.id}</span> },
          {
            key: "customer", title: "مشتری", width: "1.35fr", render: (order) => (
              <div className="min-w-0"><p className="truncate">{order.customer}</p><p className="mt-0.5 text-[10px] font-bold text-navy/40 dark:text-wheat" dir="ltr">{order.phone}</p></div>
            ),
          },
          { key: "city", title: "مقصد", width: "6rem", align: "center", hideTablet: true, render: (order) => order.city },
          { key: "date", title: "تاریخ", width: "7rem", align: "center", hideTablet: true, render: (order) => <span className="whitespace-nowrap text-navy/55 dark:text-wheat">{order.date}</span> },
          { key: "items", title: "اقلام", width: "4rem", align: "center", hideTablet: true, render: (order) => `${toFaDigits(order.items.reduce((sum, item) => sum + item.qty, 0))} قلم` },
          { key: "total", title: "مبلغ نهایی", width: "9rem", align: "center", render: (order) => <span className="whitespace-nowrap font-black text-gold-deep dark:text-gold-soft">{formatToman(order.total)} ت</span> },
          { key: "status", title: "وضعیت", width: "8rem", align: "center", render: (order) => <Badge className={`w-max rounded-lg border-0 ${statusTone(order.status)}`}>{order.status}</Badge> },
        ]}
        rows={pg.pageItems}
        empty="سفارشی مطابق فیلترهای انتخابی وجود ندارد."
        onRowClick={setOpen}
        minWidth="59rem"
      />
      {list.length > 0 ? <Pagination pg={pg} unit="سفارش" /> : null}

      <Sheet open={!!open} onOpenChange={(value) => !value && setOpen(null)}>
        <SheetContent side="right" className="w-full max-w-full gap-3 overflow-y-auto border-navy/10 bg-fog text-navy sm:w-104 sm:max-w-104 dark:border-gold/20 dark:bg-navy-deep dark:text-ivory">
          {open ? (
            <>
              <SheetHeader className="text-start">
                <SheetTitle className="text-navy dark:text-ivory">جزئیات سفارش</SheetTitle>
                <SheetDescription className="text-navy/50 dark:text-wheat" dir="ltr">{open.id}</SheetDescription>
              </SheetHeader>

              <div className="mx-4 rounded-2xl border border-navy/8 bg-white/70 p-3 dark:border-gold/14 dark:bg-white/[0.035]">
                <p className="font-black">{open.customer}</p>
                <p className="mt-1 text-xs text-navy/55 dark:text-wheat" dir="ltr">{open.phone}</p>
                <p className="mt-1 text-xs leading-6 text-navy/55 dark:text-wheat">{open.city} — {open.address}</p>
              </div>

              <Separator className="bg-navy/8 dark:bg-gold/15" />
              <ul className="space-y-2 px-4">
                {open.items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="flex items-center gap-3 rounded-2xl border border-navy/7 bg-white/70 p-2 dark:border-gold/12 dark:bg-white/[0.035]">
                    <Image src={item.img} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{item.name}</p><p className="mt-1 text-[10px] text-navy/50 dark:text-wheat">سایز {item.size} × {toFaDigits(item.qty)}</p></div>
                    <span className="shrink-0 text-[10px] font-black text-gold-deep dark:text-gold-soft">{formatToman(item.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="mx-4 space-y-2 rounded-2xl bg-navy/[0.035] p-4 text-xs dark:bg-white/[0.035]">
                <Row k="جمع کالا" v={formatToman(open.subtotal)} />
                <Row k="تخفیف" v={open.discount ? formatToman(open.discount) : "—"} />
                <Row k="ارسال" v={open.shipping ? formatToman(open.shipping) : "رایگان"} />
                <Separator className="my-2 bg-navy/8 dark:bg-gold/15" />
                <Row k="قابل پرداخت" v={`${formatToman(open.total)} تومان`} strong />
              </div>

              <div className="px-4 pb-5">
                <AdminFilterSelect
                  label="تغییر وضعیت سفارش"
                  value={open.status}
                  onValueChange={(value) => {
                    const next = value as OrderStatus;
                    setOrderStatus(open.id, next);
                    setOpen({ ...open, status: next });
                  }}
                  options={ORDER_FLOW.map((item) => ({ value: item, label: item }))}
                  className="w-full xl:w-full"
                />
                {open.status === "مرجوعی" ? <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-rose"><RotateCcw className="size-3" /> این سفارش در وضعیت مرجوعی قرار دارد.</p> : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3 font-bold"><span className="text-navy/55 dark:text-wheat">{k}</span><span className={strong ? "font-black text-navy dark:text-ivory" : "text-navy dark:text-ivory"}>{v}</span></div>;
}

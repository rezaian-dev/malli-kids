"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import { ORDER_FLOW, statusTone } from "@/features/admin/lib/admin-data";
import type { OrderStatus } from "@/types";
import { setOrderStatus, useOrders, type Order } from "@/lib/orders";
import { formatToman, toFaDigits } from "@/lib/format";
import { PageHead } from "@/features/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { AdminTable } from "@/features/admin/components/admin-table";

const PER_PAGE = 4;

export default function AdminOrders() {
  const all = useOrders();
  const [tab, setTab] = useState<"همه" | OrderStatus>("همه");
  const [open, setOpen] = useState<Order | null>(null);
  const list = useMemo(() => all.filter((o) => tab === "همه" || o.status === tab), [all, tab]);
  const pg = usePagination(list, PER_PAGE, tab);

  return (
    <div>
      <PageHead kicker="ORDERS" title="سفارش‌ها" />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">سفارش‌های واقعیِ کاربران؛ با هر تغییرِ وضعیت، کاربر هم در پنل و هم با اعلان باخبر می‌شود.</p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-5">
        <TabsList className="h-auto flex-wrap rounded-full border border-navy/10 bg-white p-1 dark:border-gold/25 dark:bg-navy-mid/80">
          {(["همه", ...ORDER_FLOW] as const).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-full px-3.5 py-1.5 text-[11px] font-black text-navy/60 transition-all data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-[0_6px_16px_-6px_rgba(14,42,71,.5)] dark:text-wheat dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AdminTable<Order>
        cols={[
          {
            key: "id",
            title: "شناسه",
            width: "8rem",
            render: (o) => <span className="font-black text-gold-deep dark:text-gold-soft">{o.id}</span>,
          },
          {
            key: "customer",
            title: "مشتری",
            width: "1.4fr",
            render: (o) => (
              <div className="min-w-0">
                <p className="truncate">{o.customer}</p>
                <p className="text-[11px] font-bold text-navy/40 dark:text-wheat" dir="ltr">
                  {o.phone}
                </p>
              </div>
            ),
          },
          {
            key: "meta",
            title: "شهر و تاریخ",
            width: "1.5fr",
            render: (o) => (
              <span className="font-semibold text-navy/60 dark:text-wheat">
                {o.city} · {o.date} · {toFaDigits(o.items.length)} قلم
              </span>
            ),
          },
          {
            key: "total",
            title: "مبلغ",
            width: "9.5rem",
            align: "center",
            render: (o) => <span className="whitespace-nowrap font-black text-gold-deep dark:text-gold-soft">{formatToman(o.total)} تومان</span>,
          },
          {
            key: "status",
            title: "وضعیت",
            width: "8rem",
            align: "center",
            render: (o) => <Badge className={`w-max rounded-full border-0 ${statusTone(o.status)}`}>{o.status}</Badge>,
          },
        ]}
        rows={pg.pageItems}
        empty="سفارشی در این وضعیت وجود ندارد."
        onRowClick={(o) => setOpen(o)}
        minWidth="52rem"
      />

      {list.length > 0 ? <Pagination pg={pg} unit="سفارش" /> : null}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="w-[min(88vw,420px)] gap-3 overflow-y-auto border-navy/10 bg-fog text-navy sm:max-w-[420px] dark:border-gold/25 dark:bg-navy-deep dark:text-ivory">
          {open ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-navy dark:text-ivory">{open.customer}</SheetTitle>
                <SheetDescription className="text-navy/50 dark:text-wheat">{open.id}</SheetDescription>
              </SheetHeader>
              <p className="px-4 text-sm" dir="ltr">
                {open.phone}
              </p>
              <p className="px-4 text-sm text-navy/55 dark:text-wheat">
                {open.city} — {open.address}
              </p>
              <Separator className="bg-navy/8 dark:bg-gold/20" />
              <ul className="space-y-2 px-4">
                {open.items.map((it) => (
                  <li key={`${it.id}-${it.size}`} className="flex items-center gap-3 rounded-2xl bg-white p-2 dark:bg-navy-mid">
                    <Image src={it.img} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-navy dark:text-ivory">{it.name}</p>
                      <p className="text-[11px] text-navy/50 dark:text-wheat">
                        سایز {it.size} × {toFaDigits(it.qty)}
                      </p>
                    </div>
                    <span className="text-xs font-black text-gold-deep dark:text-gold-soft">{formatToman(it.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1 px-4 text-sm">
                <Row k="جمع کالا" v={formatToman(open.subtotal)} />
                <Row k="تخفیف" v={open.discount ? formatToman(open.discount) : "—"} />
                <Row k="ارسال" v={open.shipping ? formatToman(open.shipping) : "رایگان"} />
                <Row k="قابل پرداخت" v={formatToman(open.total)} strong />
              </div>
              <p className="px-4 text-xs font-black text-gold">تغییر وضعیت</p>
              <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                {ORDER_FLOW.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant={open.status === s ? "gold" : "outline"}
                    className="h-8 rounded-full text-[11px]"
                    onClick={() => {
                      setOrderStatus(open.id, s);
                      setOpen({ ...open, status: s });
                    }}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between font-bold">
      <span className="text-navy/55 dark:text-wheat">{k}</span>
      <span className={strong ? "font-black text-navy dark:text-ivory" : "text-navy dark:text-ivory"}>{v}</span>
    </div>
  );
}

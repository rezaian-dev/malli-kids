"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/features/admin";
import { ORDER_FLOW, statusTone } from "@/features/admin/lib/admin-data";
import type { AdminOrder, OrderStatus } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { PageHead } from "@/features/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

const PER_PAGE = 4;

export default function AdminOrders() {
  const { db, setOrderStatus } = useAdmin();
  const [tab, setTab] = useState<"همه" | OrderStatus>("همه");
  const [open, setOpen] = useState<AdminOrder | null>(null);
  const list = useMemo(() => db.orders.filter((o) => tab === "همه" || o.status === tab), [db.orders, tab]);
  const pg = usePagination(list, PER_PAGE, tab);

  return (
    <div>
      <PageHead kicker="ORDERS" title="سفارش‌ها" />

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

      <div className="grid gap-3">
        {pg.pageItems.map((o) => (
          <button key={o.id} type="button" onClick={() => setOpen(o)} className="admin-card flex w-full flex-col gap-3 p-4 text-right transition hover:border-gold/40 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-gold">{o.id}</p>
              <p className="font-black text-navy dark:text-ivory">{o.customer}</p>
              <p className="mt-0.5 text-xs text-navy/50 dark:text-wheat">
                {o.city} · {o.date} · {toFaDigits(o.items.length)} قلم
              </p>
            </div>
            <p className="text-sm font-black text-gold-deep dark:text-gold-soft">{formatToman(o.total)} تومان</p>
            <Badge className={`w-max rounded-full border-0 ${statusTone(o.status)}`}>{o.status}</Badge>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="admin-card mt-2 p-8 text-center text-sm font-bold text-navy/45 dark:text-wheat">سفارشی در این وضعیت وجود ندارد.</p>
      ) : (
        <Pagination pg={pg} unit="سفارش" />
      )}

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
                    <img src={it.img} alt="" className="size-12 rounded-xl object-cover" />
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

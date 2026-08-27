"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdmin } from "@/lib/admin-store";
import { formatToman, toFaDigits } from "@/lib/format";
import type { AdminCoupon } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/lib/use-pagination";
import { PageHead } from "@/components/admin/shell";

const PER_PAGE = 8;

export default function AdminCoupons() {
  const { db, saveCoupons } = useAdmin();
  const [open, setOpen] = useState(false);
  const pg = usePagination(db.coupons, PER_PAGE);

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: AdminCoupon = {
      code: String(fd.get("code") || "").toUpperCase().trim(),
      title: String(fd.get("title") || ""),
      rate: Number(fd.get("rate") || 10) / 100,
      used: 0,
      cap: Number(fd.get("cap") || 100),
      active: true,
      min: Number(fd.get("min") || 0),
      until: String(fd.get("until") || "۱۴۰۵/۱۲/۲۹"),
    };
    if (!next.code) return;
    saveCoupons([next, ...db.coupons]);
    setOpen(false);
  }

  return (
    <div>
      <PageHead
        kicker="PROMOS"
        title="کدهای تخفیف"
        action={
          <Button type="button" variant="navy" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> کد جدید
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {pg.pageItems.map((c) => (
          <article key={c.code} className="lux-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl tracking-[0.12em] text-navy dark:text-gold-soft">{c.code}</p>
                <p className="mt-1 text-sm font-bold">{c.title}</p>
              </div>
              <Switch checked={c.active} onCheckedChange={(v) => saveCoupons(db.coupons.map((x) => (x.code === c.code ? { ...x, active: v } : x)))} />
            </div>
            <p className="mt-3 text-2xl font-black text-gold">{toFaDigits(Math.round(c.rate * 100))}٪</p>
            <p className="mt-2 text-xs text-navy/45 dark:text-wheat">
              مصرف {toFaDigits(c.used)} از {toFaDigits(c.cap)} · حداقل خرید {c.min ? `${formatToman(c.min)} ت` : "ندارد"}
            </p>
            <p className="mt-1 text-[11px] font-bold">تا {c.until}</p>
          </article>
        ))}
      </div>
      <Pagination pg={pg} unit="کد" />
      {open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-navy-deep/55" onClick={() => setOpen(false)} aria-label="بستن" />
          <form onSubmit={add} className="relative z-10 w-full max-w-md space-y-3 rounded-[28px] bg-paper p-6 dark:bg-dusk">
            <h3 className="text-lg font-black">کد جدید</h3>
            <Field name="code" label="کد" placeholder="MALLI10" />
            <Field name="title" label="عنوان" placeholder="تخفیف عضویت" />
            <div className="grid grid-cols-2 gap-3">
              <Field name="rate" label="درصد" type="number" placeholder="10" />
              <Field name="cap" label="سقف استفاده" type="number" placeholder="200" />
            </div>
            <Field name="min" label="حداقل خرید (تومان)" type="number" placeholder="0" />
            <Field name="until" label="انقضا" placeholder="۱۴۰۵/۱۲/۲۹" />
            <Button type="submit" variant="navy" className="h-11 w-full rounded-2xl">
              ذخیره
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <Label className="text-xs font-black">{label}</Label>
      <Input name={name} type={type} placeholder={placeholder} className="mt-1.5 h-11 rounded-2xl" />
    </div>
  );
}

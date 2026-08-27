"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { formatToman, toFaDigits } from "@/lib/format";
import { parseFaNumber } from "@/lib/forms";
import type { AdminCoupon } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";
import { AppForm, MoneyField, TextField, useAppForm } from "@/components/form";
import { couponDefaults, couponSchema, type CouponValues } from "./schema";

const PER_PAGE = 8;

export default function AdminCoupons() {
  const { db, saveCoupons } = useAdmin();
  const [open, setOpen] = useState(false);
  const pg = usePagination(db.coupons, PER_PAGE);
  const form = useAppForm({ schema: couponSchema, defaultValues: couponDefaults });

  function add(v: CouponValues) {
    const next: AdminCoupon = {
      code: v.code.toUpperCase(),
      title: v.title.trim(),
      rate: parseFaNumber(v.rate) / 100,
      used: 0,
      cap: parseFaNumber(v.cap),
      active: true,
      min: parseFaNumber(v.min) || 0,
      until: v.until,
    };
    if (db.coupons.some((c) => c.code === next.code)) {
      // تکرارِ کد خطایِ «سمتِ سرور» است؛ رویِ همانِ فیلد نشان داده می‌شود
      form.setError("code", { message: "این کد از قبل در فهرست است" });
      return;
    }
    saveCoupons([next, ...db.coupons]);
    close();
  }

  function close() {
    setOpen(false);
    form.reset({ ...couponDefaults });
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
          <button type="button" className="absolute inset-0 bg-navy-deep/55" onClick={close} aria-label="بستن" />
          <AppForm form={form} onSubmit={add} ariaLabel="کد تخفیف جدید" className="relative z-10 w-full max-w-md space-y-3 rounded-[28px] bg-paper p-6 dark:bg-dusk" notify>
            <h3 className="text-lg font-black">کد جدید</h3>
            <TextField
              name="code"
              label="کد"
              placeholder="MALLI10"
              dir="ltr"
              maxLength={16}
              inputClassName="uppercase tracking-[0.12em]"
              hint="لاتین، ۴ تا ۱۶ نویسه؛ خودکار بزرگ‌نویسی می‌شود"
              required
            />
            <TextField name="title" label="عنوان" placeholder="تخفیف عضویت" maxLength={60} required />
            <div className="grid grid-cols-2 gap-3">
              <TextField name="rate" label="درصد تخفیف" inputMode="numeric" placeholder="10" hint="۱ تا ۹۰" required />
              <TextField name="cap" label="سقف استفاده" inputMode="numeric" placeholder="200" hint="حداکثر ۱۰۰٬۰۰۰" required />
            </div>
            <MoneyField name="min" label="حداقل خرید (تومان)" hint="خالی بگذارید تا بدونِ حداقل باشد" />
            <TextField name="until" label="انقضا" dir="ltr" placeholder="1405/12/29" hint="شمسی و بعد ازِ امروز" required />
            <Button type="submit" variant="navy" className="h-11 w-full rounded-2xl">
              ذخیره
            </Button>
          </AppForm>
        </div>
      ) : null}
    </div>
  );
}

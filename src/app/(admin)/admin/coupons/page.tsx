"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleOff, Gauge, Percent, Plus, TicketPercent, X } from "lucide-react";

import { AppForm, MoneyField, TextField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { AdminFilterBar, AdminFilterSelect, AdminStatStrip, AdminPageHeader, useAdmin } from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { formatToman, toFaDigits } from "@/lib/format";
import { parseFaNumber } from "@/lib/forms";
import type { AdminCoupon } from "@/types";
import { couponDefaults, couponSchema, type CouponValues } from "./_lib/coupon-schema";

const PER_PAGE = 8;
type StatusFilter = "all" | "active" | "inactive" | "full";
type SortFilter = "default" | "usage" | "discount" | "expiry";

export default function AdminCoupons() {
  const { db, saveCoupons } = useAdmin();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("default");
  const form = useAppForm({ schema: couponSchema, defaultValues: couponDefaults });

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.coupons
      .filter((coupon) => {
        const matchesSearch = !term || `${coupon.code} ${coupon.title}`.toLocaleLowerCase("fa").includes(term);
        const matchesStatus = status === "all" || (status === "active" ? coupon.active && coupon.used < coupon.cap : status === "inactive" ? !coupon.active : coupon.used >= coupon.cap);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "usage") return b.used / Math.max(1, b.cap) - a.used / Math.max(1, a.cap);
        if (sort === "discount") return b.rate - a.rate;
        if (sort === "expiry") return a.until.localeCompare(b.until, "fa");
        return db.coupons.indexOf(a) - db.coupons.indexOf(b);
      });
  }, [db.coupons, q, sort, status]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${sort}`);
  const active = db.coupons.filter((coupon) => coupon.active && coupon.used < coupon.cap).length;
  const inactive = db.coupons.filter((coupon) => !coupon.active).length;
  const totalUsed = db.coupons.reduce((sum, coupon) => sum + coupon.used, 0);
  const activeFilters = Number(!!q.trim()) + Number(status !== "all") + Number(sort !== "default");

  function add(values: CouponValues) {
    const next: AdminCoupon = {
      code: values.code.toUpperCase(),
      title: values.title.trim(),
      rate: parseFaNumber(values.rate) / 100,
      used: 0,
      cap: parseFaNumber(values.cap),
      active: true,
      min: parseFaNumber(values.min) || 0,
      until: values.until,
    };
    if (db.coupons.some((coupon) => coupon.code === next.code)) {
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
      <AdminPageHeader
        kicker="PROMOTIONS"
        title="کدهای تخفیف"
        description="طراحی، فعال‌سازی و تحلیل کمپین‌های تخفیفی و میزان استفاده مشتریان."
        action={<Button type="button" variant="navy" className="h-11 rounded-xl" onClick={() => setOpen(true)}><Plus className="size-4" /> کد جدید</Button>}
      />

      <AdminStatStrip items={[
        { label: "کل کدها", value: db.coupons.length, Icon: TicketPercent, tone: "blue" },
        { label: "فعال", value: active, Icon: CircleCheck, tone: "emerald" },
        { label: "غیرفعال", value: inactive, Icon: CircleOff, tone: "rose" },
        { label: "دفعات استفاده", value: totalUsed, Icon: Gauge, tone: "gold" },
      ]} />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="کد یا عنوان کمپین…"
        resultCount={list.length}
        resultLabel="کد"
        activeCount={activeFilters}
        onReset={() => { setQ(""); setStatus("all"); setSort("default"); }}
      >
        <AdminFilterSelect label="وضعیت کد" value={status} onValueChange={(value) => setStatus(value as StatusFilter)} options={[
          { value: "all", label: "همه کدها", count: db.coupons.length },
          { value: "active", label: "فعال", count: active },
          { value: "inactive", label: "غیرفعال", count: inactive },
          { value: "full", label: "سقف تکمیل‌شده", count: db.coupons.filter((coupon) => coupon.used >= coupon.cap).length },
        ]} />
        <AdminFilterSelect label="مرتب‌سازی" value={sort} onValueChange={(value) => setSort(value as SortFilter)} options={[
          { value: "default", label: "ترتیب پیش‌فرض" },
          { value: "usage", label: "بیشترین مصرف" },
          { value: "discount", label: "بیشترین تخفیف" },
          { value: "expiry", label: "نزدیک‌ترین انقضا" },
        ]} />
      </AdminFilterBar>

      {list.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {pg.pageItems.map((coupon, index) => {
            const usage = Math.min(100, Math.round((coupon.used / Math.max(1, coupon.cap)) * 100));
            const usable = coupon.active && coupon.used < coupon.cap;
            return (
              <article key={coupon.code} className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] group overflow-hidden" style={{ animationDelay: `${index * 45}ms` }}>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-lg font-bold tracking-[0.1em] text-navy dark:text-gold-soft" dir="ltr">{coupon.code}</p>
                        <span className={`rounded-lg px-2 py-1 text-[9px] font-black ${usable ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose/10 text-rose"}`}>{usable ? "قابل استفاده" : coupon.used >= coupon.cap ? "سقف تکمیل" : "غیرفعال"}</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-navy/65 dark:text-wheat">{coupon.title}</p>
                    </div>
                    <Switch checked={coupon.active} onCheckedChange={(value) => saveCoupons(db.coupons.map((item) => item.code === coupon.code ? { ...item, active: value } : item))} aria-label={`فعال بودن ${coupon.code}`} />
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div><p className="text-[9px] font-black text-navy/40 dark:text-wheat">میزان تخفیف</p><p className="mt-0.5 text-3xl font-black text-gold-deep dark:text-gold-soft">{toFaDigits(Math.round(coupon.rate * 100))}<span className="text-base">٪</span></p></div>
                    <div className="text-end"><p className="text-[9px] font-black text-navy/40 dark:text-wheat">حداقل خرید</p><p className="mt-1 text-xs font-black text-navy dark:text-ivory">{coupon.min ? `${formatToman(coupon.min)} ت` : "بدون محدودیت"}</p></div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold text-navy/45 dark:text-wheat"><span>مصرف {toFaDigits(coupon.used)} از {toFaDigits(coupon.cap)}</span><span>{toFaDigits(usage)}٪</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-navy/7 dark:bg-navy-deep"><div className={`h-full rounded-full transition-all duration-700 ${usage >= 90 ? "bg-rose" : "bg-linear-to-l from-gold to-gold-light"}`} style={{ width: `${usage}%` }} /></div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-navy/6 bg-navy/[0.015] px-4 py-2.5 text-[10px] dark:border-gold/12 dark:bg-white/[0.015]"><span className="font-bold text-navy/40 dark:text-wheat">تاریخ انقضا</span><span className="font-black text-navy dark:text-ivory">{coupon.until}</span></div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] px-5 py-14 text-center"><TicketPercent className="mx-auto size-10 text-gold" /><p className="mt-3 text-sm font-black">کد تخفیفی مطابق فیلترها نیست</p></div>
      )}
      {list.length > 0 ? <Pagination pg={pg} unit="کد" /> : null}

      {open ? (
        <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto p-3 sm:p-4">
          <button type="button" className="fixed inset-0 bg-navy-deep/65 backdrop-blur-sm" onClick={close} aria-label="بستن" />
          <AppForm form={form} onSubmit={add} ariaLabel="کد تخفیف جدید" className="relative z-10 my-auto w-full max-w-md space-y-3 rounded-[24px] border border-gold/18 bg-paper p-4 shadow-2xl dark:bg-navy-mid sm:p-6" notify>
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] font-black tracking-[.2em] text-gold">NEW PROMO</p><h3 className="mt-1 text-lg font-black">کد تخفیف جدید</h3></div><button type="button" onClick={close} className="grid size-9 place-items-center rounded-xl bg-navy/5 text-navy dark:bg-white/7 dark:text-ivory" aria-label="بستن"><X className="size-4" /></button></div>
            <TextField name="code" label="کد" placeholder="MALLI10" dir="ltr" maxLength={16} inputClassName="uppercase tracking-[0.12em]" hint="لاتین، ۴ تا ۱۶ نویسه" required />
            <TextField name="title" label="عنوان" placeholder="تخفیف عضویت" maxLength={60} required />
            <div className="grid grid-cols-2 gap-3"><TextField name="rate" label="درصد تخفیف" inputMode="numeric" placeholder="10" hint="۱ تا ۹۰" required /><TextField name="cap" label="سقف استفاده" inputMode="numeric" placeholder="200" hint="حداکثر ۱۰۰٬۰۰۰" required /></div>
            <MoneyField name="min" label="حداقل خرید (تومان)" hint="خالی = بدون حداقل" />
            <TextField name="until" label="انقضا" dir="ltr" placeholder="1405/12/29" hint="تاریخ شمسی" required />
            <Button type="submit" variant="navy" className="h-11 w-full rounded-xl"><Percent className="size-4" /> ذخیره کد</Button>
          </AppForm>
        </div>
      ) : null}
    </div>
  );
}

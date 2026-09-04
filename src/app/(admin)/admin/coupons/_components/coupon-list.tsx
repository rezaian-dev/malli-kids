"use client";

import { useMemo, useState, useTransition } from "react";
import { CircleCheck, CircleOff, Gauge, TicketPercent } from "lucide-react";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
} from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { usePagination } from "@/hooks/use-pagination";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { AdminCoupon } from "@/types";
import { setCouponActiveAction } from "../_lib/actions";

const PER_PAGE = 8;
type StatusFilter = "all" | "active" | "inactive" | "full";
type SortFilter = "default" | "usage" | "discount" | "expiry";

const STAT_LABEL = "text-navy/70 dark:text-wheat text-[9px] font-black";

/** 🎟️ Filterable/paginated coupon grid with an inline active/inactive
 *  switch per card. */
export function CouponList({ coupons }: { coupons: AdminCoupon[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("default");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return coupons
      .filter((coupon) => {
        const matchesSearch =
          !term ||
          `${coupon.code} ${coupon.title}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesStatus =
          status === "all" ||
          (status === "active"
            ? coupon.active && coupon.used < coupon.cap
            : status === "inactive"
              ? !coupon.active
              : coupon.used >= coupon.cap);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "usage") {
          return b.used / Math.max(1, b.cap) - a.used / Math.max(1, a.cap);
        }
        if (sort === "discount") return b.rate - a.rate;
        if (sort === "expiry") return a.until.localeCompare(b.until, "fa");
        return coupons.indexOf(a) - coupons.indexOf(b);
      });
  }, [coupons, q, sort, status]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${sort}`);
  const active = coupons.filter(
    (coupon) => coupon.active && coupon.used < coupon.cap,
  ).length;
  const inactive = coupons.filter((coupon) => !coupon.active).length;
  const totalUsed = coupons.reduce((sum, coupon) => sum + coupon.used, 0);
  const activeFilters =
    Number(!!q.trim()) + Number(status !== "all") + Number(sort !== "default");

  return (
    <>
      <AdminStatStrip
        items={[
          {
            label: "کل کدها",
            value: coupons.length,
            Icon: TicketPercent,
            tone: "blue",
          },
          { label: "فعال", value: active, Icon: CircleCheck, tone: "emerald" },
          { label: "غیرفعال", value: inactive, Icon: CircleOff, tone: "rose" },
          {
            label: "دفعات استفاده",
            value: totalUsed,
            Icon: Gauge,
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="کد یا عنوان کمپین…"
        resultCount={list.length}
        resultLabel="کد"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
          setSort("default");
        }}
      >
        <AdminFilterSelect
          label="وضعیت کد"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه کدها", count: coupons.length },
            { value: "active", label: "فعال", count: active },
            { value: "inactive", label: "غیرفعال", count: inactive },
            {
              value: "full",
              label: "سقف تکمیل‌شده",
              count: coupons.filter((coupon) => coupon.used >= coupon.cap)
                .length,
            },
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "default", label: "ترتیب پیش‌فرض" },
            { value: "usage", label: "بیشترین مصرف" },
            { value: "discount", label: "بیشترین تخفیف" },
            { value: "expiry", label: "نزدیک‌ترین انقضا" },
          ]}
        />
      </AdminFilterBar>

      {list.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {pg.pageItems.map((coupon, index) => {
            const usage = Math.min(
              100,
              Math.round((coupon.used / Math.max(1, coupon.cap)) * 100),
            );
            const usable = coupon.active && coupon.used < coupon.cap;
            return (
              <article
                key={coupon.code}
                className={cn(adminGlassCard, "group")}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "font-display truncate text-lg font-bold tracking-widest",
                            "text-navy",
                            "dark:text-gold-soft",
                          )}
                          dir="ltr"
                        >
                          {coupon.code}
                        </p>
                        <span
                          className={cn(
                            "rounded-lg px-2 py-1 text-[9px] font-black",
                            usable
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose/10 text-rose",
                          )}
                        >
                          {usable
                            ? "قابل استفاده"
                            : coupon.used >= coupon.cap
                              ? "سقف تکمیل"
                              : "غیرفعال"}
                        </span>
                      </div>
                      <p className="text-navy/70 dark:text-wheat mt-1 truncate text-xs font-bold">
                        {coupon.title}
                      </p>
                    </div>
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={(value) =>
                        startTransition(async () => {
                          const result = await setCouponActiveAction(
                            coupon.code,
                            value,
                          );
                          if (!result.ok) toast.error(result.error);
                        })
                      }
                      aria-label={`فعال بودن ${coupon.code}`}
                    />
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className={STAT_LABEL}>میزان تخفیف</p>
                      <p className="text-gold-deep dark:text-gold-soft mt-0.5 text-3xl font-black">
                        {toFaDigits(Math.round(coupon.rate * 100))}
                        <span className="text-base">٪</span>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className={STAT_LABEL}>حداقل خرید</p>
                      <p className="text-navy dark:text-ivory mt-1 text-xs font-black">
                        {coupon.min
                          ? `${formatToman(coupon.min)} ت`
                          : "بدون محدودیت"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-navy/70 dark:text-wheat mb-1.5 flex items-center justify-between text-[9px] font-bold">
                      <span>
                        مصرف {toFaDigits(coupon.used)} از{" "}
                        {toFaDigits(coupon.cap)}
                      </span>
                      <span>{toFaDigits(usage)}٪</span>
                    </div>
                    <div className="bg-navy/7 dark:bg-navy-deep h-1.5 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          usage >= 90
                            ? "bg-rose"
                            : "from-gold to-gold-light bg-linear-to-l",
                        )}
                        style={{ width: `${usage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-4 py-2.5 text-[10px]",
                    "border-navy/6 bg-navy/1.5",
                    "dark:border-gold/12 dark:bg-white/1.5",
                  )}
                >
                  <span className="text-navy/70 dark:text-wheat font-bold">
                    تاریخ انقضا
                  </span>
                  <span className="text-navy dark:text-ivory font-black">
                    {coupon.until}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={cn(adminGlassCard, "px-5 py-14 text-center")}>
          <TicketPercent className="text-gold mx-auto size-10" />
          <p className="mt-3 text-sm font-black">
            کد تخفیفی مطابق فیلترها نیست
          </p>
        </div>
      )}
      {list.length > 0 ? <Pagination pg={pg} unit="کد" /> : null}
    </>
  );
}

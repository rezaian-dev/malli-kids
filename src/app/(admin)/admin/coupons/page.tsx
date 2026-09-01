"use client";

import { useMemo, useState, type ComponentProps, type FormEvent } from "react";
import {
  CircleCheck,
  CircleOff,
  Gauge,
  Percent,
  Plus,
  TicketPercent,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  useAdmin,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { parseFaNumber, toLatinDigits } from "@/lib/digits";
import { formatToman, toFaDigits } from "@/lib/format";
import { isJalaliFuture, jalaliParts } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { AdminCoupon } from "@/types";

const PER_PAGE = 8;
type StatusFilter = "all" | "active" | "inactive" | "full";
type SortFilter = "default" | "usage" | "discount" | "expiry";

type CouponFormValues = {
  code: string;
  title: string;
  rate: string;
  cap: string;
  min: string;
  until: string;
};

type CouponFormErrors = Partial<Record<keyof CouponFormValues, string>>;

const STAT_LABEL = "text-navy/40 dark:text-wheat text-[9px] font-black";

const COUPON_DEFAULTS: CouponFormValues = {
  code: "",
  title: "",
  rate: "10",
  cap: "200",
  min: "0",
  until: "",
};

function validateCouponForm(values: CouponFormValues): CouponFormErrors {
  const errors: CouponFormErrors = {};
  const code = values.code.trim().toUpperCase();
  const title = values.title.trim();
  const rate = parseFaNumber(values.rate);
  const cap = parseFaNumber(values.cap);
  const minimum = values.min.trim();
  const normalizedDate = toLatinDigits(values.until)
    .trim()
    .replace(/[.\u200c\-]/g, "/");

  if (!/^[A-Za-z0-9_-]{4,16}$/.test(code)) {
    errors.code = "فقط حروف و عدد لاتین، بین ۴ تا ۱۶ نویسه";
  }

  if (title.length < 3) errors.title = "عنوان باید حداقل ۳ حرف باشد";
  else if (title.length > 60) errors.title = "عنوان حداکثر ۶۰ نویسه است";

  if (!Number.isInteger(rate) || rate < 1 || rate > 90) {
    errors.rate = "درصد تخفیف باید بین ۱ تا ۹۰ باشد";
  }

  if (!Number.isInteger(cap) || cap < 1 || cap > 100_000) {
    errors.cap = "سقف استفاده باید بین ۱ تا ۱۰۰٬۰۰۰ باشد";
  }

  if (minimum) {
    const minValue = parseFaNumber(minimum);
    if (!Number.isFinite(minValue) || minValue < 0 || minValue > 500_000_000) {
      errors.min = "حداقل خرید باید بین ۰ تا ۵۰۰٬۰۰۰٬۰۰۰ باشد";
    }
  }

  if (!jalaliParts(normalizedDate)) {
    errors.until = "تاریخ شمسی را کامل بنویسید؛ ماه ۰۱ تا ۱۲ و روز تا ۳۱";
  } else if (!isJalaliFuture(normalizedDate)) {
    errors.until = "انقضا باید بعد ازِ امروز باشد";
  }

  return errors;
}

export default function AdminCoupons() {
  const { db, saveCoupons } = useAdmin();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("default");
  const [formValues, setFormValues] =
    useState<CouponFormValues>(COUPON_DEFAULTS);
  const [formErrors, setFormErrors] = useState<CouponFormErrors>({});

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.coupons
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
        return db.coupons.indexOf(a) - db.coupons.indexOf(b);
      });
  }, [db.coupons, q, sort, status]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${sort}`);
  const active = db.coupons.filter(
    (coupon) => coupon.active && coupon.used < coupon.cap,
  ).length;
  const inactive = db.coupons.filter((coupon) => !coupon.active).length;
  const totalUsed = db.coupons.reduce((sum, coupon) => sum + coupon.used, 0);
  const activeFilters =
    Number(!!q.trim()) + Number(status !== "all") + Number(sort !== "default");

  function updateFormField<K extends keyof CouponFormValues>(
    field: K,
    value: CouponFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function addCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCouponForm(formValues);
    const nextCode = formValues.code.trim().toUpperCase();

    if (db.coupons.some((coupon) => coupon.code === nextCode)) {
      nextErrors.code = "این کد از قبل در فهرست است";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const next: AdminCoupon = {
      code: nextCode,
      title: formValues.title.trim(),
      rate: parseFaNumber(formValues.rate) / 100,
      used: 0,
      cap: parseFaNumber(formValues.cap),
      active: true,
      min: parseFaNumber(formValues.min) || 0,
      until: toLatinDigits(formValues.until)
        .trim()
        .replace(/[.\u200c\-]/g, "/"),
    };

    saveCoupons([next, ...db.coupons]);
    close();
  }

  function close() {
    setOpen(false);
    setFormValues(COUPON_DEFAULTS);
    setFormErrors({});
  }

  return (
    <div>
      <AdminPageHeader
        kicker="PROMOTIONS"
        title="کدهای تخفیف"
        description="طراحی، فعال‌سازی و تحلیل کمپین‌های تخفیفی و میزان استفاده مشتریان."
        action={
          <Button
            type="button"
            variant="navy"
            className="h-11 rounded-xl"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4" /> کد جدید
          </Button>
        }
      />

      <AdminStatStrip
        items={[
          {
            label: "کل کدها",
            value: db.coupons.length,
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
            { value: "all", label: "همه کدها", count: db.coupons.length },
            { value: "active", label: "فعال", count: active },
            { value: "inactive", label: "غیرفعال", count: inactive },
            {
              value: "full",
              label: "سقف تکمیل‌شده",
              count: db.coupons.filter((coupon) => coupon.used >= coupon.cap)
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
                      <p className="text-navy/65 dark:text-wheat mt-1 truncate text-xs font-bold">
                        {coupon.title}
                      </p>
                    </div>
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={(value) =>
                        saveCoupons(
                          db.coupons.map((item) =>
                            item.code === coupon.code
                              ? { ...item, active: value }
                              : item,
                          ),
                        )
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
                    <div className="text-navy/45 dark:text-wheat mb-1.5 flex items-center justify-between text-[9px] font-bold">
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
                  <span className="text-navy/40 dark:text-wheat font-bold">
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

      {open ? (
        <div className="fixed inset-0 z-90 grid place-items-center overflow-y-auto p-3 sm:p-4">
          <button
            type="button"
            className="bg-navy-deep/65 fixed inset-0 backdrop-blur-sm"
            onClick={close}
            aria-label="بستن"
          />
          <form
            onSubmit={addCoupon}
            noValidate
            aria-label="کد تخفیف جدید"
            className={cn(
              "relative z-10 my-auto w-full max-w-md space-y-3 rounded-3xl border p-4 shadow-2xl sm:p-6",
              "border-gold/18 bg-paper",
              "dark:bg-navy-mid",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-gold text-[9px] font-black tracking-[.2em]">
                  NEW PROMO
                </p>
                <h3 className="mt-1 text-lg font-black">کد تخفیف جدید</h3>
              </div>
              <button
                type="button"
                onClick={close}
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  "bg-navy/5 text-navy",
                  "dark:text-ivory dark:bg-white/7",
                )}
                aria-label="بستن"
              >
                <X className="size-4" />
              </button>
            </div>

            <CouponField
              id="coupon-code"
              label="کد"
              value={formValues.code}
              onChange={(value) => updateFormField("code", value.toUpperCase())}
              placeholder="MALLI10"
              dir="ltr"
              maxLength={16}
              error={formErrors.code}
              className="tracking-[0.12em] uppercase"
              required
            />
            <CouponField
              id="coupon-title"
              label="عنوان"
              value={formValues.title}
              onChange={(value) => updateFormField("title", value)}
              placeholder="تخفیف عضویت"
              maxLength={60}
              error={formErrors.title}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <CouponField
                id="coupon-rate"
                label="درصد تخفیف"
                value={formValues.rate}
                onChange={(value) => updateFormField("rate", value)}
                inputMode="numeric"
                placeholder="10"
                error={formErrors.rate}
                required
              />
              <CouponField
                id="coupon-cap"
                label="سقف استفاده"
                value={formValues.cap}
                onChange={(value) => updateFormField("cap", value)}
                inputMode="numeric"
                placeholder="200"
                error={formErrors.cap}
                required
              />
            </div>

            <CouponField
              id="coupon-min"
              label="حداقل خرید (تومان)"
              value={formValues.min}
              onChange={(value) => updateFormField("min", value)}
              inputMode="numeric"
              placeholder="0"
              error={formErrors.min}
            />
            <CouponField
              id="coupon-until"
              label="انقضا"
              value={formValues.until}
              onChange={(value) => updateFormField("until", value)}
              dir="ltr"
              placeholder="1405/12/29"
              error={formErrors.until}
              required
            />

            <Button
              type="submit"
              variant="navy"
              className="h-11 w-full rounded-xl"
            >
              <Percent className="size-4" /> ذخیره کد
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function CouponField({
  id,
  label,
  value,
  onChange,
  error,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-navy/55 dark:text-wheat text-xs font-black"
        htmlFor={id}
      >
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 rounded-2xl bg-transparent px-4 text-sm",
          "border-navy/12",
          "dark:border-gold/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-rose text-xs font-bold">
          {error}
        </p>
      ) : null}
    </div>
  );
}

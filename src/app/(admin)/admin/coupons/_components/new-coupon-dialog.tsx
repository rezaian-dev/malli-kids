"use client";

import { useState, type FormEvent } from "react";
import { Percent, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseFaNumber, toLatinDigits } from "@/lib/digits";
import { isJalaliFuture, jalaliParts } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import type { AdminCoupon } from "@/types";
import { CouponField } from "./coupon-field";

type CouponFormValues = {
  code: string;
  title: string;
  rate: string;
  cap: string;
  min: string;
  until: string;
};

type CouponFormErrors = Partial<Record<keyof CouponFormValues, string>>;

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
    .replace(/[.‌\-]/g, "/");

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

/** ➕ The "new coupon" modal form — validates locally, then hands a
 *  ready-to-save `AdminCoupon` up to the caller. */
export function NewCouponDialog({
  open,
  existingCodes,
  onClose,
  onCreate,
}: {
  open: boolean;
  existingCodes: string[];
  onClose: () => void;
  onCreate: (coupon: AdminCoupon) => void;
}) {
  const [formValues, setFormValues] =
    useState<CouponFormValues>(COUPON_DEFAULTS);
  const [formErrors, setFormErrors] = useState<CouponFormErrors>({});

  if (!open) return null;

  function updateFormField<K extends keyof CouponFormValues>(
    field: K,
    value: CouponFormValues[K],
  ) {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function close() {
    setFormValues(COUPON_DEFAULTS);
    setFormErrors({});
    onClose();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCouponForm(formValues);
    const nextCode = formValues.code.trim().toUpperCase();

    if (existingCodes.includes(nextCode)) {
      nextErrors.code = "این کد از قبل در فهرست است";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    onCreate({
      code: nextCode,
      title: formValues.title.trim(),
      rate: parseFaNumber(formValues.rate) / 100,
      used: 0,
      cap: parseFaNumber(formValues.cap),
      active: true,
      min: parseFaNumber(formValues.min) || 0,
      until: toLatinDigits(formValues.until)
        .trim()
        .replace(/[.‌\-]/g, "/"),
    });
    close();
  }

  return (
    <div className="fixed inset-0 z-90 grid place-items-center overflow-y-auto p-3 sm:p-4">
      <button
        type="button"
        className="bg-navy-deep/65 fixed inset-0 backdrop-blur-sm"
        onClick={close}
        aria-label="بستن"
      />
      <form
        onSubmit={submit}
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

        <Button type="submit" variant="navy" className="h-11 w-full rounded-xl">
          <Percent className="size-4" /> ذخیره کد
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { parseFaNumber } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import { isJalaliFuture, jalaliParts } from "@/lib/locale/jalali";
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
  const normalizedDate = toEnDigits(values.until)
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
 *  ready-to-save `AdminCoupon` up to the caller. Built on the shared Radix
 *  `Dialog` primitive (focus trap, focus return, Escape-to-close, and
 *  `DialogTitle` labelling all come from there — matching every other
 *  dialog/sheet in the app instead of a hand-rolled overlay). */
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
      until: toEnDigits(formValues.until)
        .trim()
        .replace(/[.‌\-]/g, "/"),
    });
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : close())}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-w-md rounded-3xl p-4 sm:p-6",
          "border-gold/18 bg-paper border",
          "dark:bg-navy-mid dark:border-gold/18",
        )}
      >
        <div>
          <p className="text-gold text-[9px] font-black tracking-[.2em]">
            NEW PROMO
          </p>
          <DialogTitle className="mt-1 text-lg font-black">
            کد تخفیف جدید
          </DialogTitle>
        </div>

        <form onSubmit={submit} noValidate className="space-y-3">
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
      </DialogContent>
    </Dialog>
  );
}

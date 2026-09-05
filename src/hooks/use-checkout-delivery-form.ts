"use client";

import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits, toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { useAppForm } from "@/components/form";
import { checkCouponAction } from "@/lib/shop/checkout-actions";
import type { AppliedCoupon } from "@/lib/shop/coupons";
import type { User } from "@/types";

// 🧾 Delivery-form + coupon state shared by both checkout dialogs; each
// keeps only its own submit call and item markup. Validation is the usual
// react-hook-form + zod combo
export const deliverySchema = z.object({
  city: z.string().trim().min(2, "شهر را بنویسید").max(60),
  address: z.string().trim().min(10, "آدرس کامل را بنویسید").max(300),
  phone: z
    .string()
    .refine((v) => phoneDigits(v).length === 11, "شمارهٔ موبایل ۱۱ رقمی بنویسید"),
  postal: z
    .string()
    .refine(
      (v) => toEnDigits(v).replace(/\D/g, "").length === 10,
      "کد پستیِ ۱۰ رقمی بنویسید",
    ),
});

export type DeliveryValues = z.infer<typeof deliverySchema>;

function deliveryDefaults(user: Pick<User, "city" | "address" | "phone" | "postalCode"> | null) {
  return {
    city: user?.city || "",
    address: user?.address || "",
    phone: user?.phone || "",
    postal: user?.postalCode || "",
  };
}

export function useCheckoutDeliveryForm({
  open,
  user,
  subtotal,
}: {
  open: boolean;
  user: Pick<User, "city" | "address" | "phone" | "postalCode"> | null;
  subtotal: number;
}) {
  const form = useAppForm({
    schema: deliverySchema,
    defaultValues: deliveryDefaults(user),
  });

  const [couponIn, setCouponIn] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [couponBad, setCouponBad] = useState(false);
  const [couponPending, startCouponTransition] = useTransition();
  // 🔁 One idempotency key per attempt while this dialog is open
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  // 🔄 Re-sync from the profile every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    form.reset(deliveryDefaults(user));
    setIdempotencyKey(crypto.randomUUID());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;

  function applyCoupon() {
    const code = toEnDigits(couponIn).trim().toUpperCase();
    if (!code) return;

    startCouponTransition(async () => {
      const hit = await checkCouponAction(code, subtotal);
      if (hit) {
        setApplied(hit);
        setCouponBad(false);
        toast(
          `کد ${hit.code} اعمال شد — ${toFaDigits(Math.round(hit.rate * 100))}٪ تخفیف 🎉`,
        );
      } else {
        setApplied(null);
        setCouponBad(true);
      }
    });
  }

  /** 📦 The delivery fields shaped exactly as both order-creating actions
   *  expect them (trimmed / digit-normalized). */
  function deliveryPayload(values: DeliveryValues) {
    return {
      city: values.city.trim(),
      address: values.address.trim(),
      phone: phoneDigits(values.phone),
      postalCode: toEnDigits(values.postal).replace(/\D/g, ""),
    };
  }

  return {
    form,
    couponIn,
    setCouponIn,
    applied,
    couponBad,
    setCouponBad,
    couponPending,
    idempotencyKey,
    discount,
    applyCoupon,
    deliveryPayload,
  };
}

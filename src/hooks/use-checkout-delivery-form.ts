"use client";

import { useEffect, useState, useTransition } from "react";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits, toFaDigits } from "@/lib/locale/fa";
import { checkCouponAction } from "@/lib/shop/checkout-actions";
import type { AppliedCoupon } from "@/lib/shop/coupons";
import type { User } from "@/types";

/** 🧾 The delivery-form + coupon state shared by `CheckoutDialog` (single
 *  item) and `CartCheckoutDialog` (whole cart) — both dialogs mirror each
 *  other's city/address/phone/postal fields, coupon flow, validation, and
 *  idempotency-key handling. What stays in each dialog instead: the actual
 *  submit call (different action + payload shape per dialog) and the
 *  item-summary markup (single product card vs a scrollable row list). */
export function useCheckoutDeliveryForm({
  open,
  user,
  subtotal,
  showToast,
}: {
  open: boolean;
  user: Pick<User, "city" | "address" | "phone" | "postalCode"> | null;
  subtotal: number;
  showToast: (message: string) => void;
}) {
  const [city, setCity] = useState(user?.city || "");
  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [postal, setPostal] = useState(user?.postalCode || "");
  const [couponIn, setCouponIn] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [couponBad, setCouponBad] = useState(false);
  const [pending, startTransition] = useTransition();
  // 🔁 One key per checkout attempt — a double-click or a retried request
  // while this same dialog is open reuses it, so the server collapses them
  // into the one order; reopening the dialog for a new purchase gets a
  // fresh key.
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  // 🔄 Re-sync from the profile every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setCity(user?.city || "");
    setAddress(user?.address || "");
    setPhone(user?.phone || "");
    setPostal(user?.postalCode || "");
    setIdempotencyKey(crypto.randomUUID());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const discount = applied ? Math.round(subtotal * applied.rate) : 0;

  function applyCoupon() {
    const code = toEnDigits(couponIn).trim().toUpperCase();
    if (!code) return;

    startTransition(async () => {
      const hit = await checkCouponAction(code, subtotal);
      if (hit) {
        setApplied(hit);
        setCouponBad(false);
        showToast(
          `کد ${hit.code} اعمال شد — ${toFaDigits(Math.round(hit.rate * 100))}٪ تخفیف 🎉`,
        );
      } else {
        setApplied(null);
        setCouponBad(true);
      }
    });
  }

  /** ✅ Same 4 checks, same order, same Persian messages both dialogs used
   *  inline before — returns the first failing message, or `null` if the
   *  delivery form is good to submit. */
  function validateDelivery(): string | null {
    if (city.trim().length < 2) return "شهر را بنویسید";
    if (address.trim().length < 10) return "آدرس کامل را بنویسید";
    if (phoneDigits(phone).length !== 11) return "شمارهٔ موبایل ۱۱ رقمی بنویسید";
    if (toEnDigits(postal).replace(/\D/g, "").length !== 10)
      return "کد پستیِ ۱۰ رقمی بنویسید";
    return null;
  }

  /** 📦 The delivery fields shaped exactly as both order-creating actions
   *  expect them (trimmed / digit-normalized). */
  function deliveryPayload() {
    return {
      city: city.trim(),
      address: address.trim(),
      phone: phoneDigits(phone),
      postalCode: toEnDigits(postal).replace(/\D/g, ""),
    };
  }

  return {
    city,
    setCity,
    address,
    setAddress,
    phone,
    setPhone,
    postal,
    setPostal,
    couponIn,
    setCouponIn,
    applied,
    couponBad,
    setCouponBad,
    pending,
    startTransition,
    idempotencyKey,
    discount,
    applyCoupon,
    validateDelivery,
    deliveryPayload,
  };
}

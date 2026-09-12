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
export type DeliveryErrors = {
  city?: string;
  address?: string;
  phone?: string;
  postal?: string;
};

/** ✅ Same 4 checks both dialogs need — as a map (one message per invalid
 *  field) instead of "first failing message", so the form can show every
 *  problem inline next to its own field instead of one toast at a time. */
function computeErrors(
  city: string,
  address: string,
  phone: string,
  postal: string,
): DeliveryErrors {
  const errors: DeliveryErrors = {};
  if (city.trim().length < 2) errors.city = "شهر را بنویسید";
  if (address.trim().length < 10) errors.address = "آدرس کامل را بنویسید";
  if (phoneDigits(phone).length !== 11)
    errors.phone = "شمارهٔ موبایل ۱۱ رقمی بنویسید";
  if (toEnDigits(postal).replace(/\D/g, "").length !== 10)
    errors.postal = "کد پستیِ ۱۰ رقمی بنویسید";
  return errors;
}

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
  // ♿ Errors only render once a submit has actually been attempted — so
  // the form doesn't greet an untouched dialog with four red fields.
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? computeErrors(city, address, phone, postal) : {};
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
    setAttempted(false);
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

  /** ✅ Marks the form "attempted" (so `errors` above starts showing inline)
   *  and returns whether it's clean — the one gate `submitOrder` needs
   *  before calling the real order action. */
  function validateDelivery(): boolean {
    setAttempted(true);
    const fresh = computeErrors(city, address, phone, postal);
    return Object.keys(fresh).length === 0;
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
    errors,
    applyCoupon,
    validateDelivery,
    deliveryPayload,
  };
}

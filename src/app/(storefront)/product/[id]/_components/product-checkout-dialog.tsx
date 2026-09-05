"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { BadgeCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { useStore } from "@/providers/store-provider";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import { checkCouponAction, createOrderAction } from "../_lib/actions";
import { cn } from "@/lib/utils";

// 🧾 Extracted from product-buy-panel.tsx so the checkout form's JS only
// loads once someone actually opens it (see product-checkout-mount.tsx).
export function ProductCheckoutDialog({
  open,
  onOpenChange,
  product,
  size,
  qty,
  unit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  size: string;
  qty: number;
  unit: number;
}) {
  const { user, showToast } = useStore();
  const [city, setCity] = useState(user?.city || "");
  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [postal, setPostal] = useState(user?.postalCode || "");
  const [couponIn, setCouponIn] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(
    null,
  );
  const [couponBad, setCouponBad] = useState(false);
  const [pending, startTransition] = useTransition();
  // 🔁 One key per checkout attempt — a double-click or a retried request
  // while this same dialog is open reuses it, so the server collapses them
  // into the one order (see `createOrder`); reopening the dialog for a new
  // purchase gets a fresh key.
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  // 🔄 Re-sync from the profile every time the dialog opens (same as the old openCheckout()).
  useEffect(() => {
    if (!open) return;
    setCity(user?.city || "");
    setAddress(user?.address || "");
    setPhone(user?.phone || "");
    setPostal(user?.postalCode || "");
    setIdempotencyKey(crypto.randomUUID());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = unit * qty;
  // 🚚 Shipping is decided by the *post-discount* subtotal, same as the
  // server (`createOrder` in `lib/shop/orders.ts`) — a coupon big enough to
  // drop the order back under the free-shipping line must show shipping
  // here too, or this summary promises a total the server won't charge.
  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const shipping =
    subtotal - discount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;

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

  function submitOrder() {
    if (!user) return;
    if (city.trim().length < 2) return showToast("شهر را بنویسید");
    if (address.trim().length < 10) return showToast("آدرس کامل را بنویسید");
    if (phoneDigits(phone).length !== 11)
      return showToast("شمارهٔ موبایل ۱۱ رقمی بنویسید");
    const postalDigits = toEnDigits(postal).replace(/\D/g, "");
    if (postalDigits.length !== 10)
      return showToast("کد پستیِ ۱۰ رقمی بنویسید");

    startTransition(async () => {
      const result = await createOrderAction({
        productId: product.id,
        size,
        qty,
        city: city.trim(),
        address: address.trim(),
        phone: phoneDigits(phone),
        postalCode: postalDigits,
        couponCode: applied?.code,
        idempotencyKey,
      });

      if (!result.ok) {
        showToast(result.error);
        return;
      }

      onOpenChange(false);
      showToast(
        `سفارش ${result.data.id} ثبت شد؛ از تب «سفارش‌های من» پیگیری کنید ✅`,
      );
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton
        className={cn(
          "max-w-md rounded-3xl",
          "border-gold/40 bg-paper text-navy border",
          "dark:border-gold/50 dark:bg-dusk dark:text-ivory",
        )}
      >
        <DialogTitle className="flex items-center gap-2 text-base font-black">
          <BadgeCheck className="text-gold size-5" /> ثبت سفارش
        </DialogTitle>

        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl p-3",
            "border-navy/10 border bg-white",
            "dark:border-gold/25 dark:bg-navy-deep/50",
          )}
        >
          <Image
            src={product.img}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{product.name}</p>
            <p className="text-navy/70 dark:text-wheat mt-0.5 text-[11px] font-bold">
              سایز {size} × {toFaDigits(qty)}
            </p>
          </div>
          <span className="text-gold text-sm font-black">
            {formatToman(subtotal)}
          </span>
        </div>

        <div className="text-navy/70 dark:text-wheat space-y-1 text-xs font-bold">
          <p className="flex justify-between">
            <span>جمعِ کالا</span>
            <span>{formatToman(subtotal)} تومان</span>
          </p>
          <p className="flex justify-between">
            <span>ارسال</span>
            <span>
              {shipping ? `${formatToman(shipping)} تومان` : "رایگان 🎉"}
            </span>
          </p>
          {discount ? (
            <p className="flex justify-between text-emerald-600 dark:text-emerald-300">
              <span>تخفیف کد {applied?.code}</span>
              <span>− {formatToman(discount)} تومان</span>
            </p>
          ) : null}
          <p className="text-navy dark:text-ivory flex justify-between text-sm font-black">
            <span>قابل پرداخت</span>
            <span>{formatToman(subtotal - discount + shipping)} تومان</span>
          </p>
        </div>

        {/* 📮 A real `<form>` (not a bare stack of `onClick`-driven inputs) —
            lets Enter submit from any field like every other form in the app,
            and gives Chrome's address autofill a submit boundary + `name`s
            to correlate phone/city/address/postal code as one saved profile
            instead of four unrelated fields. */}
        <form
          className="space-y-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            submitOrder();
          }}
        >
          <Input
            dir="ltr"
            name="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912…"
            inputMode="tel"
            autoComplete="tel-national"
            className="h-11 rounded-xl text-right"
            aria-label="موبایل"
          />
          <Input
            name="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="شهر"
            autoComplete="address-level2"
            className="h-11 rounded-xl"
            aria-label="شهر"
          />
          <Input
            name="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="آدرس کامل"
            autoComplete="street-address"
            className="h-11 rounded-xl"
            aria-label="آدرس"
          />
          <Input
            dir="ltr"
            name="postal-code"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            placeholder="کد پستی (۱۰ رقم)"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            className="h-11 rounded-xl text-right"
            aria-label="کد پستی"
          />
          <div className="flex gap-2">
            <Input
              dir="ltr"
              name="coupon"
              value={couponIn}
              onChange={(e) => {
                setCouponIn(e.target.value);
                setCouponBad(false);
              }}
              onKeyDown={(e) => {
                // 🚫 The coupon field has its own action (apply, not submit
                // the order) — stop Enter here before it bubbles to the
                // form's own submit handler above.
                if (e.key !== "Enter") return;
                e.preventDefault();
                applyCoupon();
              }}
              placeholder="MALLI10"
              aria-label="کد تخفیف"
              className={cn(
                "h-11 flex-1 rounded-xl text-right uppercase",
                couponBad && "border-rose focus-visible:ring-rose",
              )}
            />
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-11 shrink-0 rounded-xl",
                "border-gold/50 text-gold-deep",
                "dark:text-gold-soft",
              )}
              onClick={applyCoupon}
              disabled={pending}
            >
              <Ticket className="size-4" /> اعمال کد
            </Button>
          </div>
          {applied ? (
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-300">
              کد {applied.code} فعال است ✓
            </p>
          ) : couponBad ? (
            <p className="text-rose text-[11px] font-black">این کد معتبر نیست.</p>
          ) : null}

          <Button
            type="submit"
            variant="navy"
            className="h-12 w-full rounded-2xl font-black"
            disabled={pending}
          >
            {pending ? "در حال ثبت…" : "تأیید و ثبتِ سفارش"}
          </Button>
        </form>
        <p
          className={cn(
            "text-center text-[10px] leading-5 font-bold",
            "text-navy/70",
            "dark:text-wheat",
          )}
        >
          پرداخت در این نسخه هنگامِ تحویل، دربِ خانه انجام می‌شود.
          <br />
          شمارهٔ موبایل فقط برای تماس در صورت نیاز است؛ پشتیبانی فقط از طریق
          تیکت در سایت.
        </p>
      </DialogContent>
    </Dialog>
  );
}

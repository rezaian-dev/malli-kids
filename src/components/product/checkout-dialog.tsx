"use client";

import Image from "next/image";
import { BadgeCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { useStore } from "@/providers/store-provider";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import { createOrderAction } from "@/lib/shop/checkout-actions";
import { useCheckoutDeliveryForm } from "@/hooks/use-checkout-delivery-form";
import { DeliveryFields } from "./checkout-delivery-fields";
import { cn } from "@/lib/utils";

// 🧾 The one single-item "buy now" checkout — opened from the product page's
// buy panel *and* from a cart line's own "ثبت سفارش" action (see
// `CheckoutMount`), so it lives here in the shared `components/product`
// tree rather than under either route's own `_components`.
export function CheckoutDialog({
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
  const subtotal = unit * qty;
  const form = useCheckoutDeliveryForm({ open, user, subtotal, showToast });
  const {
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
  } = form;

  // 🚚 Shipping is decided by the *post-discount* subtotal, same as the
  // server (`createOrder` in `lib/shop/orders.ts`) — a coupon big enough to
  // drop the order back under the free-shipping line must show shipping
  // here too, or this summary promises a total the server won't charge.
  const shipping =
    subtotal - discount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;

  function submitOrder() {
    if (!user) return;
    if (!validateDelivery()) return;

    startTransition(async () => {
      const result = await createOrderAction({
        productId: product.id,
        size,
        qty,
        ...deliveryPayload(),
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
          // ♿ The `required`/`aria-required` on each field is for assistive
          // tech, not the browser's own popup — this form shows its own
          // inline Persian error per field (see `DeliveryFields`), same as
          // every other form in the app (`AppForm` sets the same
          // `noValidate`). Without it, an empty required field never even
          // reaches `submitOrder` below: the browser's native constraint
          // validation intercepts the click first and shows its own
          // (English, untranslated) "Please fill out this field" bubble
          // instead.
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submitOrder();
          }}
        >
          <DeliveryFields
            phone={phone}
            setPhone={setPhone}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            postal={postal}
            setPostal={setPostal}
            errors={errors}
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

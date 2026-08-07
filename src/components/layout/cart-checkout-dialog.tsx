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
import {
  checkCouponAction,
  createCartOrderAction,
} from "@/lib/shop/checkout-actions";
import { cn } from "@/lib/utils";

export type CartCheckoutRow = {
  item: { id: number; size: string; qty: number };
  product: Product;
  unitPrice: number;
};

// 🧾 The one place the *whole cart* becomes a single order — every line
// submitted together, the way checkout works on every standard storefront.
// Mirrors `CheckoutDialog`'s single-item layout (same delivery form, coupon
// field, summary) with the product card widened into a scrollable line list.
export function CartCheckoutDialog({
  open,
  onOpenChange,
  rows,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: CartCheckoutRow[];
  onSuccess: () => void;
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
  // 🔁 Same idempotency contract as `CheckoutDialog`: one key per checkout
  // attempt, regenerated whenever the dialog (re)opens.
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  useEffect(() => {
    if (!open) return;
    setCity(user?.city || "");
    setAddress(user?.address || "");
    setPhone(user?.phone || "");
    setPostal(user?.postalCode || "");
    setIdempotencyKey(crypto.randomUUID());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = rows.reduce(
    (sum, { item, unitPrice }) => sum + unitPrice * item.qty,
    0,
  );
  const discount = applied ? Math.round(subtotal * applied.rate) : 0;
  const shipping =
    subtotal - discount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const itemCount = rows.reduce((sum, { item }) => sum + item.qty, 0);

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
    if (!user || rows.length === 0) return;
    if (city.trim().length < 2) return showToast("شهر را بنویسید");
    if (address.trim().length < 10) return showToast("آدرس کامل را بنویسید");
    if (phoneDigits(phone).length !== 11)
      return showToast("شمارهٔ موبایل ۱۱ رقمی بنویسید");
    const postalDigits = toEnDigits(postal).replace(/\D/g, "");
    if (postalDigits.length !== 10)
      return showToast("کد پستیِ ۱۰ رقمی بنویسید");

    startTransition(async () => {
      const result = await createCartOrderAction({
        items: rows.map(({ item }) => ({
          productId: item.id,
          size: item.size,
          qty: item.qty,
        })),
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
      onSuccess();
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
          "flex max-h-[85vh] max-w-md flex-col rounded-3xl",
          "border-gold/40 bg-paper text-navy border",
          "dark:border-gold/50 dark:bg-dusk dark:text-ivory",
        )}
      >
        <DialogTitle className="flex items-center gap-2 text-base font-black">
          <BadgeCheck className="text-gold size-5" /> تکمیل خرید
        </DialogTitle>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto scrollbar-thin ps-0.5">
          <div className="space-y-2">
            {rows.map(({ item, product, unitPrice }) => (
              <div
                key={`${item.id}-${item.size}`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-2.5",
                  "border-navy/10 border bg-white",
                  "dark:border-gold/25 dark:bg-navy-deep/50",
                )}
              >
                <Image
                  src={product.img}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black">
                    {product.name}
                  </p>
                  <p className="text-navy/70 dark:text-wheat mt-0.5 text-[11px] font-bold">
                    سایز {item.size} × {toFaDigits(item.qty)}
                  </p>
                </div>
                <span className="text-gold shrink-0 text-[13px] font-black">
                  {formatToman(unitPrice * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="text-navy/70 dark:text-wheat space-y-1 text-xs font-bold">
            <p className="flex justify-between">
              <span>جمعِ کالاها ({toFaDigits(itemCount)} قلم)</span>
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
              disabled={pending || rows.length === 0}
            >
              {pending ? "در حال ثبت…" : "تأیید و ثبتِ سفارش"}
            </Button>
          </form>
        </div>

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

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BadgeCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { fullName } from "@/lib/text/name";
import { useStore } from "@/providers/store-provider";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import { loadCoupons } from "@/lib/admin/sync";
import { BRAND } from "@/lib/constants";
import { createOrder, SHIPPING_FEE } from "@/lib/orders";
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
  const [couponIn, setCouponIn] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(
    null,
  );
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBad, setCouponBad] = useState(false);

  // 🔄 Re-sync from the profile every time the dialog opens (same as the old openCheckout()).
  useEffect(() => {
    if (!open) return;
    setCity(user?.city || "");
    setAddress(user?.address || "");
    setPhone(user?.phone || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const subtotal = unit * qty;
  const shipping = subtotal >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const discount = applied ? Math.round(subtotal * applied.rate) : 0;

  function applyCoupon() {
    const code = toEnDigits(couponIn).trim().toUpperCase();
    if (!code) return;
    const hit = loadCoupons().find((c) => c.code.toUpperCase() === code);
    if (hit && hit.rate > 0 && hit.active !== false) {
      if (hit.min && subtotal < hit.min) {
        setApplied(null);
        setCouponBad(true);
        setCouponMsg(
          `این کد برای خریدهای بالای ${formatToman(hit.min)} تومان است.`,
        );
        return;
      }
      setApplied({ code: hit.code, rate: hit.rate });
      setCouponBad(false);
      setCouponMsg("");
      showToast(
        `کد ${hit.code} اعمال شد — ${toFaDigits(Math.round(hit.rate * 100))}٪ تخفیف 🎉`,
      );
    } else {
      setApplied(null);
      setCouponBad(true);
      setCouponMsg("");
    }
  }

  function submitOrder() {
    if (!user) return;
    if (city.trim().length < 2) return showToast("شهر را بنویسید");
    if (address.trim().length < 10) return showToast("آدرس کامل را بنویسید");
    if (phoneDigits(phone).length !== 11)
      return showToast("شمارهٔ موبایل ۱۱ رقمی بنویسید");
    const order = createOrder({
      owner: user.email || user.phone || "",
      customer: fullName(user.firstName, user.lastName),
      phone: phoneDigits(phone),
      city: city.trim(),
      address: address.trim(),
      items: [
        {
          id: product.id,
          name: product.name,
          img: product.img,
          size,
          qty,
          price: unit,
        },
      ],
      discount,
    });
    onOpenChange(false);
    showToast(`سفارش ${order.id} ثبت شد؛ از تب «سفارش‌های من» پیگیری کنید ✅`);
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

        <div className="space-y-2.5">
          <Input
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912…"
            inputMode="tel"
            className="h-11 rounded-xl text-right"
            aria-label="موبایل"
          />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="شهر"
            className="h-11 rounded-xl"
            aria-label="شهر"
          />
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="آدرس کامل"
            className="h-11 rounded-xl"
            aria-label="آدرس"
          />
          <div className="flex gap-2">
            <Input
              dir="ltr"
              value={couponIn}
              onChange={(e) => {
                setCouponIn(e.target.value);
                setCouponBad(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
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
            >
              <Ticket className="size-4" /> اعمال کد
            </Button>
          </div>
          {applied ? (
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-300">
              کد {applied.code} فعال است ✓
            </p>
          ) : couponBad ? (
            <p className="text-rose text-[11px] font-black">
              {couponMsg || "این کد معتبر نیست."}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="navy"
          className="h-12 w-full rounded-2xl font-black"
          onClick={submitOrder}
        >
          تأیید و ثبتِ سفارش
        </Button>
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

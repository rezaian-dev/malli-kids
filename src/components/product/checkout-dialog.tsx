"use client";

import Image from "next/image";
import { BadgeCheck, Ticket } from "lucide-react";
import { AppForm, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import { createOrderAction } from "@/lib/shop/checkout-actions";
import {
  useCheckoutDeliveryForm,
  type DeliveryValues,
} from "@/hooks/use-checkout-delivery-form";
import { DeliveryFields } from "./checkout-delivery-fields";
import { cn } from "@/lib/utils";

// Single-item checkout — shared by the product page and cart lines
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
  const { user } = useAuth();
  const subtotal = unit * qty;
  const {
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
  } = useCheckoutDeliveryForm({ open, user, subtotal });

  // Match the server's post-discount shipping calculation.
  const shipping = subtotal - discount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;

  async function submitOrder(values: DeliveryValues) {
    if (!user) return;

    const result = await createOrderAction({
      productId: product.id,
      size,
      qty,
      ...deliveryPayload(values),
      couponCode: applied?.code,
      idempotencyKey,
    });

    if (!result.ok) {
      toast(result.error);
      return;
    }

    onOpenChange(false);
    toast(`سفارش ${result.data.id} ثبت شد؛ از تب «سفارش‌های من» پیگیری کنید ✅`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton
        className="max-w-md rounded-3xl border-gold/40 bg-paper text-navy border dark:border-gold/50 dark:bg-dusk dark:text-ivory"
      >
        <DialogTitle className="flex items-center gap-2 text-base font-black">
          <BadgeCheck className="text-gold size-5" /> ثبت سفارش
        </DialogTitle>

        <div className="flex items-center gap-3 rounded-2xl p-3 border-navy/10 border bg-white dark:border-gold/25 dark:bg-navy-deep/50">
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
          <span className="text-gold text-sm font-black">{formatToman(subtotal)}</span>
        </div>

        <div className="text-navy/70 dark:text-wheat space-y-1 text-xs font-bold">
          <p className="flex justify-between">
            <span>جمعِ کالا</span>
            <span>{formatToman(subtotal)} تومان</span>
          </p>
          <p className="flex justify-between">
            <span>ارسال</span>
            <span>{shipping ? `${formatToman(shipping)} تومان` : "رایگان 🎉"}</span>
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

        <AppForm
          form={form}
          onSubmit={submitOrder}
          ariaLabel="ثبت سفارش"
          className="space-y-2.5"
        >
          <DeliveryFields />
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
                // Enter applies the coupon; stop it before the form submits
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
              className="h-11 shrink-0 rounded-xl border-gold/50 text-gold-deep dark:text-gold-soft"
              onClick={applyCoupon}
              disabled={couponPending}
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

          <SubmitButton
            variant="navy"
            className="h-12 w-full rounded-2xl font-black"
            pendingLabel="در حال ثبت…"
          >
            تأیید و ثبتِ سفارش
          </SubmitButton>
        </AppForm>
        <p className="text-center text-[10px] leading-5 font-bold text-navy/70 dark:text-wheat">
          درگاه آنلاین هنوز فعال نیست؛ پرداخت با هماهنگی پشتیبانی انجام و پس از دریافت وجه
          توسط مدیر تأیید می‌شود.
          <br />
          شمارهٔ موبایل فقط برای تماس در صورت نیاز است؛ پشتیبانی فقط از طریق تیکت در سایت.
        </p>
      </DialogContent>
    </Dialog>
  );
}

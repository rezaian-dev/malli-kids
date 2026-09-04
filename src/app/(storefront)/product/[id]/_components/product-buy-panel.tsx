"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { getMissingShippingFields } from "@/lib/shop/shipping";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import { pdpCard, pdpKicker, pdpWell } from "../_lib/product-chrome";
import { ProductReadMore } from "./product-read-more";
import { ProductCheckoutMount } from "./product-checkout-mount";
import { ProductGallery } from "./product-gallery";
import { cn } from "@/lib/utils";

const SIZES = ["۸۰", "۸۶", "۹۲", "۹۸", "۱۰۴", "۱۱۰", "۱۱۶", "۱۲۲"];

const TAG_PILL = cn(
  "rounded-full border px-3 py-1 text-[11px] font-bold",
  "border-navy/10 bg-sand/80 text-navy",
  "dark:border-gold/25 dark:bg-night dark:text-ivory",
);
const QTY_BTN =
  "flex size-10 items-center justify-center rounded-full transition-transform duration-150 motion-safe:hover:scale-110 motion-safe:active:scale-90";
const CTA_BUTTON =
  "h-auto min-h-12 w-full rounded-2xl px-3 py-3 text-[13px] leading-5 font-black whitespace-normal sm:text-sm";
const SHIP_ITEM =
  "border-navy/8 dark:border-gold/20 px-2 py-3.5 text-center not-last:border-e";
const SHIP_ICON = "text-gold mx-auto mb-1 size-4";

export function ProductBuyPanel({ product }: { product: Product }) {
  const { addToCart, showToast, user, setAuthOpen, campaign, priceOf } =
    useStore();
  const router = useRouter();
  const [size, setSize] = useState("۹۸");
  const [qty, setQty] = useState(1);
  const [checkout, setCheckout] = useState(false);

  const unit = priceOf(product.price);

  function openCheckout() {
    if (!product.stock) return showToast("به محض موجود شدن خبرتان می‌کنیم");
    if (!user) {
      setAuthOpen(true);
      showToast("برای ثبت سفارش اول وارد شوید");
      return;
    }

    // 📦 A COD order with no phone/address/postal code is undeliverable —
    // nudge toward the profile *before* the checkout dialog opens, but
    // don't block it: the dialog itself repeats these fields inline, so
    // filling them in right there works just as well as visiting the
    // profile page first.
    const missing = getMissingShippingFields(user);
    if (missing.length) {
      toast.warning(`برای ارسالِ درست و بدون تأخیر، ${missing.join("، ")} را در پروفایل‌تان تکمیل کنید`, {
        description: "می‌توانید همین‌جا هم در فرمِ سفارش وارد کنید.",
        action: { label: "تکمیل پروفایل", onClick: () => router.push("/profile") },
      });
    }

    setCheckout(true);
  }

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:gap-8">
      <ProductGallery
        images={product.images}
        name={product.name}
        disc={product.disc}
        badge={product.badge}
      />

      <div className={`${pdpCard} p-4 sm:p-7`}>
        <p className={pdpKicker}>{product.cat}</p>
        <h1
          className={cn(
            "mt-2 text-[clamp(1.25rem,6.4vw,2.25rem)] leading-snug font-black",
            "text-navy",
            "dark:text-ivory",
          )}
        >
          {product.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((n) => (
              <Star key={n} className="fill-gold text-gold size-4" />
            ))}
          </span>
          <span className="text-navy dark:text-ivory font-black">
            {product.rate}
          </span>
          <span className="text-navy/70 dark:text-wheat text-xs">
            امتیاز خریداران تأییدشده
          </span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {product.season ? (
            <li className={TAG_PILL}>{product.season}</li>
          ) : null}
          <li className={TAG_PILL}>
            {product.stock ? "موجود در آتلیه" : "ناموجود"}
          </li>
          <li className={TAG_PILL}>{toFaDigits(product.sold)} فروش</li>
        </ul>
        <ProductReadMore
          text={product.desc}
          lines={3}
          className={cn(
            "mt-5 text-sm leading-8 sm:text-[15px]",
            "text-navy/70",
            "dark:text-wheat",
          )}
        />

        <div className={`${pdpWell} mt-6 p-4 sm:p-5`}>
          <p className="text-navy/70 dark:text-wheat mb-1 text-[11px] font-bold">
            قیمت
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <span
              className={cn(
                "text-[1.75rem] leading-none font-black",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              {formatToman(unit)}{" "}
              <span className="text-navy/70 dark:text-gold-soft text-sm font-medium">
                تومان
              </span>
              {campaign.active && unit < product.price ? (
                <s className="text-silver me-2 text-sm line-through">
                  {formatToman(product.price)}
                </s>
              ) : null}
            </span>
            {product.old ? (
              <span className="text-navy/70 pb-0.5 text-sm line-through">
                {formatToman(product.old)}
              </span>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-6 mb-2.5 flex items-center gap-1.5 text-xs font-black",
              "text-navy",
              "dark:text-ivory",
            )}
          >
            <Ruler className="text-gold size-4" /> انتخاب سایز
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-h-10 min-w-10 rounded-xl border-2 px-2.5 py-2 text-[11px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95 sm:px-3.5 sm:text-xs",
                  size === s
                    ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep motion-safe:hover:shadow-md"
                    : "border-navy/10 text-navy/70 hover:border-navy/30 dark:border-gold/30 dark:text-ivory dark:hover:border-gold/60",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-navy dark:text-ivory text-xs font-black">
              تعداد
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full border p-1",
                "border-navy/10 bg-sand",
                "dark:border-gold/30 dark:bg-night",
              )}
            >
              <button
                type="button"
                className={cn(QTY_BTN, "bg-white", "dark:bg-slate")}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="کم کردن"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-base font-black tabular-nums">
                {toFaDigits(qty)}
              </span>
              <button
                type="button"
                className={cn(QTY_BTN, "bg-navy text-cream")}
                onClick={() => setQty((q) => q + 1)}
                aria-label="زیاد کردن"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-7">
            <Button
              type="button"
              variant="navy"
              disabled={!product.stock}
              className={CTA_BUTTON}
              onClick={() => {
                if (!product.stock)
                  return showToast("به محض موجود شدن خبرتان می‌کنیم");
                // 🔐 `addToCart` gates guests itself (login dialog + toast);
                // only celebrate success when it actually added the line.
                if (addToCart(product.id, size, qty))
                  showToast(
                    `${toFaDigits(qty)} عدد سایز ${size} به سبد اضافه شد`,
                  );
              }}
            >
              <ShoppingBag className="size-4" />
              {product.stock
                ? `افزودن به سبد — سایز ${size} × ${toFaDigits(qty)}`
                : "ناموجود"}
            </Button>
          </div>
          <Button
            type="button"
            variant="gold"
            disabled={!product.stock}
            className={cn("mt-2.5", CTA_BUTTON)}
            onClick={openCheckout}
          >
            <BadgeCheck className="size-4" /> ثبت سفارش — پرداخت هنگامِ تحویل
          </Button>
          <Button
            asChild
            variant="outline"
            className={cn(
              "mt-2.5 border-2",
              CTA_BUTTON,
              "border-gold text-gold hover:bg-gold hover:text-navy-deep",
            )}
          >
            <Link href="/tryon">
              <Sparkles className="size-4" /> پرو مجازی این لباس
            </Link>
          </Button>
        </div>

        <ProductCheckoutMount
          open={checkout}
          onOpenChange={setCheckout}
          product={product}
          size={size}
          qty={qty}
          unit={unit}
        />

        <ul
          className={cn(
            `${pdpWell} mt-5 grid grid-cols-3 overflow-hidden text-[11px] font-bold`,
            "text-navy/70",
            "dark:text-wheat",
          )}
        >
          <li className={SHIP_ITEM}>
            <Truck className={SHIP_ICON} /> ارسال ۲–۴ روز
          </li>
          <li className={SHIP_ITEM}>
            <RotateCcw className={SHIP_ICON} /> ۷ روز بازگشت
          </li>
          <li className="px-2 py-3.5 text-center">
            <ShieldCheck className={SHIP_ICON} /> ضدحساسیت
          </li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { SliderArrow } from "@/components/ui/slider-arrow";
import type { Product } from "@/types";
import { formatToman, toFaDigits } from "@/lib/format";
import { useStore } from "@/providers/store-provider";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { useLiveProduct } from "./product-live-context";
import { pdpCard, pdpKicker, pdpWell } from "./product-chrome";
import { ProductReadMore } from "./product-read-more";
import { ProductCheckoutMount } from "./product-checkout-mount";
import { cn } from "@/lib/utils";

const SIZES = ["۸۰", "۸۶", "۹۲", "۹۸", "۱۰۴", "۱۱۰", "۱۱۶", "۱۲۲"];

const CORNER_MARK =
  "border-gold/70 pointer-events-none absolute z-10 hidden h-6 w-6 min-[400px]:block sm:h-8 sm:w-8";
const TAG_PILL = cn(
  "rounded-full border px-3 py-1 text-[11px] font-bold",
  "border-navy/10 bg-sand/80 text-navy",
  "dark:border-gold/25 dark:bg-night dark:text-ivory",
);
const QTY_BTN = "flex size-10 items-center justify-center rounded-full";
const CTA_BUTTON =
  "h-auto min-h-12 w-full rounded-2xl px-3 py-3 text-[13px] leading-5 font-black whitespace-normal sm:text-sm";
const SHIP_ITEM =
  "border-navy/8 dark:border-gold/20 px-2 py-3.5 text-center not-last:border-e";
const SHIP_ICON = "text-gold mx-auto mb-1 size-4";

export function ProductBuyPanel({ product: seed }: { product: Product }) {
  const product = useLiveProduct(seed);
  const { addToCart, showToast, user, setAuthOpen, campaign, priceOf } =
    useStore();
  const [size, setSize] = useState("۹۸");
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const [checkout, setCheckout] = useState(false);

  const unit = priceOf(product.price);

  function openCheckout() {
    if (!product.stock) return showToast("به محض موجود شدن خبرتان می‌کنیم");
    if (!user) {
      setAuthOpen(true);
      showToast("برای ثبت سفارش اول وارد شوید");
      return;
    }
    setCheckout(true);
  }

  const gallery = useMemo(() => {
    const imgs = [product.img];
    CORE_PRODUCTS.forEach((x) => {
      if (x.img !== product.img && imgs.length < 5) imgs.push(x.img);
    });
    return imgs;
  }, [product.img]);

  const go = (n: number) => setSlide((n + gallery.length) % gallery.length);

  return (
    <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,.92fr)] lg:gap-8">
      <div className="min-w-0 lg:sticky lg:top-24">
        <div
          className={cn(
            "relative aspect-4/5 overflow-hidden rounded-[22px] shadow-[0_28px_60px_-32px_rgba(14,42,71,.42)] select-none sm:rounded-[36px]",
            "border-navy/10 bg-sand/55 ring-gold/35 border ring-1",
            "dark:border-gold/30 dark:bg-dusk",
          )}
          onTouchStart={(e) => {
            e.currentTarget.dataset.x = String(e.changedTouches[0].clientX);
          }}
          onTouchEnd={(e) => {
            const start = Number(e.currentTarget.dataset.x || 0);
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) go(slide + (dx > 0 ? -1 : 1));
          }}
        >
          <span
            className={cn(
              CORNER_MARK,
              "top-3 right-3 rounded-tr-lg border-t-2 border-r-2 sm:top-5 sm:right-5",
            )}
          />
          <span
            className={cn(
              CORNER_MARK,
              "top-3 left-3 rounded-tl-lg border-t-2 border-l-2 sm:top-5 sm:left-5",
            )}
          />
          <span
            className={cn(
              CORNER_MARK,
              "right-3 bottom-3 rounded-br-lg border-r-2 border-b-2 sm:right-5 sm:bottom-5",
            )}
          />
          <span
            className={cn(
              CORNER_MARK,
              "bottom-3 left-3 rounded-bl-lg border-b-2 border-l-2 sm:bottom-5 sm:left-5",
            )}
          />
          <div
            className="absolute inset-0 flex h-full transition-transform duration-500"
            style={{ transform: `translateX(${-slide * 100}%)` }}
          >
            {gallery.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt={product.name}
                width={900}
                height={1200}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-between min-[400px]:inset-x-12 min-[400px]:top-5 sm:inset-x-14">
            {product.disc ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-black",
                  "bg-rose text-white",
                )}
              >
                {product.disc} تخفیف
              </span>
            ) : (
              <span />
            )}
            {product.badge ? (
              <span
                className={cn(
                  "ms-auto rounded-full px-3 py-1.5 text-[11px] font-black",
                  product.badge === "جدید"
                    ? "bg-gold text-navy-deep"
                    : "bg-navy text-gold-light",
                )}
              >
                {product.badge}
              </span>
            ) : null}
          </div>
          <SliderArrow
            chevron
            direction="prev"
            label="قبلی"
            onClick={() => go(slide - 1)}
            className="absolute inset-s-3 top-1/2 z-10 -translate-y-1/2"
          />
          <SliderArrow
            chevron
            direction="next"
            label="بعدی"
            onClick={() => go(slide + 1)}
            className="absolute inset-e-3 top-1/2 z-10 -translate-y-1/2"
          />
          <div className="absolute inset-x-0 bottom-7 z-10 flex justify-center gap-1.5">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`اسلاید ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "relative h-2 rounded-full before:absolute before:-inset-2.5 before:content-['']",
                  i === slide ? "bg-gold w-6" : "w-2 bg-white/70",
                )}
              />
            ))}
          </div>
        </div>
        <div className={`${pdpCard} mt-3 p-2`}>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i)}
                aria-label={`تصویر ${i + 1} ${product.name}`}
                aria-current={i === slide || undefined}
                className={cn(
                  "size-14 shrink-0 overflow-hidden rounded-xl border-2 sm:size-18 sm:rounded-2xl",
                  i === slide
                    ? "border-gold ring-gold/30 ring-2"
                    : "border-navy/10 dark:border-gold/20 opacity-70",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

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
                  "min-h-10 min-w-10 rounded-xl border-2 px-2.5 py-2 text-[11px] font-bold sm:px-3.5 sm:text-xs",
                  size === s
                    ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep"
                    : "border-navy/10 text-navy/70 dark:border-gold/30 dark:text-ivory",
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
                addToCart(product.id, size, qty);
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

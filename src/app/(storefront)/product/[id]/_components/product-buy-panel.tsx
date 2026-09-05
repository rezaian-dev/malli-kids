"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Info,
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
import { parseFaNumber } from "@/lib/digits";
import { toast } from "@/lib/toast";
import { getMissingShippingFields } from "@/lib/shop/shipping";
import { sizeForHeightCm } from "@/lib/data/sizing";
import { useStore } from "@/providers/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QtyStepper } from "@/components/shared/qty-stepper";
import { CheckoutMount } from "@/components/product";
import { pdpCard, pdpCtaButton, pdpKicker, pdpWell } from "../_lib/product-chrome";
import { ProductReadMore } from "./product-read-more";
import { ProductGallery } from "./product-gallery";
import { ProductSizeTable } from "./product-size-table";
import { ProductStickyBar } from "./product-sticky-bar";
import { BackInStockButton } from "./back-in-stock-button";
import { cn } from "@/lib/utils";

const SIZES = ["۸۰", "۸۶", "۹۲", "۹۸", "۱۰۴", "۱۱۰", "۱۱۶", "۱۲۲"];

const TAG_PILL = cn(
  "rounded-full border px-3 py-1 text-[11px] font-bold",
  "border-navy/10 bg-sand/80 text-navy",
  "dark:border-gold/25 dark:bg-night dark:text-ivory",
);
const AVAILABILITY_PILL = {
  in: "rounded-full border-0 px-3 py-1 text-[11px] font-bold bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  out: "rounded-full border-0 px-3 py-1 text-[11px] font-bold bg-rose/10 text-rose",
};
const CTA_BUTTON = pdpCtaButton;
const SHIP_ITEM =
  "border-navy/8 dark:border-gold/20 px-2 py-3.5 text-center not-last:border-e";
const SHIP_ICON = "text-gold mx-auto mb-1 size-4";

/** 📏 A variant-tracked product only ever offers *its own* sizes, each
 *  disabled once that size's stock hits zero — replaces the one-size-fits-
 *  all hardcoded list for any product that has real per-size stock. A
 *  legacy/unsized product keeps the old universal list untouched. */
function useSizeOptions(product: Product) {
  return useMemo(() => {
    if (!product.variants.length) {
      return SIZES.map((size) => ({ size, available: true }));
    }
    const bySize = new Map<string, number>();
    for (const variant of product.variants) {
      bySize.set(variant.size, (bySize.get(variant.size) ?? 0) + variant.stock);
    }
    return Array.from(bySize.entries()).map(([size, stock]) => ({
      size,
      available: stock > 0,
    }));
  }, [product.variants]);
}

export function ProductBuyPanel({
  product,
  subscribedSizes,
}: {
  product: Product;
  subscribedSizes: string[];
}) {
  const { addToCart, showToast, user, setAuthOpen, campaign, priceOf } =
    useStore();
  const router = useRouter();
  const sizeOptions = useSizeOptions(product);

  // 📏 If the shopper's child profile has a height on file, suggest the
  // size it maps to — as long as this product actually offers it — instead
  // of just falling back to the first in-stock size. See `sizing.ts`. (The
  // React Compiler handles memoizing this itself — no manual `useMemo`.)
  const heightCm = user?.childHeightCm ? parseFaNumber(user.childHeightCm) : NaN;
  const sizeSuggestion = Number.isFinite(heightCm)
    ? sizeForHeightCm(heightCm)
    : null;
  const recommendedSize =
    sizeSuggestion &&
    sizeOptions.some((o) => o.size === sizeSuggestion && o.available)
      ? sizeSuggestion
      : null;

  const [size, setSize] = useState(
    () =>
      recommendedSize ??
      sizeOptions.find((option) => option.available)?.size ??
      sizeOptions[0]?.size ??
      "۹۸",
  );
  const [qty, setQty] = useState(1);
  const [checkout, setCheckout] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  // 🔔 Which sizes (or `""` for a legacy/unsized product) this shopper has
  // already asked to be notified about — seeded server-side (see
  // `ProductDetailLanding`) so it's correct on first paint, then grown
  // locally the moment a new subscribe succeeds (no refetch needed).
  const [subscribed, setSubscribed] = useState(subscribedSizes);

  const selectedAvailable =
    sizeOptions.find((option) => option.size === size)?.available ?? true;
  const canOrder = product.stock && selectedAvailable;
  const sizeKey = product.variants.length ? size : "";
  const isSubscribed = subscribed.includes(sizeKey);

  const unit = priceOf(product.price);

  function openCheckout() {
    if (!canOrder) return showToast("این سایز ناموجود است");
    if (!user) {
      setAuthOpen(true);
      showToast("برای ثبت سفارش اول وارد شوید");
      return;
    }

    // 📦 A COD order can't ship without phone/address/postal code — the
    // profile must have these set before checkout opens at all (the server
    // action re-checks the same thing, so this is a hard gate, not a nudge).
    const missing = getMissingShippingFields(user);
    if (missing.length) {
      toast.error("لطفاً پروفایل خود را تکمیل کنید", {
        description: `${missing.join("، ")} در پروفایل‌تان ثبت نشده.`,
        action: { label: "تکمیل پروفایل", onClick: () => router.push("/profile") },
      });
      return;
    }

    setCheckout(true);
  }

  // 🛒 Shared by the main CTA and the mobile sticky bar so both add exactly
  // the same line the exact same way.
  function handleAddToCart() {
    if (!canOrder) return showToast("این سایز ناموجود است");
    // 🔐 `addToCart` gates guests itself (login dialog + toast); only
    // celebrate success when it actually added the line.
    if (addToCart(product.id, size, qty))
      showToast(`${toFaDigits(qty)} عدد سایز ${size} به سبد اضافه شد`);
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
        <ul className="mt-4 flex flex-wrap items-center gap-1.5">
          <li>
            <Badge
              className={
                product.stock ? AVAILABILITY_PILL.in : AVAILABILITY_PILL.out
              }
            >
              {product.stock ? "موجود در آتلیه" : "ناموجود"}
            </Badge>
          </li>
          {product.season ? (
            <li>
              <Badge className={TAG_PILL}>{product.season}</Badge>
            </li>
          ) : null}
          <li>
            <Badge className={TAG_PILL}>{toFaDigits(product.sold)} فروش</Badge>
          </li>
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
          <div className="mt-6 mb-2.5 flex items-center justify-between gap-2">
            <p
              className={cn(
                "flex items-center gap-1.5 text-xs font-black",
                "text-navy",
                "dark:text-ivory",
              )}
            >
              <Ruler className="text-gold size-4" /> انتخاب سایز
            </p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className={cn(
                "flex items-center gap-1 text-[11px] font-bold underline underline-offset-2",
                "text-navy/70 hover:text-gold",
                "dark:text-wheat dark:hover:text-gold-light",
              )}
            >
              <Info className="size-3.5" /> راهنمای سایز
            </button>
          </div>
          {recommendedSize ? (
            <p
              className={cn(
                "mb-2.5 rounded-xl px-3 py-2 text-[11px] font-bold",
                "bg-gold/10 text-gold-deep",
                "dark:bg-gold/15 dark:text-gold-soft",
              )}
            >
              📏 پیشنهاد سایز برای {user?.childName || "کوچولوی شما"}: سایز{" "}
              {recommendedSize}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map(({ size: s, available }) => (
              <button
                key={s}
                type="button"
                disabled={!available}
                onClick={() => setSize(s)}
                className={cn(
                  "relative min-h-10 min-w-10 rounded-xl border-2 px-2.5 py-2 text-[11px] font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95 sm:px-3.5 sm:text-xs",
                  !available && "cursor-not-allowed opacity-40 line-through",
                  size === s
                    ? "border-navy bg-navy text-ivory dark:border-gold dark:bg-gold dark:text-navy-deep motion-safe:hover:shadow-md"
                    : "border-navy/10 text-navy/70 hover:border-navy/30 dark:border-gold/30 dark:text-ivory dark:hover:border-gold/60",
                )}
              >
                {s}
                {s === recommendedSize ? (
                  <span
                    aria-hidden
                    className="bg-gold absolute -inset-e-1 -top-1 size-2 rounded-full"
                  />
                ) : null}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-navy dark:text-ivory text-xs font-black">
              تعداد
            </p>
            <QtyStepper qty={qty} onChange={setQty} />
          </div>
          <div className="mt-7" id="pdp-add-to-cart">
            <Button
              type="button"
              variant="navy"
              disabled={!canOrder}
              className={CTA_BUTTON}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="size-4" />
              {canOrder
                ? `افزودن به سبد — سایز ${size} × ${toFaDigits(qty)}`
                : "ناموجود"}
            </Button>
          </div>
          {canOrder ? (
            <Button
              type="button"
              variant="gold"
              className={cn("mt-2.5", CTA_BUTTON)}
              onClick={openCheckout}
            >
              <BadgeCheck className="size-4" /> ثبت سفارش — پرداخت هنگامِ تحویل
            </Button>
          ) : (
            <div className="mt-2.5">
              <BackInStockButton
                productId={product.id}
                sizeKey={sizeKey}
                subscribed={isSubscribed}
                onSubscribed={() =>
                  setSubscribed((current) =>
                    current.includes(sizeKey) ? current : [...current, sizeKey],
                  )
                }
              />
            </div>
          )}
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

        <CheckoutMount
          open={checkout}
          onOpenChange={setCheckout}
          product={product}
          size={size}
          qty={qty}
          unit={unit}
        />

        <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
          <DialogContent
            dir="rtl"
            showCloseButton
            className={cn(
              "max-w-2xl rounded-3xl",
              "border-gold/40 bg-paper text-navy border",
              "dark:border-gold/50 dark:bg-dusk dark:text-ivory",
            )}
          >
            <DialogTitle className="flex items-center gap-2 text-base font-black">
              <Ruler className="text-gold size-5" /> راهنمای سایز
            </DialogTitle>
            <ProductSizeTable
              highlightSize={recommendedSize ?? "۹۸"}
              highlightLabel={recommendedSize ? "پیشنهادی برای شما" : "پیشنهادی"}
            />
          </DialogContent>
        </Dialog>

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

      <ProductStickyBar
        observeId="pdp-add-to-cart"
        name={product.name}
        unit={unit}
        canOrder={Boolean(canOrder)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

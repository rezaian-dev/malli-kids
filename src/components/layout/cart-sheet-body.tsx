"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  ShoppingBag,
  Trash2,
  XIcon,
} from "lucide-react";
import { EASE_OUT } from "@/components/motion";
import type { Campaign, CartItem } from "@/providers/store-provider";
import { resolvePrice } from "@/lib/shop/pricing";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { getProductsByIdsAction } from "@/lib/shop/products-actions";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PANEL_HEAD } from "./header-styles";
import { CartLineItem } from "./cart-line-item";
import { CartShippingProgress } from "./cart-shipping-progress";
import { CartSummary } from "./cart-summary";
import { CartEmptyState } from "./cart-empty-state";
import { CartCheckoutMount } from "./cart-checkout-mount";

/** 🛍️ Everything inside the cart sheet panel — lazy-loaded by `CartSheet`
 *  and mounted only while the sheet is open, so the product lookup below
 *  runs on open (fresh prices every time) instead of on every page load. */
export function CartSheetBody({
  cart,
  cartCount,
  campaign,
  checkoutOpen,
  onCheckoutOpenChange,
  onQtyChange,
  onRemove,
  onClear,
  onCheckoutSuccess,
}: {
  cart: CartItem[];
  cartCount: number;
  campaign: Campaign;
  checkoutOpen: boolean;
  onCheckoutOpenChange: (open: boolean) => void;
  onQtyChange: (id: number, size: string, qty: number) => void;
  onRemove: (id: number, size: string) => void;
  onClear: () => void;
  onCheckoutSuccess: () => void;
}) {
  const empty = cartCount === 0;
  const [products, setProducts] = useState<Product[]>([]);
  const idsKey = cart.map((item) => item.id).join(",");

  // 🛒 Mounts with the open sheet (Radix unmounts closed content), so this
  // fetch is pay-per-open — and re-runs if the cart changes mid-open.
  useEffect(() => {
    let active = true;
    getProductsByIdsAction(cart.map((item) => item.id)).then((list) => {
      if (active) setProducts(list);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const rows = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      const resolved = resolvePrice(product, campaign);
      return {
        item,
        product,
        unitPrice: resolved.price,
        originalPrice: resolved.original,
      };
    })
    .filter(
      (
        r,
      ): r is {
        item: (typeof cart)[number];
        product: Product;
        unitPrice: number;
        originalPrice: number | undefined;
      } => Boolean(r),
    );

  const subtotal = rows.reduce(
    (sum, { item, unitPrice }) => sum + unitPrice * item.qty,
    0,
  );
  const freeShip = subtotal >= BRAND.freeShipFrom;
  const shipping = empty ? 0 : freeShip ? 0 : SHIPPING_FEE;
  const progress = Math.min(
    100,
    Math.round((subtotal / BRAND.freeShipFrom) * 100),
  );

  return (
    <>
      <SheetHeader className={cn(PANEL_HEAD, "relative pe-14")}>
        <SheetClose
          asChild
          className="absolute inset-e-3.5 top-1/2 -translate-y-1/2"
        >
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="بستن سبد خرید"
            className={cn(
              "rounded-full transition-transform duration-300 ease-out",
              "text-cream hover:text-gold-light hover:scale-105 hover:bg-white/15",
            )}
          >
            <XIcon className="size-5 text-current" />
          </Button>
        </SheetClose>
        <SheetTitle className="text-cream flex items-center gap-2 text-start text-base font-black">
          <span className="bg-gold text-navy-deep grid size-9 place-items-center rounded-2xl">
            <ShoppingBag className="size-4.5" />
          </span>
          سبد خرید
          {!empty ? (
            <Badge className="bg-gold/20 text-gold ms-auto rounded-full border-0 text-[10px] font-bold">
              {toFaDigits(cartCount)} قلم
            </Badge>
          ) : null}
        </SheetTitle>
        <SheetDescription className="text-gold-soft text-start text-[11px] font-bold">
          {empty ? "گالری ملی‌کیدز" : "همهٔ کالاها را یک‌جا تسویه کنید"}
        </SheetDescription>
      </SheetHeader>

      {empty ? (
        <CartEmptyState />
      ) : (
        <>
          <CartShippingProgress
            remaining={BRAND.freeShipFrom - subtotal}
            freeShip={freeShip}
            progress={progress}
          />

          <div className="min-h-0 flex-1 scrollbar-thin space-y-2.5 overflow-y-auto px-4 py-4">
            {/* 🎬 حذفِ یک ردیف با سُر خوردن + محو شدن بیرون می‌رود؛ بقیهٔ
                ردیف‌ها با `layout` نرم جای خالی را پر می‌کنند. */}
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map(({ item, product, unitPrice, originalPrice }) => (
                <motion.div
                  key={`${item.id}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.94 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                >
                  <CartLineItem
                    item={item}
                    product={product}
                    unitPrice={unitPrice}
                    originalPrice={originalPrice}
                    onQtyChange={(qty) => onQtyChange(item.id, item.size, qty)}
                    onRemove={() => onRemove(item.id, item.size)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            freeShip={freeShip}
          />
        </>
      )}

      <SheetFooter className="border-navy/10 dark:border-gold/20 gap-2 border-t px-5 py-4">
        {!empty ? (
          <Button
            type="button"
            className={cn(
              "h-12 w-full rounded-2xl text-sm font-black",
              "bg-gold text-navy-deep hover:bg-gold-light motion-safe:hover:shadow-gold/30 motion-safe:hover:shadow-lg",
            )}
            onClick={() => onCheckoutOpenChange(true)}
          >
            <BadgeCheck className="size-4.5" /> تکمیل خرید —{" "}
            {formatToman(subtotal + shipping)} تومان
          </Button>
        ) : null}

        <SheetClose asChild>
          <Button
            asChild
            className={cn(
              "h-11 w-full rounded-2xl text-xs font-black",
              empty
                ? "bg-navy text-cream hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
                : "border-gold/50 text-gold-deep hover:bg-gold/10 dark:text-gold-soft border bg-transparent",
            )}
          >
            <Link href="/shop">
              {empty ? "مشاهدهٔ کالکشن" : "ادامهٔ خرید"}{" "}
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </SheetClose>

        {!empty ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className={cn(
              "h-9 w-full",
              "text-rose hover:bg-rose/10 hover:text-rose rounded-2xl text-[11px] font-bold",
            )}
          >
            <Trash2 className="size-3.5" /> خالی کردن سبد
          </Button>
        ) : null}
      </SheetFooter>

      <CartCheckoutMount
        open={checkoutOpen}
        onOpenChange={onCheckoutOpenChange}
        rows={rows}
        onSuccess={onCheckoutSuccess}
      />
    </>
  );
}

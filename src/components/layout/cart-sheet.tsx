"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, ShoppingBag, Trash2, XIcon } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { resolvePrice } from "@/lib/shop/pricing";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { getProductsByIdsAction } from "@/lib/shop/products-actions";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL, PANEL_HEAD } from "./header-styles";
import { CartLineItem } from "./cart-line-item";
import { CartShippingProgress } from "./cart-shipping-progress";
import { CartSummary } from "./cart-summary";
import { CartEmptyState } from "./cart-empty-state";
import { CartCheckoutMount } from "./cart-checkout-mount";

export function CartSheet() {
  const { cart, cartCount, setCartQty, removeCartItem, clearCart, campaign } =
    useStore();
  const empty = cartCount === 0;
  const [products, setProducts] = useState<Product[]>([]);
  // 🛍️ Controlled (not just `<SheetTrigger>` uncontrolled) so a successful
  // whole-cart checkout can close the sheet itself — see `onSuccess` below.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getProductsByIdsAction(cart.map((item) => item.id)).then((list) => {
      if (active) setProducts(list);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.map((item) => item.id).join(",")]);

  const rows = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      const resolved = resolvePrice(product, campaign);
      return { item, product, unitPrice: resolved.price, originalPrice: resolved.original };
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
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label={
            empty
              ? "سبد خرید (خالی)"
              : `سبد خرید (${toFaDigits(cartCount)} قلم)`
          }
          className={cn(
            ICON_BTN,
            "group relative border-2 transition-colors",
            "border-gold/70 bg-gold/12 hover:border-gold hover:bg-gold hover:text-navy-deep",
            "dark:border-gold/60 dark:bg-gold/15 dark:hover:bg-gold dark:hover:text-navy-deep",
          )}
        >
          <ShoppingBag
            className={cn(
              "size-5",
              "transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            )}
          />

          {}
          <Badge
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-e-1 -top-1 justify-center rounded-full border-2 p-0 tabular-nums",
              "border-cream bg-navy text-gold text-[10px] font-black",
              "dark:border-navy-deep dark:bg-navy dark:text-gold-light",
              cartCount > 9 ? "h-5 min-w-5 px-1" : "size-5",
              empty && "hidden",
            )}
          >
            {cartCount > 99 ? "+۹۹" : toFaDigits(cartCount)}
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        dir="rtl"
        showCloseButton={false}
        className={cn(PANEL, "flex w-[min(24rem,94vw)] flex-col")}
      >
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
              {rows.map(({ item, product, unitPrice, originalPrice }) => (
                <CartLineItem
                  key={`${item.id}-${item.size}`}
                  item={item}
                  product={product}
                  unitPrice={unitPrice}
                  originalPrice={originalPrice}
                  onQtyChange={(qty) => setCartQty(item.id, item.size, qty)}
                  onRemove={() => removeCartItem(item.id, item.size)}
                />
              ))}
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
                "bg-gold text-navy-deep hover:bg-gold-light motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/30",
              )}
              onClick={() => setCheckoutOpen(true)}
            >
              <BadgeCheck className="size-4.5" /> تکمیل خرید — {formatToman(subtotal + shipping)} تومان
            </Button>
          ) : null}

          <SheetClose asChild>
            <Button
              asChild
              className={cn(
                "h-11 w-full rounded-2xl text-xs font-black",
                empty
                  ? "bg-navy text-cream hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
                  : "border-gold/50 text-gold-deep border bg-transparent hover:bg-gold/10 dark:text-gold-soft",
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
              onClick={clearCart}
              className={cn(
                "h-9 w-full",
                "text-rose hover:bg-rose/10 hover:text-rose rounded-2xl text-[11px] font-bold",
              )}
            >
              <Trash2 className="size-3.5" /> خالی کردن سبد
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>

      <CartCheckoutMount
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        rows={rows}
        onSuccess={() => {
          clearCart();
          setSheetOpen(false);
        }}
      />
    </Sheet>
  );
}

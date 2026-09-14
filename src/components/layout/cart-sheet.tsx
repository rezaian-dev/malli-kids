"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/providers/cart-store-provider";
import { useCampaign } from "@/providers/campaign-provider";
import { toFaDigits } from "@/lib/locale/fa";
import { getProductsByIdsAction } from "@/lib/shop/products-actions";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL } from "./header-styles";

// The sheet body's JS chunk + product data used to be fetched only once the
// sheet opened. Radix unmounts SheetContent while closed, so both the chunk
// download AND the price/product fetch used to happen *after* the open
// animation had already started — the panel would slide in empty, then the
// rows would pop in a beat later. That double-motion is the "stuck / ticks
// mid-open" feeling. Fix: warm the chunk and fetch the product data here, in
// the trigger, which stays mounted regardless of open state — by the time
// the sheet actually opens, the body's first render already has everything
// it needs, so nothing shifts after the animation starts.
const loadCartSheetBody = () => import("./cart-sheet-body");
const CartSheetBody = dynamic(
  () => loadCartSheetBody().then((m) => m.CartSheetBody),
  { ssr: false },
);

export function CartSheet() {
  const cart = useCartStore((state) => state.cart);
  const setCartQty = useCartStore((state) => state.setCartQty);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { campaign } = useCampaign();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const empty = cartCount === 0;
  // Control the sheet so successful checkout can close it.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Pre-fetch products whenever the cart itself changes (not when the sheet
  // opens), so the data is already sitting there by the time the user clicks.
  const [products, setProducts] = useState<Product[]>([]);
  const idsKey = cart.map((item) => item.id).join(",");
  const chunkWarmed = useRef(false);

  useEffect(() => {
    if (!idsKey) {
      setProducts([]);
      return;
    }
    if (!chunkWarmed.current) {
      chunkWarmed.current = true;
      loadCartSheetBody();
    }
    let active = true;
    getProductsByIdsAction(cart.map((item) => item.id)).then((list) => {
      if (active) setProducts(list);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

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
            className="size-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
          />

          {}
          <Badge
            aria-hidden
            className={cn(
              "pointer-events-none absolute -inset-e-1 -top-1 justify-center overflow-hidden rounded-full border-2 p-0 tabular-nums",
              "border-cream bg-navy text-gold-light text-[10px] font-black",
              "dark:border-navy-deep dark:bg-navy dark:text-gold-light",
              cartCount > 9 ? "h-5 min-w-5 px-1" : "size-5",
              empty && "hidden",
            )}
          >
            {/* تغییر تعداد سبد با یک انیمیشن کوتاه نمایش داده می‌شود. */}
            <motion.span
              key={cartCount}
              initial={{ y: 10, opacity: 0, scale: 0.4 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              {cartCount > 99 ? "+۹۹" : toFaDigits(cartCount)}
            </motion.span>
          </Badge>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        dir="rtl"
        showCloseButton={false}
        className={cn(PANEL, "flex w-[min(24rem,94vw)] flex-col")}
      >
        <CartSheetBody
          cart={cart}
          cartCount={cartCount}
          campaign={campaign}
          products={products}
          checkoutOpen={checkoutOpen}
          onCheckoutOpenChange={setCheckoutOpen}
          onQtyChange={setCartQty}
          onRemove={removeCartItem}
          onClear={clearCart}
          onCheckoutSuccess={() => {
            clearCart();
            setSheetOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

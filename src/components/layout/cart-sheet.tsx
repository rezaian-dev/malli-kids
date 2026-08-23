"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toFaDigits } from "@/lib/locale/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL } from "./header-styles";

// 🪶 The panel (line items, summary, checkout) loads only when the sheet
// opens — the header keeps just this trigger button in the initial bundle.
const CartSheetBody = dynamic(
  () => import("./cart-sheet-body").then((m) => m.CartSheetBody),
  { ssr: false },
);

export function CartSheet() {
  const { cart, cartCount, setCartQty, removeCartItem, clearCart, campaign } =
    useStore();
  const empty = cartCount === 0;
  // 🛍️ Controlled (not just `<SheetTrigger>` uncontrolled) so a successful
  // whole-cart checkout can close the sheet itself — see `onSuccess` below.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
              "pointer-events-none absolute -inset-e-1 -top-1 justify-center overflow-hidden rounded-full border-2 p-0 tabular-nums",
              "border-cream bg-navy text-gold text-[10px] font-black",
              "dark:border-navy-deep dark:bg-navy dark:text-gold-light",
              cartCount > 9 ? "h-5 min-w-5 px-1" : "size-5",
              empty && "hidden",
            )}
          >
            {/* 🎬 هر بار تعدادِ سبد عوض می‌شود، رقمِ جدید با یک فنرِ کوچک
                از پایین می‌جهد داخل — به جای پرشِ خشکِ متن. */}
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

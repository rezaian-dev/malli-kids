"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingBag, XIcon } from "lucide-react";
import { useCartStore } from "@/providers/cart-store-provider";
import { useCampaign } from "@/providers/campaign-provider";
import { toFaDigits } from "@/lib/locale/fa";
import { getProductsByIdsAction } from "@/lib/shop/products-actions";
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
import { CartEmptyState } from "./cart-empty-state";
import { cn } from "@/lib/utils";
import { ICON_BTN, PANEL, PANEL_HEAD } from "./header-styles";

// Keep the non-empty body and checkout flow out of the initial mobile bundle.
// Product data and the body chunk are warmed while the cart has items; an empty
// cart uses the lightweight static panel below and never waits for that chunk.
const loadCartSheetBody = () => import("./cart-sheet-body");
const CartSheetBody = dynamic(
  () => loadCartSheetBody().then((m) => m.CartSheetBody),
  {
    ssr: false,
    // Skeleton keeps the panel from opening empty while the chunk loads.
    loading: () => <CartBodyLoading />,
  },
);

// Shown inside the panel until the deferred body chunk is ready.
function CartBodyLoading() {
  return (
    <div className="flex h-full flex-col gap-4 p-4" aria-hidden>
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-32 rounded-full bg-sand dark:bg-dusk-soft" />
        <div className="h-3 w-48 rounded-full bg-sand dark:bg-dusk-soft" />
      </div>

      <div className="animate-pulse space-y-2.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-2xl border border-navy/8 bg-white p-2.5 sm:p-3 dark:border-gold/20 dark:bg-navy-mid/70"
          >
            <div className="size-16 shrink-0 rounded-xl bg-sand sm:size-20 dark:bg-dusk" />
            <div className="min-w-0 flex-1 space-y-2 py-1.5">
              <div className="h-3 w-2/3 rounded-full bg-sand dark:bg-dusk-soft" />
              <div className="h-2.5 w-1/3 rounded-full bg-sand dark:bg-dusk-soft" />
              <div className="h-5 w-24 rounded-full bg-sand dark:bg-dusk-soft" />
            </div>
          </div>
        ))}
      </div>

      <div className="animate-pulse mt-auto space-y-2">
        <div className="h-12 rounded-2xl bg-sand dark:bg-dusk-soft" />
        <div className="h-11 rounded-2xl bg-sand dark:bg-dusk-soft" />
      </div>
    </div>
  );
}

function CartEmptySheet() {
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
            className="rounded-full text-cream transition-transform duration-300 ease-out hover:scale-105 hover:bg-white/15 hover:text-gold-light"
          >
            <XIcon className="size-5 text-current" />
          </Button>
        </SheetClose>
        <SheetTitle className="text-cream flex items-center gap-2 text-start text-base font-black">
          <span className="bg-gold text-navy-deep grid size-9 place-items-center rounded-2xl">
            <ShoppingBag className="size-4.5" />
          </span>
          سبد خرید
        </SheetTitle>
        <SheetDescription className="text-gold-soft text-start text-[11px] font-bold">
          گالری ملی‌کیدز
        </SheetDescription>
      </SheetHeader>

      <CartEmptyState />

      <SheetFooter className="border-navy/10 dark:border-gold/20 gap-2 border-t px-5 py-4">
        <SheetClose asChild>
          <Button
            asChild
            className="h-11 w-full rounded-2xl bg-navy text-xs font-black text-cream hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light"
          >
            <Link href="/shop">
              مشاهدهٔ کالکشن <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </SheetClose>
      </SheetFooter>
    </>
  );
}

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
  const [productsReady, setProductsReady] = useState(true);
  const idsKey = cart.map((item) => item.id).join(",");
  const chunkWarmed = useRef(false);

  useEffect(() => {
    if (!idsKey) {
      setProducts([]);
      setProductsReady(true);
      return;
    }
    if (!chunkWarmed.current) {
      chunkWarmed.current = true;
      loadCartSheetBody();
    }
    setProductsReady(false);
    let active = true;
    getProductsByIdsAction(cart.map((item) => item.id))
      .then((list) => {
        if (active) setProducts(list);
      })
      .catch(() => {
        // Keep whatever is on screen; the next cart change retries.
      })
      .finally(() => {
        if (active) setProductsReady(true);
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
          onPointerDown={() => {
            if (!empty) loadCartSheetBody();
          }}
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
        {empty ? (
          <CartEmptySheet />
        ) : (
          <CartSheetBody
            cart={cart}
            cartCount={cartCount}
            campaign={campaign}
            products={products}
            productsReady={productsReady}
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
        )}
      </SheetContent>
    </Sheet>
  );
}
